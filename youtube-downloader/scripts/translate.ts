#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net --allow-env

/**
 * SRT 字幕翻译脚本（使用 GLM API + 智能断句）
 * 用法: deno run translate.ts <INPUT_SRT> <OUTPUT_SRT> [API_KEY]
 *
 * 环境变量:
 *   GLM_API_KEY - GLM API Key（可选，也可通过参数传入）
 */

interface SubtitleEntry {
  index: number;
  startTime: number;  // 毫秒
  endTime: number;    // 毫秒
  timecode: string;
  text: string;
}

interface GLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// ==================== SRT 解析与构建 ====================

function parseTimecode(timecode: string): { start: number; end: number } {
  const pattern = /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/;
  const match = timecode.match(pattern);
  if (!match) return { start: 0, end: 0 };

  const toMs = (h: string, m: string, s: string, ms: string) =>
    parseInt(h) * 3600000 + parseInt(m) * 60000 + parseInt(s) * 1000 + parseInt(ms);

  return {
    start: toMs(match[1], match[2], match[3], match[4]),
    end: toMs(match[5], match[6], match[7], match[8]),
  };
}

function formatTimecode(ms: number): string {
  const h = Math.floor(ms / 3600000).toString().padStart(2, "0");
  const m = Math.floor((ms % 3600000) / 60000).toString().padStart(2, "0");
  const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, "0");
  const millis = (ms % 1000).toString().padStart(3, "0");
  return `${h}:${m}:${s},${millis}`;
}

function parseSRT(content: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const blocks = content.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length >= 3) {
      const index = parseInt(lines[0]);
      const timecode = lines[1];
      const { start, end } = parseTimecode(timecode);
      const text = lines.slice(2).join("\n");
      entries.push({ index, startTime: start, endTime: end, timecode, text });
    }
  }

  return entries;
}

function buildSRT(entries: SubtitleEntry[]): string {
  return entries.map(entry =>
    `${entry.index}\n${entry.timecode}\n${entry.text}`
  ).join("\n\n") + "\n";
}

// ==================== 智能断句合并 ====================

interface SentenceEndMark {
  pattern: RegExp;
  language: string;
}

const SENTENCE_END_MARKS: SentenceEndMark[] = [
  // 英文结尾标点
  { pattern: /[.!?]\s*["']?$/, language: "en" },
  // 中文结尾标点
  { pattern: /[。！？]["']?$/, language: "zh" },
  // 省略号
  { pattern: /\.\.\.+$|…+$|。。。+$/, language: "en" },
];

function isSentenceEnd(text: string): boolean {
  return SENTENCE_END_MARKS.some(mark => mark.pattern.test(text.trim()));
}

function shouldMerge(prev: SubtitleEntry, curr: SubtitleEntry): boolean {
  // 规则 1: 时间间隔小于 300ms (0.3秒)
  const gap = curr.startTime - prev.endTime;
  if (gap < 0 || gap > 300) return false;

  // 规则 2: 前一句不是句子结尾
  if (isSentenceEnd(prev.text)) return false;

  // 规则 3: 合并后时长不超过 5 秒
  const mergedDuration = curr.endTime - prev.startTime;
  if (mergedDuration > 5000) return false;

  // 规则 4: 合并后文字长度合理（中文<40字，英文<150字符）
  const mergedLength = prev.text.length + curr.text.length;
  if (mergedLength > 150) return false;

  return true;
}

/**
 * 智能断句合并 - 避免一句话被分割成多段
 */
function smartMergeSegments(entries: SubtitleEntry[]): SubtitleEntry[] {
  if (entries.length === 0) return [];

  const merged: SubtitleEntry[] = [];
  let current = { ...entries[0] };

  for (let i = 1; i < entries.length; i++) {
    const next = entries[i];

    if (shouldMerge(current, next)) {
      // 合并到当前段落
      current.text += " " + next.text;
      current.endTime = next.endTime;
      current.timecode = `${formatTimecode(current.startTime)} --> ${formatTimecode(current.endTime)}`;
    } else {
      // 保存当前段落，开始新段落
      merged.push(current);
      current = { ...next };
    }
  }

  merged.push(current);

  // 重新编号
  return merged.map((entry, i) => ({ ...entry, index: i + 1 }));
}

// ==================== GLM API 翻译 ====================

function cleanText(text: string): string {
  return text
    .replace(/<[^>]+>/g, "") // 移除 HTML 标签
    .replace(/\{[^}]+\}/g, "") // 移除 {} 格式标签
    .replace(/\[[^\]]+\]/g, "") // 移除 [] 格式标签
    .replace(/♪|♫/g, "") // 移除音乐符号
    .trim();
}

async function translateWithGLM(
  texts: string[],
  apiKey: string,
  batchSize: number = 10
): Promise<string[]> {
  const results: string[] = [];

  // 分批翻译
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(texts.length / batchSize);

    console.log(`  🔄 批次 ${batchNum}/${totalBatches} (${batch.length} 条)...`);

    // 构建批量翻译提示
    const batchText = batch.map((t, idx) => `[${idx + 1}] ${t}`).join("\n");

    const messages: GLMMessage[] = [
      {
        role: "system",
        content: `你是一个专业的视频字幕翻译专家。你的任务是将英文字幕翻译成自然流畅的中文。

翻译要求：
1. 准确传达原意，不要逐字直译
2. 使用自然的口语化表达，符合中文表达习惯
3. 保留专业术语的准确性
4. 不要添加任何解释性文字
5. 每行翻译结果格式为：[序号] 翻译结果

请翻译以下字幕：`,
      },
      {
        role: "user",
        content: batchText,
      },
    ];

    try {
      const response = await fetch("https://open.bigmodel.cn/api/coding/paas/v4/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "glm-4.7",
          messages,
          temperature: 0.3,
          top_p: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GLM API 请求失败 (${response.status}): ${errorText}`);
      }

      const data: GLMResponse = await response.json();
      const content = data.choices[0]?.message?.content || "";

      // 解析批量翻译结果
      const translations = content
        .split("\n")
        .filter(line => line.trim())
        .map(line => {
          const match = line.match(/^\[\d+\]\s*(.+)$/);
          return match ? match[1].trim() : line.trim();
        });

      // 确保结果数量匹配
      while (translations.length < batch.length) {
        translations.push("");
      }

      results.push(...translations.slice(0, batch.length));

      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`  ❌ 批次 ${batchNum} 翻译失败:`, error);
      // 失败时返回原文
      results.push(...batch);
    }
  }

  return results;
}

// ==================== 时间轴自适应调整 ====================

/**
 * 根据译文长度调整时间轴
 * 中文通常比英文短，需要适当调整时间轴
 */
function adjustTimingForTranslation(
  entries: SubtitleEntry[],
  translatedTexts: string[]
): SubtitleEntry[] {
  return entries.map((entry, i) => {
    const translatedText = translatedTexts[i] || entry.text;
    const originalLength = entry.text.length;
    const translatedLength = translatedText.length;

    // 计算长度比率（中文通常更短）
    const ratio = translatedLength / originalLength;

    // 调整结束时间（最小 1 秒，最大不超过原时间的 1.5 倍）
    const originalDuration = entry.endTime - entry.startTime;
    let newDuration = originalDuration * ratio;
    newDuration = Math.max(1000, Math.min(newDuration, originalDuration * 1.5));

    return {
      ...entry,
      endTime: entry.startTime + newDuration,
      timecode: `${formatTimecode(entry.startTime)} --> ${formatTimecode(entry.startTime + newDuration)}`,
      text: translatedText,
    };
  });
}

// ==================== 主函数 ====================

async function main() {
  const args = Deno.args;
  if (args.length < 2) {
    console.error("用法: deno run translate.ts <INPUT_SRT> <OUTPUT_SRT> [API_KEY]");
    console.error("");
    console.error("参数说明:");
    console.error("  INPUT_SRT   - 输入的英文字幕 SRT 文件路径");
    console.error("  OUTPUT_SRT  - 输出的中文字幕 SRT 文件路径");
    console.error("  API_KEY     - GLM API Key（可选，也可设置 GLM_API_KEY 环境变量）");
    Deno.exit(1);
  }

  const [inputFile, outputFile, apiKeyParam] = args;

  // 获取 API Key
  const apiKey = apiKeyParam || Deno.env.get("GLM_API_KEY") || "";
  if (!apiKey) {
    console.error("❌ 错误: 未找到 GLM API Key");
    console.error("");
    console.error("请通过以下方式之一提供 API Key:");
    console.error("  1. 设置环境变量: export GLM_API_KEY=your_key");
    console.error("  2. 命令行参数: deno run translate.ts input.srt output.srt your_key");
    console.error("");
    console.error("获取 API Key:");
    console.error("  访问 https://open.bigmodel.cn/ 注册并获取 API Key");
    console.error("  新用户可获得免费额度");
    Deno.exit(1);
  }

  console.log(`📖 读取字幕: ${inputFile}`);

  const content = await Deno.readTextFile(inputFile);
  const entries = parseSRT(content);

  console.log(`📝 原始字幕: ${entries.length} 条`);

  // 步骤 1: 智能断句合并
  console.log(`🔧 智能断句合并...`);
  const mergedEntries = smartMergeSegments(entries);
  console.log(`   合并后: ${mergedEntries.length} 条`);

  // 步骤 2: 清理文本
  const cleanTexts = mergedEntries.map(e => cleanText(e.text));

  // 步骤 3: 批量翻译
  console.log(`🌐 调用 GLM API 翻译...`);
  const translatedTexts = await translateWithGLM(cleanTexts, apiKey);

  // 步骤 4: 时间轴自适应
  console.log(`⏱️  调整时间轴...`);
  const adjustedEntries = adjustTimingForTranslation(mergedEntries, translatedTexts);

  // 步骤 5: 保存结果
  console.log(`💾 保存翻译结果: ${outputFile}`);
  await Deno.writeTextFile(outputFile, buildSRT(adjustedEntries));

  console.log("\n✅ 翻译完成！");
  console.log(`\n📊 统计:`);
  console.log(`   原始条数: ${entries.length}`);
  console.log(`   合并后: ${mergedEntries.length}`);
  console.log(`   翻译完成: ${translatedTexts.filter(t => t).length}`);
}

main().catch(console.error);

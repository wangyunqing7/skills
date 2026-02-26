#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * SRT 字幕翻译脚本（使用 AI 翻译）
 * 用法: deno run translate.ts <INPUT_SRT> <OUTPUT_SRT>
 */

interface SubtitleEntry {
  index: number;
  timecode: string;
  text: string;
}

function parseSRT(content: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const blocks = content.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length >= 3) {
      const index = parseInt(lines[0]);
      const timecode = lines[1];
      const text = lines.slice(2).join("\n");
      entries.push({ index, timecode, text });
    }
  }

  return entries;
}

function buildSRT(entries: SubtitleEntry[]): string {
  return entries.map(entry =>
    `${entry.index}\n${entry.timecode}\n${entry.text}`
  ).join("\n\n") + "\n";
}

async function translateText(text: string): Promise<string> {
  // 移除 HTML 标签
  const cleanText = text.replace(/<[^>]+>/g, "");

  // 使用简化的翻译逻辑
  // 注意：实际使用时可以调用 Claude API 或其他翻译服务
  // 这里使用占位符，由 Claude 在执行时进行翻译
  return `[TRANSLATE: ${cleanText}]`;
}

async function main() {
  const args = Deno.args;
  if (args.length < 2) {
    console.error("用法: deno run translate.ts <INPUT_SRT> <OUTPUT_SRT>");
    Deno.exit(1);
  }

  const [inputFile, outputFile] = args;

  console.log(`📖 读取字幕: ${inputFile}`);

  const content = await Deno.readTextFile(inputFile);
  const entries = parseSRT(content);

  console.log(`📝 翻译 ${entries.length} 条字幕...`);

  const translatedEntries: SubtitleEntry[] = [];

  for (const entry of entries) {
    console.log(`  [${entry.index}/${entries.length}] ${entry.text.substring(0, 50)}...`);

    // 清理 HTML 标签并翻译
    const translatedText = await translateText(entry.text);

    translatedEntries.push({
      index: entry.index,
      timecode: entry.timecode,
      text: translatedText,
    });
  }

  console.log(`💾 保存翻译结果: ${outputFile}`);
  await Deno.writeTextFile(outputFile, buildSRT(translatedEntries));

  console.log("✅ 翻译完成！");
  console.log("\n⚠️  注意: 此脚本生成占位符翻译。");
  console.log("   请使用以下命令进行实际翻译：");
  console.log("   `claude: 翻译字幕文件 " + outputFile + " 为中文`");
}

main().catch(console.error);

#!/usr/bin/env -S deno run --allow-run --allow-read --allow-write

/**
 * 双语字幕烧录脚本
 * 用法: deno run burn.ts <OUTPUT_DIR>
 */

import { join } from "https://deno.land/std@0.208.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.208.0/fs/mod.ts";

async function createBilingualASS(
  enSrtPath: string,
  zhSrtPath: string,
  outputAssPath: string
): Promise<void> {
  const enContent = await Deno.readTextFile(enSrtPath);
  const zhContent = await Deno.readTextFile(zhSrtPath);

  interface SubEntry {
    index: number;
    start: string;
    end: string;
    text: string;
  }

  function parseSRT(content: string): SubEntry[] {
    const entries: SubEntry[] = [];
    const blocks = content.trim().split(/\n\s*\n/);

    for (const block of blocks) {
      const lines = block.trim().split("\n");
      if (lines.length >= 3) {
        const index = parseInt(lines[0]);
        const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
        if (timeMatch) {
          entries.push({
            index,
            start: timeMatch[1].replace(",", "."),
            end: timeMatch[2].replace(",", "."),
            text: lines.slice(2).join("\n"),
          });
        }
      }
    }
    return entries;
  }

  const enEntries = parseSRT(enContent);
  const zhEntries = parseSRT(zhContent);

  // 创建双语 ASS 字幕
  const assContent = `[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: English,Arial,36,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,2,1,2,10,10,20,1
Style: Chinese,Arial,36,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,2,1,2,10,10,50,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events: string[] = [];

  for (let i = 0; i < Math.min(enEntries.length, zhEntries.length); i++) {
    const en = enEntries[i];
    const zh = zhEntries[i];

    // 清理 SRT 文本标签并转换为 ASS 格式
    const cleanEnText = en.text
      .replace(/<[^>]+>/g, "")
      .replace(/\{[^}]+\}/g, "")
      .replace(/\n/g, "\\N");

    const cleanZhText = zh.text
      .replace(/<[^>]+>/g, "")
      .replace(/\{[^}]+\}/g, "")
      .replace(/\n/g, "\\N");

    // 英文字幕（上方）
    events.push(`Dialogue: 0,${en.start},${en.end},English,,0,0,0,,${cleanEnText}`);

    // 中文字幕（下方）
    events.push(`Dialogue: 0,${zh.start},${zh.end},Chinese,,0,0,0,,${cleanZhText}`);
  }

  await Deno.writeTextFile(outputAssPath, assContent + events.join("\n"));
}

async function main() {
  const args = Deno.args;
  if (args.length < 1) {
    console.error("用法: deno run burn.ts <OUTPUT_DIR>");
    Deno.exit(1);
  }

  const outputDir = args[0];

  const videoPath = join(outputDir, "video.mp4");
  const enSrtPath = join(outputDir, "en.srt");
  const zhSrtPath = join(outputDir, "zh.srt");
  const assPath = join(outputDir, "bilingual.ass");
  const outputPath = join(outputDir, "bilingual.mp4");

  console.log("🎬 生成双语字幕...");

  // 检查文件是否存在
  try {
    await Deno.stat(videoPath);
    await Deno.stat(enSrtPath);
    await Deno.stat(zhSrtPath);
  } catch {
    console.error("❌ 缺少必要的视频或字幕文件");
    Deno.exit(1);
  }

  // 创建双语 ASS 字幕
  console.log("📝 创建双语 ASS 字幕...");
  await createBilingualASS(enSrtPath, zhSrtPath, assPath);

  // 使用 ffmpeg 烧录字幕
  console.log("🔥 烧录字幕到视频...");
  const ffmpegCmd = new Deno.Command("ffmpeg", {
    args: [
      "-i", videoPath,
      "-vf", `ass=${assPath.replace(/\\/g, "/").replace(/:/g, "\\:")}`,
      "-c:a", "copy",
      "-y",
      outputPath,
    ],
    stdout: "piped",
    stderr: "piped",
  });

  const ffmpegProc = ffmpegCmd.spawn();
  const status = await ffmpegProc.status;

  if (!status.success) {
    console.error("❌ 视频处理失败");
    Deno.exit(1);
  }

  console.log("✅ 双语视频生成完成: " + outputPath);
  console.log("\n📁 输出文件:");
  console.log("   - video.mp4 (无字幕)");
  console.log("   - en.srt (英文字幕)");
  console.log("   - zh.srt (中文字幕)");
  console.log("   - bilingual.mp4 (双语视频)");
}

main().catch(console.error);

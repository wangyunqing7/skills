#!/usr/bin/env -S deno run --allow-run --allow-read --allow-write

/**
 * YouTube 视频和英文字幕下载脚本
 * 用法: deno run download.ts <YOUTUBE_URL> <OUTPUT_DIR>
 */

import { ensureDir } from "https://deno.land/std@0.208.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.208.0/path/mod.ts";

async function main() {
  const args = Deno.args;
  if (args.length < 2) {
    console.error("用法: deno run download.ts <YOUTUBE_URL> <OUTPUT_DIR>");
    Deno.exit(1);
  }

  const [url, outputDir] = args;

  // 确保输出目录存在
  await ensureDir(outputDir);

  console.log(`🎬 下载视频: ${url}`);
  console.log(`📁 输出目录: ${outputDir}`);

  // 获取视频信息
  const infoCmd = new Deno.Command("yt-dlp_x86.exe", {
    args: [
      "--print", "%(title)s",
      url,
    ],
    stdout: "piped",
    stderr: "piped",
  });

  const infoProc = infoCmd.spawn();
  const infoOutput = await infoProc.output();
  const title = new TextDecoder().decode(infoOutput.stdout).trim();

  console.log(`📝 视频标题: ${title}`);

  // 下载最高品质视频（无字幕）
  const videoCmd = new Deno.Command("yt-dlp_x86.exe", {
    args: [
      "-f", "bestvideo+bestaudio/best",
      "--merge-output-format", "mp4",
      "-o", join(outputDir, "video.%(ext)s"),
      url,
    ],
    stdout: "piped",
    stderr: "piped",
  });

  console.log("⬇️  下载视频...");
  const videoProc = videoCmd.spawn();
  const videoStatus = await videoProc.status;

  if (!videoStatus.success) {
    console.error("❌ 视频下载失败");
    Deno.exit(1);
  }

  // 下载英文字幕
  const subCmd = new Deno.Command("yt-dlp_x86.exe", {
    args: [
      "--write-subs",
      "--sub-lang", "en",
      "--sub-format", "srt",
      "--skip-download",
      "-o", join(outputDir, "video.%(ext)s"),
      url,
    ],
    stdout: "piped",
    stderr: "piped",
  });

  console.log("⬇️  下载英文字幕...");
  const subProc = subCmd.spawn();
  const subStatus = await subProc.status;

  if (!subStatus.success) {
    console.warn("⚠️  英文字幕下载失败或不存在");
  } else {
    // 重命名字幕文件为 en.srt
    const srtFiles = Array.from(Deno.readDirSync(outputDir))
      .filter(f => f.name.endsWith(".srt") || f.name.endsWith(".en.srt"));

    for (const file of srtFiles) {
      const oldPath = join(outputDir, file.name);
      const newPath = join(outputDir, "en.srt");
      await Deno.rename(oldPath, newPath);
      console.log("✅ 英文字幕已保存为 en.srt");
      break;
    }
  }

  console.log("✅ 下载完成！");
}

main().catch(console.error);

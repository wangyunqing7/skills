#!/usr/bin/env -S deno run --allow-run --allow-read --allow-write

/**
 * 通用视频下载脚本
 * 用法: deno run download.ts <VIDEO_URL> <OUTPUT_DIR>
 * 支持: YouTube, Bilibili, 抖音, Vimeo 等 1000+ 视频网站
 */

import { ensureDir } from "https://deno.land/std@0.208.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.208.0/path/mod.ts";

/**
 * 清理文件名，移除非法字符
 */
function sanitizeFilename(title: string): string {
  return title
    .replace(/[<>:"/\\|?*]/g, '')  // Windows 非法字符
    .replace(/\s+/g, '_')           // 空格替换为下划线
    .replace(/[^\w\s-]/g, '')       // 移除特殊字符（保留下划线）
    .substring(0, 200);             // 限制长度
}

async function main() {
  const args = Deno.args;
  if (args.length < 2) {
    console.error("用法: deno run download.ts <VIDEO_URL> <OUTPUT_DIR>");
    Deno.exit(1);
  }

  const [url, outputDir] = args;

  // 检查 yt-dlp 版本
  console.log("🔍 检查 yt-dlp...");
  const versionCmd = new Deno.Command("yt-dlp_x86.exe", {
    args: ["--version"],
    stdout: "piped",
    stderr: "piped",
  });

  try {
    const versionProc = versionCmd.spawn();
    const versionOutput = await versionProc.output();
    const version = new TextDecoder().decode(versionOutput.stdout).trim();

    if (!versionProc.status.success) {
      console.error("❌ yt-dlp 不可用，请先安装 yt-dlp");
      Deno.exit(1);
    }

    console.log(`✅ yt-dlp 版本: ${version.split('\n')[0]}`);
  } catch (error) {
    console.error("❌ 无法找到 yt-dlp_x86.exe，请确保已安装");
    Deno.exit(1);
  }

  // 确保输出目录存在
  await ensureDir(outputDir);

  console.log(`🎬 下载视频: ${url}`);
  console.log(`📁 输出目录: ${outputDir}`);

  // 获取视频信息
  console.log("📋 获取视频信息...");
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

  if (!infoProc.status.success) {
    console.error("❌ 无法获取视频信息");
    Deno.exit(1);
  }

  console.log(`📝 视频标题: ${title}`);

  // 清理文件名
  const sanitizedTitle = sanitizeFilename(title);
  console.log(`📁 清理后文件名: ${sanitizedTitle}`);

  // 下载最高品质视频
  const videoCmd = new Deno.Command("yt-dlp_x86.exe", {
    args: [
      "-f", "bestvideo+bestaudio/best",
      "--merge-output-format", "mp4",
      "-o", join(outputDir, `${sanitizedTitle}.%(ext)s`),
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

  console.log("✅ 下载完成！");
  console.log(`📁 文件位置: ${join(outputDir, `${sanitizedTitle}.mp4`)}`);
}

main().catch(console.error);

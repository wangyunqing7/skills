---
name: video-downloader
description: "通用视频下载工具。当用户提供视频链接（YouTube、Bilibili、抖音、Vimeo 等）并要求下载视频时使用此技能。功能：检查 yt-dlp 依赖，下载最高品质视频到用户目录的 Videos 文件夹。支持 1000+ 视频网站。"
---

# 通用视频下载

## 工作流程

当用户提供视频链接时，按以下顺序执行：

### 1. 检查依赖

检查 yt-dlp 是否可用：

```bash
yt-dlp_x86.exe --version
```

如果 yt-dlp 不可用，告知用户安装后再继续。

### 2. 创建输出目录

在 `~/Videos/` 下创建以视频标题命名的文件夹：

```bash
~/Videos/{sanitized_title}/
```

标题会被清理，移除 Windows 非法字符（`< > : " / \ | ? *`）。

### 3. 下载视频

执行脚本下载最高品质视频：

```bash
deno run --allow-run --allow-read --allow-write \
  "C:/Users/yunqing/.claude/skills/video-downloader/scripts/download.ts" \
  "<VIDEO_URL>" \
  "<OUTPUT_DIR>"
```

下载参数：
- `-f bestvideo+bestaudio/best`: 下载最高品质视频和音频
- `--merge-output-format mp4`: 合并为 MP4 格式
- 输出文件名：`{sanitized_title}.mp4`

### 4. 输出

输出单个视频文件：`{sanitized_title}.mp4`

## 脚本说明

### scripts/download.ts

通用视频下载脚本，支持 1000+ 视频网站。

功能：
- 检查 yt-dlp 版本
- 获取视频标题
- 清理文件名（移除非法字符）
- 下载最高品质 MP4 视频

## 技术细节

- **视频下载**: 使用 yt-dlp 获取最佳视频格式
- **文件命名**: 自动清理视频标题中的非法字符
- **输出格式**: MP4（自动合并视频和音频流）
- **支持网站**: YouTube, Bilibili, 抖音, Vimeo, Twitter 等 1000+ 网站

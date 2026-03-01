---
name: youtube-downloader
description: YouTube 视频下载与双语字幕处理工具。当用户提供 YouTube 链接并要求下载视频、处理字幕或生成双语视频时使用此技能。功能包括：(1) 检查依赖环境 (yt-dlp_x86, ffmpeg, deno)，(2) 下载最高品质视频，(3) 下载英文字幕，(4) AI 翻译英文字幕为中文，(5) 烧录双语字幕生成 MP4，(6) 在指定目录输出完整的视频文件夹（含无字幕视频、英文字幕、中文字幕、双语视频）
---

# YouTube 视频下载与双语字幕处理

## 工作流程

当用户提供 YouTube 链接时，按以下顺序执行：

### 1. 环境检查

首先检查以下依赖是否安装并可用：

```bash
# 检查 yt-dlp
yt-dlp_x86.exe --version

# 检查 ffmpeg
ffmpeg -version

# 检查 deno
deno --version
```

如果任何依赖缺失，告知用户安装后再继续。

### 2. 创建输出目录

在 `C:\Users\Yunqing72\Videos` 下创建以视频标题命名的文件夹。

### 3. 下载视频和字幕

执行脚本下载最高品质视频和英文字幕：

```bash
deno run --allow-run --allow-read --allow-write "C:/Users/Yunqing72/.claude/skills/youtube-downloader/scripts/download.ts" "<YOUTUBE_URL>" "<OUTPUT_DIR>"
```

### 4. 翻译字幕

使用 GLM API 将英文字幕翻译为中文。执行翻译脚本：

```bash
deno run --allow-read --allow-write --allow-net --allow-env "C:/Users/Yunqing72/.claude/skills/youtube-downloader/scripts/translate.ts" "<OUTPUT_DIR>/en.srt" "<OUTPUT_DIR>/zh.srt"
```

**GLM API 配置**：
- 获取 API Key：访问 https://open.bigmodel.cn/ 注册
- 新用户可获得免费额度（glm-4-flash 模型免费）
- 设置环境变量：`export GLM_API_KEY=your_key`
- 或通过命令行参数传入

**API 端点说明**：
- 通用用户：`https://open.bigmodel.cn/api/paas/v4/chat/completions`
- **Coding 套餐用户**（专属）：`https://open.bigmodel.cn/api/coding/paas/v4/chat/completions`
- 当前脚本已配置为 Coding 套餐端点

**翻译功能**：
- 智能断句合并：自动合并破碎的时间轴片段
- 时间轴自适应：根据译文长度调整显示时间
- 批量翻译：每次处理 10 条字幕，提高效率
- 自动清理：移除 HTML 标签、音乐符号等干扰内容

### 5. 生成双语视频

烧录双语字幕到视频：

```bash
deno run --allow-run --allow-read --allow-write "C:/Users/Yunqing72/.claude/skills/youtube-downloader/scripts/burn.ts" "<OUTPUT_DIR>"
```

### 6. 最终输出

输出文件夹应包含：

| 文件 | 说明 |
|------|------|
| `video.mp4` | 最高品质无字幕视频 |
| `en.srt` | 英文字幕 |
| `zh.srt` | AI 翻译的中文字幕 |
| `bilingual.mp4` | 带双语字幕的视频 |

## 脚本说明

### scripts/download.ts
下载视频和英文字幕到指定目录。

### scripts/translate.ts
使用 GLM API 将 SRT 字幕翻译为中文，包含智能断句合并和时间轴自适应功能。

### scripts/burn.ts
使用 ffmpeg 烧录双语字幕到视频。

## 技术细节

- **视频下载**: 使用 yt-dlp 获取最佳视频格式
- **字幕格式**: SRT 格式
- **字幕烧录**: ffmpeg ass 滤镜

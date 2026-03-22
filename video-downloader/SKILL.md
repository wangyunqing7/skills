---
name: video-downloader
description: "通用视频下载工具。当用户提供视频链接（YouTube、Bilibili、抖音、Vimeo 等）并要求下载视频时使用此技能。功能：检查 yt-dlp 依赖，下载最高品质视频到用户目录的 Videos 文件夹。支持 1000+ 视频网站。"
---

# 通用视频下载

## 工作流程

当用户提供视频链接时，按以下顺序执行：

### Step 1: 依赖检查与智能安装

首先检查 yt-dlp 是否可用：

```bash
# 尝试多种可能的命令名
yt-dlp --version
yt-dlp_x86.exe --version
yt-dlp.exe --version
```

#### 依赖缺失时的处理

如果所有命令都失败，**自动从 GitHub 学习安装方法**：

1. **获取官方安装指南**
   ```
   访问: https://github.com/yt-dlp/yt-dlp/wiki/Installation
   或 Releases: https://github.com/yt-dlp/yt-dlp/releases
   ```

2. **根据用户平台提供安装方案**

   **Windows:**
   - **方法一（推荐）**: 直接下载 exe
     - 访问 [yt-dlp Releases](https://github.com/yt-dlp/yt-dlp/releases) 获取最新版本
     - 下载 `yt-dlp.exe` 或 `yt-dlp_x86.exe`
     - 放到 PATH 中的任意目录（如 `C:\Windows\System32\` 或自定义目录）

   - **方法二**: 包管理器
     ```bash
     # winget
     winget install yt-dlp

     # Scoop
     scoop install yt-dlp

     # Chocolatey
     choco install yt-dlp
     ```

   - **方法三**: Python pip
     ```bash
     pip install -U "yt-dlp[default]"
     ```

   **Linux/macOS:**
   ```bash
   # 直接下载
   curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ~/.local/bin/yt-dlp
   chmod a+rx ~/.local/bin/yt-dlp

   # 或用 pip
   python3 -m pip install -U "yt-dlp[default]"
   ```

3. **等待用户安装完成后继续**

#### ffmpeg 依赖检查（可选）

如果需要合并视频和音频流，检查 ffmpeg：

```bash
ffmpeg -version
```

如果缺失，提示用户安装（大多数情况 yt-dlp 会自动处理）。

### Step 2: 创建输出目录

在 `~/Videos/` 下创建以视频标题命名的文件夹：

```bash
~/Videos/{sanitized_title}/
```

标题会被清理，移除 Windows 非法字符（`< > : " / \ | ? *`）。

### Step 3: 下载视频

**直接使用 yt-dlp 命令**（无需 Deno 或其他运行时）：

```bash
# 获取视频标题
yt-dlp --print "%(title)s" "<VIDEO_URL>"

# 下载最高品质视频
yt-dlp -f "bestvideo+bestaudio/best" \
  --merge-output-format mp4 \
  -o "~/Videos/{sanitized_title}/{sanitized_title}.%(ext)s" \
  "<VIDEO_URL>"
```

**下载参数说明：**
| 参数 | 作用 |
|------|------|
| `-f bestvideo+bestaudio/best` | 下载最高品质视频和音频 |
| `--merge-output-format mp4` | 合并为 MP4 格式 |
| `-o` | 指定输出文件名模板 |

### Step 4: 输出

输出单个视频文件：`{sanitized_title}.mp4`

## 支持的视频网站

- YouTube (包括 Shorts、直播)
- Bilibili
- 抖音/TikTok
- Vimeo
- Twitter/X
- Instagram
- 以及 1000+ 其他视频网站

## 技术细节

- **零外部依赖**: 不需要 Deno、Node.js 或其他运行时
- **原生执行**: 直接调用 yt-dlp 命令
- **智能检测**: 自动尝试多种命令名变体
- **自动修复**: 依赖缺失时自动获取官方安装指南

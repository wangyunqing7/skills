# Claude Skills Collection

这是一组为 Claude Code 创建的自定义 skills，扩展了 AI 的写作、分析和媒体处理能力。

## 📚 Skills 列表

### 1. deep-article-writer
**深度技术/概念文章写作 skill**

当你说"写一篇关于 XX 的文章"时触发。

**工作流程：**
1. 搜索官方文档和英文权威资料
2. 用苏格拉底提问挖掘本质问题
3. 用第一性原理从基本要素重建理解
4. 用费曼风格输出深入浅出的文章

**输出：** Markdown 格式文章，附带 Hugo frontmatter，保存到博客目录

**适用场景：** 技术教程、概念解释、深度分析文章

---

### 2. paper-analysis
**学术论文深度分析 pipeline**

给定论文 URL（arXiv、OpenReview、PubMed 等），自动完成：

1. 下载 PDF 并获取相关文章
2. 撰写通俗易懂的中文解读文章
3. 生成现代化的玻璃拟态单页 HTML 网站

**触发关键词：** "解读论文"、"分析这篇论文"、"analyze this paper"、"arXiv 链接"

---

### 3. youtube-downloader
**YouTube 视频下载与双语字幕处理工具**

一键下载 YouTube 视频，自动生成高质量双语字幕。

**核心功能：**
- 🎬 下载最高品质视频（yt-dlp）
- 📥 自动获取英文字幕
- 🤖 AI 智能翻译（支持 GLM API）
- 🔀 智能断句合并（避免一句话被分割）
- ⏱️ 时间轴自适应（根据译文长度调整）
- 🎨 双语字幕烧录（英上中下）

**AI 翻译特性：**
- 批量翻译处理，提高效率
- 自动清理 HTML 标签和音乐符号
- 支持多种 GLM 模型（glm-4-flash、glm-4-air、glm-4.7 等）
- 通用端点和 Coding 套餐端点自动适配

**输出文件：**
| 文件 | 说明 |
|------|------|
| `video.mp4` | 最高品质无字幕视频 |
| `en.srt` | 英文字幕 |
| `zh.srt` | AI 翻译的中文字幕 |
| `bilingual.mp4` | 带双语字幕的最终视频 |

**环境要求：**
```bash
# 必需依赖
yt-dlp_x86.exe  # 视频下载
ffmpeg          # 视频处理
deno            # TypeScript 运行时
```

**API 配置：**
需要 GLM API Key，访问 [智谱AI开放平台](https://open.bigmodel.cn/) 获取。

设置环境变量：
```bash
# PowerShell
$env:GLM_API_KEY = "your_api_key_here"

# CMD
set GLM_API_KEY=your_api_key_here
```

**工作流程：**
```bash
# 1. 下载视频和英文字幕
deno run --allow-run --allow-read --allow-write scripts/download.ts "<YOUTUBE_URL>" "<OUTPUT_DIR>"

# 2. AI 翻译字幕
deno run --allow-read --allow-write --allow-net --allow-env scripts/translate.ts "<OUTPUT_DIR>/en.srt" "<OUTPUT_DIR>/zh.srt"

# 3. 烧录双语字幕
deno run --allow-run --allow-read --allow-write scripts/burn.ts "<OUTPUT_DIR>"
```

---

## 🚀 如何使用

这些 skills 专为 Claude Code 设计。将 skill 目录放置到 Claude 的 skills 目录中，Claude 会自动识别并加载。

**默认 skills 目录：** `~/.claude/skills/`

**安装方式：**
```bash
# 复制 skill 到 Claude skills 目录
cp -r deep-article-writer ~/.claude/skills/
```

---

## 📖 Skills 原理

每个 skill 由以下部分组成：

```
skill-name/
├── SKILL.md          # 主文件：触发条件和工作流
└── references/       # 参考资料（可选）
    ├── guide-1.md
    └── guide-2.md
```

**SKILL.md** 包含：
- YAML frontmatter：name 和 description（用于触发判断）
- 工作流程指令
- 文章/输出格式要求

**Progressive Disclosure 设计：**
- SKILL.md 保持精简
- 详细指南放在 references/，按需加载
- 节省 token，提高效率

---

## 🛠️ 创建新 Skill

使用 `skill-creator` skill 来创建新的 skills：

```bash
python scripts/init_skill.py <skill-name> --path ~/.claude/skills/
```

编辑 SKILL.md 和 references/ 后，打包：

```bash
python scripts/package_skill.py ~/.claude/skills/<skill-name>
```

---

## 📝 许可证

这些 skills 专为个人使用设计，欢迎参考和修改。

---

## 🔗 相关资源

- [Claude Code Documentation](https://github.com/anthropics/claude-code)
- [Skill Creation Guide](https://github.com/anthropics/claude-code/tree/main/docs/skills)

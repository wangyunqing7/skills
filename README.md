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

### 3. video-downloader
**通用视频下载工具**

一键下载各类网站的高品质视频。

**支持网站：** YouTube、Bilibili、抖音、Vimeo、Twitter 等 1000+ 视频网站

**核心功能：**
- 🎬 下载最高品质视频（yt-dlp）
- 📁 自动创建以视频标题命名的文件夹
- 🧹 自动清理文件名中的非法字符
- 📦 输出 MP4 格式（自动合并视频和音频）

**环境要求：**
```bash
# 必需依赖
yt-dlp_x86.exe  # 视频下载
deno            # TypeScript 运行时
```

**输出文件：**
| 文件 | 说明 |
|------|------|
| `{title}.mp4` | 最高品质 MP4 视频 |

**工作流程：**
1. 检查 yt-dlp 依赖
2. 在 `~/Videos/{sanitized_title}/` 创建输出目录
3. 下载最高品质 MP4 视频

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

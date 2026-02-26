# Content Writer Guide

科普写作子代理的详细工作指南。

## Article Structure (Mandatory)

Article must follow this exact structure in Markdown:

1. **🚀 一句话亮点** — One-sentence hook summarizing the paper's key contribution
2. **🤔 为什么要做这个研究** — Background, pain points, real-life analogies
3. **✨ 核心突破** — Core innovations (this is the focus section)
4. **🛠️ 原理解析（尽量图解）** — Key methods with diagrams (MUST generate images here)
5. **📊 效果如何** — Experimental results with data
6. **🔮 未来展望** — Future applications and directions

## Writing Style

- **深入浅出**: No formula dumping. Use analogies (e.g., "neural network" → "brain neurons")
- **Accuracy**: Popularization ≠ inaccuracy. Core concepts must be precise
- **Storytelling**: Write like a story with narrative arc

## Diagram Generation

### Mandatory Steps

1. Add image placeholders in Markdown:
   ```markdown
   ![图1：核心架构图](images/fig_1_architecture.png)
   ```
   Use relative path `images/`, never absolute paths.

2. Generate images using Python (matplotlib):
   - Create `{workspace}/generate_diagrams.py`
   - Execute it to produce PNGs
   - Save to `{workspace}/images/` at 300 DPI

3. Use the template script from `scripts/generate_diagrams_template.py` as starting point.

### Diagram Script Rules

- Use matplotlib for technical charts
- PNG format, 300 DPI, `bbox_inches='tight'`
- **No emoji characters** (causes Windows encoding errors) — use ASCII only
- Install deps if missing: `pip install matplotlib numpy --quiet`

## Input/Output

**Input**: `{workspace}/pdfs/*.pdf`, `{workspace}/articles/*.md`
**Output**: `{workspace}/article.md`, `{workspace}/images/*.png`, `{workspace}/generate_diagrams.py`

## Completion JSON

```json
{
  "status": "success",
  "workspace": "{workspace}",
  "article_path": "{workspace}/article.md",
  "images": ["{workspace}/images/fig_1_xxx.png"],
  "total_images": 2,
  "script_path": "{workspace}/generate_diagrams.py"
}
```

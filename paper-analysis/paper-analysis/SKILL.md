---
name: paper-analysis
description: "Academic paper deep analysis pipeline. Given a paper URL (arXiv, OpenReview, PubMed, etc.), orchestrate a full pipeline: (1) download PDF and fetch related articles, (2) write an accessible Chinese explainer article with generated diagrams, (3) produce a modern glassmorphism single-page HTML website. Use when the user asks to analyze, explain, or visualize an academic paper, or when they provide a paper URL and want a comprehensive breakdown. Trigger phrases: '解读论文', '分析这篇论文', 'analyze this paper', 'paper URL', 'arXiv link'."
---

# Paper Analysis Pipeline

End-to-end pipeline: paper URL → PDF download → article writing → HTML website.

## Pipeline Overview

```
User provides paper URL
    ↓
Step 0: Extract metadata (title, authors, abstract, arXiv ID)
Step 1: Create isolated workspace directory
Step 2: Download PDF + fetch related articles        → references/resource-downloader.md
Step 3: Write explainer article + generate diagrams  → references/content-writer.md
Step 4: Generate glassmorphism HTML website           → references/web-designer.md
Step 5: Deliver results
```

## Step 0: Metadata Extraction

1. Identify platform (arXiv, OpenReview, PubMed, etc.)
2. Fetch paper page using `webfetch`
3. Extract: title, authors, abstract

## Step 1: Create Workspace

Generate standardized directory name:

```
paper_{sanitized_title}_{arxiv_id_no_dots}_{YYYYMMDD}
```

**Base path**: Papers are stored in `~/papers/` (user's home directory).

Full workspace path example:
```
~/papers/paper_{sanitized_title}_{arxiv_id_no_dots}_{YYYYMMDD}/
```

Concrete example:
```
/home/yunqing/papers/paper_attention_is_all_you_need_170603762_20250215/
```


**Title sanitization**: lowercase → remove special chars (keep `[a-z0-9_-]`) → spaces to underscores → truncate to first 5 words if >50 chars.

```python
import re
from datetime import datetime

def make_workspace_name(title, arxiv_id):
    t = re.sub(r'[^\w\s-]', '', title.lower()).replace(' ', '_')
    if len(t) > 50:
        t = '_'.join(t.split('_')[:5])
    ts = datetime.now().strftime("%Y%m%d")
    return f"paper_{t}_{arxiv_id.replace('.', '')}_{ts}"
```

Create directory structure:

```bash
mkdir -p "{workspace}/pdfs" "{workspace}/articles" "{workspace}/images"
```

## Step 2: Resource Download

Run `scripts/download_paper.sh` for arXiv papers, or follow manual download in [references/resource-downloader.md](references/resource-downloader.md).

```bash
bash scripts/download_paper.sh "https://arxiv.org/abs/XXXX.XXXXX" "{workspace}"
```

Then fetch 2-3 related articles (blog posts, explanations) into `{workspace}/articles/`.

## Step 3: Content Writing

Read the full guide: [references/content-writer.md](references/content-writer.md)

Key points:
- Read PDF + related articles
- Write `{workspace}/article.md` with 6 mandatory sections
- Generate diagrams using `scripts/generate_diagrams_template.py` as template
- Save diagrams to `{workspace}/images/`

## Step 4: Web Design

Read the full guide: [references/web-designer.md](references/web-designer.md)

Key points:
- Convert `article.md` → single self-contained `index.html`
- Use `assets/html_template.html` as skeleton
- 2026 glassmorphism style, dark mode default, particle background
- All CSS/JS inlined, zero CDN dependencies
- Image paths: relative `images/xxx.png`

## Step 5: Delivery

Report workspace path, HTML file path, and file statistics.

## Critical Rules

1. **Workspace isolation**: Each paper gets its own directory. Never share `output/`.
2. **Metadata first**: Never create workspace before extracting paper title.
3. **Sequential execution**: Complete each step before starting the next.
4. **Relative paths**: Images always use `images/xxx.png`, never absolute paths.
5. **Unix commands**: Use `mkdir -p`, `curl`, `ls` — never Windows commands.
6. **No emoji in scripts**: Matplotlib scripts must use ASCII only (Windows encoding).

## Bundled Resources

| Resource | Purpose |
|----------|---------|
| `scripts/download_paper.sh` | arXiv PDF download with retry logic |
| `scripts/generate_diagrams_template.py` | Matplotlib diagram generation template |
| `references/content-writer.md` | Article writing guide and structure |
| `references/resource-downloader.md` | PDF + article download strategies |
| `references/web-designer.md` | HTML generation guide and design specs |
| `assets/html_template.html` | Glassmorphism HTML skeleton with particles, theme toggle, TOC |

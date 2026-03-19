---
name: paper-analysis-v2
description: "Local academic paper analyzer. Given a local PDF file path, analyze the paper and generate a modern glassmorphism HTML website. No download or external article search needed. Use when user provides a local PDF and wants a comprehensive analysis. Trigger phrases: '分析本地论文', 'analyze this pdf', 'pdf file path'."
---

# Paper Analysis V2 - Local PDF Analyzer

Simplified pipeline: local PDF → article → HTML.

## Pipeline Overview

```
User provides local PDF path
    ↓
Step 1: Extract metadata (title, authors)
Step 2: Create workspace directory
Step 3: Read PDF and write article
Step 4: Generate HTML website
Step 5: Deliver results
```

## Step 1: Metadata Extraction

1. **Read PDF** using Read tool (supports PDF natively)
2. **Extract**: title, authors, abstract (from first few pages)
3. **Generate workspace name**: sanitized paper title only
   - lowercase → remove special chars (keep `[a-z0-9_-]`) → spaces to underscores

## Step 2: Create Workspace

**Base path**: Papers are stored in `~/papers/`

**Directory name**: Use sanitized paper title only

Full workspace path example:
```
~/papers/attention_is_all_you_need/
```

Create directory structure:
```bash
mkdir -p "{workspace}"
```

## Step 3: Content Writing

1. **Read full PDF** using Read tool (supports multi-page PDF)
2. **Write article**: `{workspace}/article.md` with the following structure:

   ```markdown
   # {论文标题}

   ## 摘要
   {论文摘要的中文解读}

   ## 背景与动机
   {为什么做这个研究，解决了什么问题}

   ## 核心方法
   {论文的主要方法、架构、算法}

   ## 关键创新
   {与现有工作的区别，创新点}

   ## 实验与结果
   {主要实验设置和结果}

   ## 结论与启示
   {论文贡献和实际应用价值}
   ```

## Step 4: Web Design

Convert `article.md` → single self-contained `index.html`:

1. **Use template**: `assets/html_template.html` as skeleton
2. **Style**: 2026 glassmorphism, dark mode default, particle background
3. **Requirements**:
   - All CSS/JS inlined, zero CDN dependencies
   - Responsive design
   - Theme toggle (dark/light)

## Step 5: Delivery

Report:
- Workspace path
- HTML file path
- File statistics

## Critical Rules

1. **Input validation**: Verify PDF file exists before processing
2. **Workspace isolation**: Each paper gets its own directory
3. **Sequential execution**: Complete each step before starting the next
4. **Unix commands**: Use `mkdir -p`, `ls` — never Windows commands

## Bundled Resources

| Resource | Purpose |
|----------|---------|
| `assets/html_template.html` | Glassmorphism HTML skeleton with particles, theme toggle, TOC |

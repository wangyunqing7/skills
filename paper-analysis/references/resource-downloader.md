# Resource Downloader Guide

资源采集子代理的详细工作指南。

## PDF Download Strategy

### By Platform

| Platform | Detection Pattern | Strategy |
|----------|-------------------|----------|
| arXiv | `arxiv.org` in URL | Replace `abs` → `pdf` in URL, append `.pdf` |
| OpenReview | `openreview.net` in URL | Find "Download PDF" link on page |
| PubMed | `pubmed.ncbi.nlm.nih.gov` in URL | Locate full-text PDF link |
| Direct PDF | URL ends with `.pdf` or contains `/pdf/` | Direct download |
| Local File | File exists on filesystem | Copy to workspace |
| Other | Any other HTTP/HTTPS URL | Search page for PDF link |

### arXiv Example

```bash
# URL: https://arxiv.org/abs/1706.03762
# PDF: https://arxiv.org/pdf/1706.03762.pdf
curl -L "https://arxiv.org/pdf/1706.03762.pdf" -o {workspace}/pdfs/paper_1706.03762.pdf
```

### File Naming

Save to `{workspace}/pdfs/paper_{platform}_{id}.pdf`

Where `{platform}` is: `arxiv` (uses arXiv ID), `pdf` (timestamp), `local` (filename), `paper` (timestamp).

Examples:
- arXiv: `paper_1706.03762.pdf`
- Direct PDF: `paper_pdf_1234567890.pdf`
- Local: `paper_my_research_paper.pdf`

## Related Article Collection

After PDF download:

1. **Extract** paper title and authors from PDF or web page
2. **Search sources**:
   - Google Scholar / Semantic Scholar — high-citation reviews
   - Medium (Towards Data Science) — popular explanations
   - GitHub READMEs — implementation notes
   - 知乎专栏 — Chinese explanations
3. **Fetch** article content, strip ads/comments/noise
4. **Save** to `{workspace}/articles/related_01.md`, `related_02.md`, etc.

## Tools

- `web.fetch` or `curl`/`wget` for downloads
- `mkdir -p {workspace}/pdfs/ {workspace}/articles/` if dirs don't exist
- Use the helper script `scripts/download_paper.sh` for all paper types

### Using download_paper.sh

```bash
# arXiv paper (backward compatible)
bash scripts/download_paper.sh "https://arxiv.org/abs/1706.03762" "{workspace}"

# Direct PDF URL
bash scripts/download_paper.sh "https://example.com/paper.pdf" "{workspace}"

# Local PDF file
bash scripts/download_paper.sh "/path/to/local.pdf" "{workspace}"

# Optional: provide paper title for better filename
bash scripts/download_paper.sh "https://example.com/paper.pdf" "{workspace}" "My Paper Title"
```

The script outputs:
- `PAPER_ID`: Unique identifier for the paper
- `OUTPUT_FILE`: Full path to downloaded/copied PDF
- `INPUT_TYPE`: Detected input type (arxiv, direct_pdf, local)

## Completion JSON

```json
{
  "status": "success",
  "workspace": "{workspace}",
  "paper_path": "{workspace}/pdfs/paper_xxx.pdf",
  "articles_paths": ["{workspace}/articles/related_01.md"],
  "total_files": 4
}
```

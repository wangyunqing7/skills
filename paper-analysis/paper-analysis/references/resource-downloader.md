# Resource Downloader Guide

资源采集子代理的详细工作指南。

## PDF Download Strategy

### By Platform

| Platform | Strategy |
|----------|----------|
| arXiv | Replace `abs` → `pdf` in URL, append `.pdf` |
| OpenReview | Find "Download PDF" link on page |
| PubMed | Locate full-text PDF link |
| IEEE | Find PDF download button |
| Other | Search page for PDF link |

### arXiv Example

```bash
# URL: https://arxiv.org/abs/1706.03762
# PDF: https://arxiv.org/pdf/1706.03762.pdf
curl -L "https://arxiv.org/pdf/1706.03762.pdf" -o {workspace}/pdfs/paper_1706.03762.pdf
```

### File Naming

Save to `{workspace}/pdfs/paper_{arxiv_id_or_date}.pdf`

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
- Use the helper script `scripts/download_paper.sh` for arXiv papers

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

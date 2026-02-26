#!/usr/bin/env bash
# Paper Analysis - arXiv PDF Downloader
#
# Usage: bash download_paper.sh <arxiv_url> <workspace_dir>
# Example: bash download_paper.sh https://arxiv.org/abs/1706.03762 paper_attention_170603762_20250215

set -euo pipefail

URL="${1:?Usage: download_paper.sh <arxiv_url> <workspace_dir>}"
WORKSPACE="${2:?Usage: download_paper.sh <arxiv_url> <workspace_dir>}"

# Extract arXiv ID from URL
ARXIV_ID=$(echo "$URL" | grep -oP '(\d{4}\.\d{4,5}(v\d+)?)')
if [ -z "$ARXIV_ID" ]; then
    echo "[ERROR] Could not extract arXiv ID from: $URL"
    exit 1
fi

# Construct PDF URL
PDF_URL="https://arxiv.org/pdf/${ARXIV_ID}.pdf"

# Create directories
mkdir -p "${WORKSPACE}/pdfs" "${WORKSPACE}/articles" "${WORKSPACE}/images"

# Download PDF
OUTPUT_FILE="${WORKSPACE}/pdfs/paper_${ARXIV_ID}.pdf"
echo "[INFO] Downloading: ${PDF_URL}"
echo "[INFO] Saving to: ${OUTPUT_FILE}"

if command -v curl &>/dev/null; then
    curl -L --retry 3 --retry-delay 2 -o "${OUTPUT_FILE}" "${PDF_URL}"
elif command -v wget &>/dev/null; then
    wget --tries=3 --waitretry=2 -O "${OUTPUT_FILE}" "${PDF_URL}"
else
    echo "[ERROR] Neither curl nor wget found"
    exit 1
fi

# Verify download
if [ -f "${OUTPUT_FILE}" ] && [ -s "${OUTPUT_FILE}" ]; then
    SIZE=$(du -h "${OUTPUT_FILE}" | cut -f1)
    echo "[SUCCESS] Downloaded paper_${ARXIV_ID}.pdf (${SIZE})"
else
    echo "[ERROR] Download failed or file is empty"
    exit 1
fi

#!/usr/bin/env bash
# Paper Analysis - Universal PDF Downloader
#
# Usage: bash download_paper.sh <input> <workspace_dir> [paper_title]
#   input: arxiv_url | direct_pdf_url | local_pdf_path
#   workspace_dir: output directory path
#   paper_title: optional, helps generate better filename for non-arXiv papers
#
# Examples:
#   bash download_paper.sh "https://arxiv.org/abs/1706.03762" "/tmp/ws"
#   bash download_paper.sh "https://example.com/paper.pdf" "/tmp/ws"
#   bash download_paper.sh "/path/to/local.pdf" "/tmp/ws"

set -euo pipefail

INPUT="${1:?Usage: download_paper.sh <input> <workspace_dir> [paper_title]}"
WORKSPACE="${2:?Usage: download_paper.sh <input> <workspace_dir> [paper_title]}"
PAPER_TITLE="${3:-}"

# Global variables for detected info
INPUT_TYPE=""
PAPER_ID=""
ARXIV_ID=""

# Detect input type and generate paper ID
detect_input_type() {
    # Check if it's a local file
    if [[ -f "$INPUT" ]]; then
        INPUT_TYPE="local"
        PAPER_ID=$(basename "$INPUT" .pdf | sed 's/[^a-zA-Z0-9_-]/_/g')
        echo "[INFO] Detected: local PDF file"
        return 0
    fi

    # Check if it's a URL
    if [[ "$INPUT" =~ ^https?:// ]]; then
        # Check for arXiv
        if [[ "$INPUT" =~ arxiv\.org ]]; then
            INPUT_TYPE="arxiv"
            ARXIV_ID=$(echo "$INPUT" | grep -oP '(\d{4}\.\d{4,5}(v\d+)?)' || echo "")
            if [[ -n "$ARXIV_ID" ]]; then
                PAPER_ID="arxiv_${ARXIV_ID//./_}"
                echo "[INFO] Detected: arXiv paper ($ARXIV_ID)"
                return 0
            fi
        fi

        # Check for direct PDF URL (ends with .pdf or contains /pdf/)
        if [[ "$INPUT" =~ \.pdf$ ]] || [[ "$INPUT" =~ /pdf/ ]]; then
            INPUT_TYPE="direct_pdf"
            PAPER_ID="pdf_$(date +%s)"
            echo "[INFO] Detected: direct PDF URL"
            return 0
        fi

        # Generic URL - will be handled as direct download attempt
        INPUT_TYPE="generic_url"
        PAPER_ID="paper_$(date +%s)"
        echo "[INFO] Detected: generic URL (will attempt direct download)"
        return 0
    fi

    echo "[ERROR] Unrecognized input: $INPUT"
    echo "[ERROR] Expected: URL or local PDF file path"
    exit 1
}

# Download using available tool
download_file() {
    local url="$1"
    local output="$2"

    if command -v curl &>/dev/null; then
        curl -L --retry 3 --retry-delay 2 -o "$output" "$url"
    elif command -v wget &>/dev/null; then
        wget --tries=3 --waitretry=2 -O "$output" "$url"
    else
        echo "[ERROR] Neither curl nor wget found"
        exit 1
    fi
}

# Create directories
mkdir -p "${WORKSPACE}/pdfs" "${WORKSPACE}/articles" "${WORKSPACE}/images"

# Detect input type
detect_input_type

# Process based on input type
case "$INPUT_TYPE" in
    "local")
        OUTPUT_FILE="${WORKSPACE}/pdfs/paper_${PAPER_ID}.pdf"
        echo "[INFO] Copying local file..."
        cp "$INPUT" "${OUTPUT_FILE}"
        ;;

    "arxiv")
        if [[ -z "$ARXIV_ID" ]]; then
            echo "[ERROR] Could not extract arXiv ID from: $INPUT"
            exit 1
        fi
        PDF_URL="https://arxiv.org/pdf/${ARXIV_ID}.pdf"
        OUTPUT_FILE="${WORKSPACE}/pdfs/paper_${ARXIV_ID}.pdf"
        echo "[INFO] Downloading from: ${PDF_URL}"
        download_file "$PDF_URL" "$OUTPUT_FILE"
        ;;

    "direct_pdf"|"generic_url")
        OUTPUT_FILE="${WORKSPACE}/pdfs/paper_${PAPER_ID}.pdf"
        echo "[INFO] Downloading from: ${INPUT}"
        download_file "$INPUT" "$OUTPUT_FILE"
        ;;

    *)
        echo "[ERROR] Unsupported input type: $INPUT_TYPE"
        exit 1
        ;;
esac

# Verify result
if [[ -f "${OUTPUT_FILE}" ]] && [[ -s "${OUTPUT_FILE}" ]]; then
    SIZE=$(du -h "${OUTPUT_FILE}" | cut -f1)
    echo "[SUCCESS] Processed: $(basename "${OUTPUT_FILE}") (${SIZE})"
    # Output for parsing by caller
    echo "PAPER_ID=${PAPER_ID}"
    echo "OUTPUT_FILE=${OUTPUT_FILE}"
    echo "INPUT_TYPE=${INPUT_TYPE}"
else
    echo "[ERROR] Processing failed or file is empty"
    exit 1
fi

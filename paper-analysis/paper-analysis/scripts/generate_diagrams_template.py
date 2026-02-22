#!/usr/bin/env python3
"""
Paper Analysis - Diagram Generation Template

Usage:
    1. Copy this template to {workspace}/generate_diagrams.py
    2. Customize generate_fig_N() functions for the specific paper
    3. Run: python3 generate_diagrams.py

Requirements: pip install matplotlib numpy --quiet
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os
import sys


def setup():
    """Create output directory and configure matplotlib."""
    os.makedirs("images", exist_ok=True)
    plt.rcParams.update(
        {
            "figure.facecolor": "white",
            "axes.facecolor": "white",
            "font.size": 12,
            "font.family": "sans-serif",
        }
    )


def generate_fig_1_architecture():
    """Figure 1: Model Architecture Diagram.

    Customize this function for the specific paper's architecture.
    """
    fig, ax = plt.subplots(1, 1, figsize=(12, 8))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis("off")

    # Example: draw boxes for architecture components
    components = [
        {"xy": (1, 7), "w": 3, "h": 2, "label": "Input Layer", "color": "#E3F2FD"},
        {"xy": (1, 4), "w": 3, "h": 2, "label": "Hidden Layer", "color": "#BBDEFB"},
        {"xy": (1, 1), "w": 3, "h": 2, "label": "Output Layer", "color": "#90CAF9"},
    ]

    for comp in components:
        rect = patches.FancyBboxPatch(
            comp["xy"],
            comp["w"],
            comp["h"],
            boxstyle="round,pad=0.1",
            facecolor=comp["color"],
            edgecolor="#1565C0",
            linewidth=2,
        )
        ax.add_patch(rect)
        ax.text(
            comp["xy"][0] + comp["w"] / 2,
            comp["xy"][1] + comp["h"] / 2,
            comp["label"],
            ha="center",
            va="center",
            fontsize=14,
            fontweight="bold",
        )

    # Arrows between components
    for y_start, y_end in [(7, 6.1), (4, 3.1)]:
        ax.annotate(
            "",
            xy=(2.5, y_end),
            xytext=(2.5, y_start),
            arrowprops=dict(arrowstyle="->", lw=2, color="#1565C0"),
        )

    ax.set_title("Model Architecture", fontsize=18, fontweight="bold", pad=20)
    plt.savefig("images/fig_1_architecture.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("[OK] Generated fig_1_architecture.png")


def generate_fig_2_results():
    """Figure 2: Experimental Results Comparison.

    Customize metrics and labels for the specific paper.
    """
    fig, ax = plt.subplots(1, 1, figsize=(10, 6))

    # Example: bar chart comparing methods
    methods = ["Baseline A", "Baseline B", "Proposed"]
    scores = [78.5, 82.3, 91.7]
    colors = ["#90CAF9", "#90CAF9", "#1565C0"]

    bars = ax.bar(methods, scores, color=colors, edgecolor="white", linewidth=2)
    ax.set_ylabel("Accuracy (%)", fontsize=14)
    ax.set_title("Performance Comparison", fontsize=16, fontweight="bold")
    ax.set_ylim(0, 100)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)

    # Add value labels on bars
    for bar, score in zip(bars, scores):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 1,
            f"{score}%",
            ha="center",
            va="bottom",
            fontweight="bold",
        )

    plt.savefig("images/fig_2_results.png", dpi=300, bbox_inches="tight")
    plt.close()
    print("[OK] Generated fig_2_results.png")


if __name__ == "__main__":
    print("[INFO] Generating diagrams...")
    setup()
    generate_fig_1_architecture()
    generate_fig_2_results()
    print("[SUCCESS] All diagrams generated!")

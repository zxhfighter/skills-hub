#!/usr/bin/env python3
"""
Generate line charts from time series data using matplotlib.

Usage:
    python generate_chart.py \
        --title "Price Trend" \
        --ylabel "Price (CNY)" \
        --data "2025-12-12:1490,2025-12-13:1580,2025-12-24:1600" \
        --output chart.png
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

try:
    import matplotlib
    import matplotlib.pyplot as plt
    import matplotlib.dates as mdates
    import numpy as np
except ImportError:
    print("Error: matplotlib is required. Install with: pip install matplotlib")
    sys.exit(1)

# Configure matplotlib to support Chinese characters
plt.rcParams['font.sans-serif'] = ['WenQuanYi Micro Hei', 'SimHei', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False


def parse_data(data_str):
    """Parse data string in format 'date1:value1,date2:value2,...'"""
    points = []
    for item in data_str.split(','):
        item = item.strip()
        if ':' not in item:
            continue
        date_str, value_str = item.split(':', 1)
        try:
            date = datetime.strptime(date_str.strip(), "%Y-%m-%d")
            value = float(value_str.strip())
            points.append((date, value))
        except ValueError:
            print(f"Warning: Could not parse '{item}', skipping")
            continue
    return points


def generate_chart(data, title, xlabel, ylabel, output_path, width=14, height=7,
                 show_grid=True, show_markers=True, annotations=None, reference_lines=None):
    """
    Generate a line chart.

    Args:
        data: List of (date, value) tuples
        title: Chart title
        xlabel: X-axis label
        ylabel: Y-axis label
        output_path: Path to save the chart
        width: Chart width in inches
        height: Chart height in inches
        show_grid: Whether to show grid lines
        show_markers: Whether to show data point markers
        annotations: List of (date, value, text) tuples to annotate
        reference_lines: List of (value, color, label) tuples for horizontal reference lines
    """
    if not data:
        print("Error: No valid data points provided")
        return False

    # Extract dates and values
    dates, values = zip(*data)

    # Create figure
    plt.figure(figsize=(width, height))

    # Plot line
    plt.plot(dates, values, 'o-', linewidth=2, markersize=6, color='#1f77b4',
             label='Data')

    # Add annotations if provided
    if annotations:
        for ann_date, ann_value, ann_text in annotations:
            plt.annotate(ann_text,
                       xy=(ann_date, ann_value),
                       xytext=(10, 20), textcoords='offset points',
                       fontsize=9, color='darkred',
                       arrowprops=dict(arrowstyle='->', color='darkred', lw=1),
                       bbox=dict(boxstyle='round,pad=0.3', facecolor='white',
                                edgecolor='darkred', alpha=0.8))

    # Add reference lines if provided
    if reference_lines:
        for ref_value, ref_color, ref_label in reference_lines:
            plt.axhline(y=ref_value, color=ref_color, linestyle='--',
                        linewidth=1, alpha=0.5, label=ref_label)

    # Set title and labels
    plt.title(title, fontsize=14, fontweight='bold', pad=20)
    plt.xlabel(xlabel, fontsize=12)
    plt.ylabel(ylabel, fontsize=12)

    # Set Y-axis range with some padding
    y_min, y_max = min(values), max(values)
    y_range = y_max - y_min
    if y_range == 0:
        y_range = 1
    plt.ylim(y_min - y_range * 0.05, y_max + y_range * 0.1)

    # Add grid
    if show_grid:
        plt.grid(True, linestyle='--', alpha=0.7)

    # Format X-axis dates
    ax = plt.gca()
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%m-%d'))
    ax.xaxis.set_major_locator(mdates.WeekdayLocator(byweekday=mdates.MO, interval=1))
    plt.xticks(rotation=45, ha='right')

    # Add legend if we have reference lines
    if reference_lines:
        plt.legend(loc='upper left', fontsize=10)

    # Adjust layout and save
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    print(f"Chart saved to: {output_path}")
    return True


def main():
    parser = argparse.ArgumentParser(
        description='Generate line charts from time series data',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Simple chart
  %(prog)s --title "Price Trend" --ylabel "Price" --data "2025-12-01:100,2025-12-02:105" -o chart.png

  # With annotations and reference lines
  %(prog)s --title "Stock Price" --ylabel "CNY" \\
    --data "2025-12-01:100,2025-12-05:110,2025-12-10:105" \\
    --annotations '{"items": [{"date": "2025-12-05", "value": 110, "text": "Peak"}]}' \\
    --reference-lines '[{"value": 100, "color": "red", "label": "Baseline"}]' \\
    -o chart.png

  # Read data from JSON file
  %(prog)s --data-file data.json -o chart.png
        """
    )

    parser.add_argument('--title', required=True, help='Chart title')
    parser.add_argument('--xlabel', default='Date', help='X-axis label (default: Date)')
    parser.add_argument('--ylabel', required=True, help='Y-axis label')
    parser.add_argument('--data', help='Data in format "date1:value1,date2:value2,..." (use --data-file for JSON)')
    parser.add_argument('--data-file', help='Path to JSON file with data')
    parser.add_argument('-o', '--output', required=True, help='Output file path')
    parser.add_argument('--width', type=int, default=14, help='Chart width in inches (default: 14)')
    parser.add_argument('--height', type=int, default=7, help='Chart height in inches (default: 7)')
    parser.add_argument('--no-grid', action='store_true', help='Disable grid lines')
    parser.add_argument('--no-markers', action='store_true', help='Disable data point markers')
    parser.add_argument('--annotations', help='JSON string with annotations (see examples)')
    parser.add_argument('--reference-lines', help='JSON string with reference lines (see examples)')

    args = parser.parse_args()

    # Parse data
    if args.data_file:
        with open(args.data_file, 'r') as f:
            data_json = json.load(f)
            data = [(datetime.strptime(d['date'], '%Y-%m-%d'), float(d['value']))
                    for d in data_json]
    elif args.data:
        data = parse_data(args.data)
    else:
        parser.error("Either --data or --data-file is required")

    # Parse annotations
    annotations = None
    if args.annotations:
        ann_json = json.loads(args.annotations)
        annotations = [(datetime.strptime(a['date'], '%Y-%m-%d'), float(a['value']), a['text'])
                     for a in ann_json.get('items', [])]

    # Parse reference lines
    ref_lines = None
    if args.reference_lines:
        ref_json = json.loads(args.reference_lines)
        ref_lines = [(float(r['value']), r.get('color', 'red'), r.get('label', ''))
                    for r in ref_json]

    # Generate chart
    success = generate_chart(
        data=data,
        title=args.title,
        xlabel=args.xlabel,
        ylabel=args.ylabel,
        output_path=args.output,
        width=args.width,
        height=args.height,
        show_grid=not args.no_grid,
        show_markers=not args.no_markers,
        annotations=annotations,
        reference_lines=ref_lines
    )

    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()

---
name: line-chart-generator
description: Generate line charts and time-series visualizations using matplotlib. Use when users need to create line charts for price trends, stock data, performance metrics, or any time-series data. Supports annotations, reference lines, and customization of chart dimensions.
---

# Line Chart Generator

Generate professional line charts for time-series data with minimal effort.

## Quick Start

### Basic Chart

Generate a simple line chart from data points:

```bash
python scripts/generate_chart.py \
  --title "Stock Price Trend" \
  --xlabel "Date" \
  --ylabel "Price (CNY)" \
  --data "2025-12-01:100,2025-12-05:110,2025-12-10:105" \
  -o chart.png
```

### Chart with Annotations

Add annotations to highlight key events:

```bash
python scripts/generate_chart.py \
  --title "Revenue Growth" \
  --xlabel "Date" \
  --ylabel "Revenue (M)" \
  --data "2025-01-01:10,2025-02-01:15,2025-03-01:20" \
  --annotations '{"items": [{"date": "2025-02-01", "value": 15, "text": "Q1 Milestone"}]}' \
  -o chart.png
```

### Chart with Reference Lines

Add horizontal reference lines (e.g., target values, baselines):

```bash
python scripts/generate_chart.py \
  --title "Performance Metrics" \
  --ylabel "Score" \
  --data "2025-01-01:80,2025-02-01:85,2025-03-01:90" \
  --reference-lines '[{"value": 100, "color": "green", "label": "Target"}]' \
  -o chart.png
```

### Using JSON Data File

For large datasets, use a JSON file:

**data.json:**

```json
[
  { "date": "2025-12-01", "value": 100 },
  { "date": "2025-12-05", "value": 110 },
  { "date": "2025-12-10", "value": 105 }
]
```

```bash
python scripts/generate_chart.py \
  --title "Price Trend" \
  --ylabel "Price" \
  --data-file data.json \
  -o chart.png
```

## Chart Customization

### Dimensions

Adjust chart size:

```bash
--width 16 --height 8
```

### Grid and Markers

Disable grid or data point markers:

```bash
--no-grid --no-markers
```

### Annotations Format

Annotations as JSON string:

```json
{
  "items": [
    { "date": "2025-12-05", "value": 110, "text": "Peak price" },
    { "date": "2025-12-10", "value": 90, "text": "Dip" }
  ]
}
```

### Reference Lines Format

Reference lines as JSON string:

```json
[
  { "value": 100, "color": "red", "label": "Baseline" },
  { "value": 150, "color": "green", "label": "Target" }
]
```

## Data Format

Data points use format: `YYYY-MM-DD:VALUE`

- Dates must be in ISO format (YYYY-MM-DD)
- Values must be numeric
- Multiple points separated by commas
- No spaces around the colon

**Valid examples:**

- `2025-12-01:100`
- `2026-01-15:1715`
- `2025-03-30:2500.5`

**Invalid examples:**

- `12/01/2025:100` (wrong date format)
- `2025-12-01: $100` (no currency symbols)
- `2025 12 01:100` (wrong separator)

## Requirements

- Python 3.x
- matplotlib: Install with `pip install matplotlib`

## Output

Charts are saved as PNG files at 150 DPI with transparent backgrounds suitable for presentations and reports.

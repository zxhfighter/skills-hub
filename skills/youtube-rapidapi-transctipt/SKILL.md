---
name: youtube-rapidapi-transcript
description: Extract transcripts from YouTube videos. Use when the user asks for a Youtube video transcript, subtitles, or captions of a YouTube video and provides a YouTube URL (youtube.com/watch?v=, youtu.be/, or similar).
---

# youtube-rapidapi-transcript

Extract transcripts from YouTube videos using the RapidAPI YouTube Transcript API.

## Features

- Extract video transcripts from YouTube URLs or video IDs
- Support for multiple output formats: text, JSON, and SRT subtitles
- Automatic video ID extraction from various YouTube URL formats
- Save transcripts to files or output to terminal
- Language selection support

## Usage

### Basic Usage

```bash
# Extract transcript from YouTube URL
python scripts/youtube_transcript.py "https://www.youtube.com/watch?v=VIDEO_ID"

# Extract transcript using video ID directly
python scripts/youtube_transcript.py "VIDEO_ID"
```

### Output Formats

```bash
# JSON format
python scripts/youtube_transcript.py VIDEO_ID -f json

# SRT subtitle format
python scripts/youtube_transcript.py VIDEO_ID -f srt

# Save to file
python scripts/youtube_transcript.py VIDEO_ID -o transcript.txt
```

### Command Line Options

- `-f, --format`: Output format (text, json, srt) - default: text
- `-o, --output`: Output file path (default: stdout)
- `-l, --language`: Language code (e.g., en, es, fr)

## Setup

1. Install dependencies:
   ```bash
   pip install -r scripts/requirements.txt
   ```

2. Create a `.env` file based on `.env.example` and add your RapidAPI key:
   ```bash
   cp scripts/.env.example scripts/.env
   # Edit scripts/.env and add your RAPIDAPI_KEY
   ```

3. Get your API key from [RapidAPI](https://rapidapi.com/whomwah/api/youtube-transcript3)

## Supported YouTube URL Formats

- https://www.youtube.com/watch?v=VIDEO_ID
- https://youtu.be/VIDEO_ID
- https://www.youtube.com/embed/VIDEO_ID
- https://www.youtube.com/v/VIDEO_ID
- Direct video ID input

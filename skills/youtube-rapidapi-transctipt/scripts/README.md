# YouTube Transcript Fetcher

A Python script to fetch YouTube video transcripts using the RapidAPI YouTube Transcript API.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file based on `.env.example` and add your RapidAPI key:
```bash
cp .env.example .env
# Edit .env and add your RAPIDAPI_KEY
```

3. Get your API key from [RapidAPI](https://rapidapi.com/whomwah/api/youtube-transcript3)

## Usage

### Basic usage (text output):
```bash
python youtube_transcript.py "https://www.youtube.com/watch?v=VIDEO_ID"
```

### With video ID directly:
```bash
python youtube_transcript.py "VIDEO_ID"
```

### Output formats:
```bash
# JSON format
python youtube_transcript.py VIDEO_ID -f json

# SRT subtitle format
python youtube_transcript.py VIDEO_ID -f srt

# Save to file
python youtube_transcript.py VIDEO_ID -o transcript.txt
```

### Command-line options:
- `-f, --format`: Output format (text, json, srt) - default: text
- `-o, --output`: Output file path (default: stdout)
- `-l, --language`: Language code (e.g., en, es, fr)

## Features

- Extracts video ID from various YouTube URL formats
- Supports multiple output formats (text, JSON, SRT)
- Saves output to file or displays in terminal
- Handles errors gracefully
- Uses environment variables for API key security

## Supported YouTube URL formats

- https://www.youtube.com/watch?v=VIDEO_ID
- https://youtu.be/VIDEO_ID
- https://www.youtube.com/embed/VIDEO_ID
- https://www.youtube.com/v/VIDEO_ID
- Direct video ID input
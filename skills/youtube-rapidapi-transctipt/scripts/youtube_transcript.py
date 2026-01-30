#!/usr/bin/env python3
"""
YouTube Transcript Fetcher using RapidAPI
Fetches transcripts from YouTube videos using the youtube-transcript3 API
"""

import os
import sys
import json
import argparse
from urllib.parse import urlparse, parse_qs
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Configuration
RAPIDAPI_HOST = "youtube-transcript3.p.rapidapi.com"
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")

if not RAPIDAPI_KEY:
    print("Error: RAPIDAPI_KEY not found in .env file")
    sys.exit(1)


def extract_video_id(url_or_id):
    """Extract video ID from YouTube URL or return if already an ID"""
    if len(url_or_id) == 11 and " " not in url_or_id:
        # Likely already a video ID
        return url_or_id

    # Parse YouTube URL
    parsed_url = urlparse(url_or_id)

    if parsed_url.hostname in ('www.youtube.com', 'youtube.com'):
        if parsed_url.path == '/watch':
            return parse_qs(parsed_url.query).get('v', [None])[0]
        elif parsed_url.path.startswith('/embed/'):
            return parsed_url.path.split('/')[2]
        elif parsed_url.path.startswith('/v/'):
            return parsed_url.path.split('/')[2]
    elif parsed_url.hostname == 'youtu.be':
        return parsed_url.path[1:]

    return None


def fetch_transcript(video_id):
    """Fetch transcript from YouTube video using RapidAPI"""
    url = f"https://{RAPIDAPI_HOST}/api/transcript"

    headers = {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": RAPIDAPI_KEY
    }

    params = {
        "videoId": video_id
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()

        data = response.json()
        return data

    except requests.exceptions.RequestException as e:
        print(f"Error fetching transcript: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status: {e.response.status_code}")
            print(f"Response text: {e.response.text}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response: {e}")
        return None


def format_transcript(transcript_data, format_type='text'):
    """Format transcript data into different output formats"""
    if not transcript_data:
        return "No transcript available"

    if format_type == 'json':
        return json.dumps(transcript_data, indent=2, ensure_ascii=False)

    elif format_type == 'text':
        if isinstance(transcript_data, list):
            # Format as plain text with timestamps
            formatted_lines = []
            for entry in transcript_data:
                if 'text' in entry:
                    text = entry['text'].strip()
                    if 'start' in entry:
                        start_time = entry['start']
                        minutes = int(start_time // 60)
                        seconds = int(start_time % 60)
                        formatted_lines.append(f"[{minutes:02d}:{seconds:02d}] {text}")
                    else:
                        formatted_lines.append(text)
            return '\n'.join(formatted_lines)
        else:
            return str(transcript_data)

    elif format_type == 'srt':
        # Format as SRT subtitles
        if isinstance(transcript_data, list):
            srt_lines = []
            for i, entry in enumerate(transcript_data, 1):
                if 'text' in entry and 'start' in entry and 'duration' in entry:
                    start_time = entry['start']
                    end_time = start_time + entry['duration']

                    # Convert to SRT timestamp format (HH:MM:SS,MMM)
                    start_srt = f"{int(start_time//3600):02d}:{int((start_time%3600)//60):02d}:{int(start_time%60):02d},{int((start_time%1)*1000):03d}"
                    end_srt = f"{int(end_time//3600):02d}:{int((end_time%3600)//60):02d}:{int(end_time%60):02d},{int((end_time%1)*1000):03d}"

                    srt_lines.append(str(i))
                    srt_lines.append(f"{start_srt} --> {end_srt}")
                    srt_lines.append(entry['text'].strip())
                    srt_lines.append("")

            return '\n'.join(srt_lines)
        else:
            return "No transcript available"


def main():
    parser = argparse.ArgumentParser(description="Fetch YouTube video transcripts using RapidAPI")
    parser.add_argument("video", help="YouTube video URL or video ID")
    parser.add_argument("-f", "--format", choices=["text", "json", "srt"], default="text",
                        help="Output format (default: text)")
    parser.add_argument("-o", "--output", help="Output file path (default: stdout)")
    parser.add_argument("-l", "--language", help="Language code (e.g., en, es, fr)")

    args = parser.parse_args()

    # Extract video ID
    video_id = extract_video_id(args.video)
    if not video_id:
        print(f"Error: Invalid YouTube URL or video ID: {args.video}")
        sys.exit(1)

    print(f"Fetching transcript for video ID: {video_id}")

    # Fetch transcript
    transcript_data = fetch_transcript(video_id)

    if not transcript_data:
        print("Failed to fetch transcript")
        sys.exit(1)

    # Format output
    output = format_transcript(transcript_data, args.format)

    # Write output
    if args.output:
        try:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(output)
            print(f"Transcript saved to: {args.output}")
        except IOError as e:
            print(f"Error writing to file: {e}")
            sys.exit(1)
    else:
        print("\n--- Transcript ---")
        print(output)


if __name__ == "__main__":
    main()

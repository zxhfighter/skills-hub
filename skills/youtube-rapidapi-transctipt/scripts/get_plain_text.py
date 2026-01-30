#!/usr/bin/env python3
"""
Extract plain text from YouTube transcript JSON data
"""

import json
import sys

def extract_plain_text(transcript_data):
    """Extract only the text content without timestamps"""
    if not transcript_data:
        return "No transcript available"

    # Handle the API response format
    if isinstance(transcript_data, dict) and 'transcript' in transcript_data:
        transcript_data = transcript_data['transcript']

    if isinstance(transcript_data, list):
        # Extract text from each entry and join with spaces
        texts = []
        for entry in transcript_data:
            if 'text' in entry:
                text = entry['text'].strip()
                # Replace HTML entities
                text = text.replace('&#39;', "'")
                texts.append(text)

        # Join with spaces to form paragraphs
        return ' '.join(texts)
    else:
        return str(transcript_data)

def main():
    if len(sys.argv) < 2:
        print("Usage: python get_plain_text.py <transcript_json_file>")
        sys.exit(1)

    json_file = sys.argv[1]

    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            transcript_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: File {json_file} not found")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON - {e}")
        sys.exit(1)

    plain_text = extract_plain_text(transcript_data)

    # Save to file
    output_file = json_file.replace('.json', '_plain.txt') if json_file.endswith('.json') else json_file + '_plain.txt'

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(plain_text)

    print(f"Plain text transcript saved to: {output_file}")

if __name__ == "__main__":
    main()
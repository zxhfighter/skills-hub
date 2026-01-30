---
name: youtube-downloader
description: Download YouTube videos using yt-dlp. Automatically checks for yt-dlp installation and installs if needed. Supports both full YouTube URLs and video IDs. Use when user asks to download YouTube videos, save videos locally, or get video files.
argument-hint: <youtube-url-or-video-id> [options]
---

# YouTube Video Downloader

Download YouTube videos using the powerful `yt-dlp` tool. Automatically handles installation and supports multiple input formats and quality options.

## Features

- ✅ **Auto-installation**: Checks for yt-dlp and installs if not present
- ✅ **Flexible Input**: Accepts full URLs or just video IDs
- ✅ **Quality Selection**: Choose from best, 1080p, 720p, 480p, or audio-only
- ✅ **Format Options**: MP4 video or MP3 audio
- ✅ **Progress Tracking**: Shows download progress
- ✅ **Metadata Embedding**: Automatically embeds thumbnails and metadata

## Installation Check

The skill automatically checks if `yt-dlp` is installed:

```bash
# Check for yt-dlp
which yt-dlp

# If not found, install via:
# macOS (Homebrew)
brew install yt-dlp

# Alternative: pip
pip install yt-dlp

# Alternative: pipx (recommended)
pipx install yt-dlp
```

## Usage

### Basic Syntax

```bash
youtube-download <url-or-id> [quality] [format] [output-dir]
```

### Parameters

1. **URL or Video ID** (required)

   - Full URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Short URL: `https://youtu.be/dQw4w9WgXcQ`
   - Video ID only: `dQw4w9WgXcQ`

2. **Quality** (optional, default: `best`)

   - `best` - Best available quality
   - `1080p` - Full HD
   - `720p` - HD
   - `480p` - SD
   - `audio` - Audio only (converts to MP3)

3. **Format** (optional, default: `mp4`)

   - `mp4` - Video in MP4 format
   - `mp3` - Audio in MP3 format (same as quality=audio)

4. **Output Directory** (optional, default: `~/Downloads/YouTube`)
   - Custom directory path for downloaded files

### Examples

```bash
# Download best quality (full URL)
youtube-download "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Download using video ID
youtube-download dQw4w9WgXcQ

# Download 720p quality
youtube-download dQw4w9WgXcQ 720p

# Download audio only as MP3
youtube-download dQw4w9WgXcQ audio

# Download to custom directory
youtube-download dQw4w9WgXcQ best mp4 ~/Videos

# Download MP3 directly
youtube-download dQw4w9WgXcQ "" mp3
```

## Quality Options Explained

### Video Quality

| Option  | Resolution | Bitrate   | Use Case                  |
| ------- | ---------- | --------- | ------------------------- |
| `best`  | Varies     | Highest   | Best quality, larger file |
| `1080p` | 1920x1080  | ~8 Mbps   | Full HD, good balance     |
| `720p`  | 1280x720   | ~5 Mbps   | HD, moderate size         |
| `480p`  | 854x480    | ~2.5 Mbps | SD, smaller files         |

### Audio Quality

| Option  | Format | Bitrate  | Use Case        |
| ------- | ------ | -------- | --------------- |
| `audio` | MP3    | 192 kbps | Music, podcasts |
| `mp3`   | MP3    | 192 kbps | Same as audio   |

## Output

Downloaded files are named with pattern:

```
<video-title>-<video-id>.mp4
<video-title>-<video-id>.mp3
```

Example:

```
Never Gonna Give You Up-dQw4w9WgXcQ.mp4
```

## Advanced Features

### Playlist Download

```bash
# Download entire playlist
youtube-download "https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"

# Download first N videos from playlist
youtube-download "playlist-url" best mp4 ~/Downloads "--playlist-end 10"
```

### Subtitle Download

```bash
# Download with subtitles
youtube-download <video-id> best mp4 ~/Downloads "--write-subs --sub-lang en"

# Download auto-generated subtitles
youtube-download <video-id> best mp4 ~/Downloads "--write-auto-subs"
```

### Age-Restricted Videos

```bash
# Download age-restricted content (requires cookies)
youtube-download <video-id> best mp4 ~/Downloads "--cookies-from-browser chrome"
```

## Error Handling

The skill handles common errors:

1. **yt-dlp not found** → Prompts to install
2. **Invalid URL/ID** → Shows example format
3. **Video unavailable** → Suggests checking video existence
4. **Network error** → Suggests retrying
5. **Disk space** → Checks available space before download

## Implementation Details

### URL Normalization

The script automatically converts various input formats:

```bash
# All these work:
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
dQw4w9WgXcQ
youtube.com/watch?v=dQw4w9WgXcQ
```

### Quality Selection Logic

```
if quality == "best":
    use yt-dlp default (bestvideo+bestaudio)
elif quality == "audio" or format == "mp3":
    use bestaudio, convert to mp3
else:
    use format: bestvideo[height<=<quality>]+bestaudio
```

## Common Use Cases

### 1. Quick Video Download

**User says**: "下载这个 YouTube 视频 https://www.youtube.com/watch?v=abc123"

**Action**:

```bash
youtube-download "https://www.youtube.com/watch?v=abc123"
```

### 2. Audio Extraction

**User says**: "提取 YouTube 视频 abc123 的音频"

**Action**:

```bash
youtube-download abc123 audio
```

### 3. Specific Quality

**User says**: "下载 720p 质量的视频"

**Action**:

```bash
youtube-download <url> 720p
```

### 4. Batch Download

**User says**: "下载这个播放列表"

**Action**:

```bash
youtube-download "https://www.youtube.com/playlist?list=..."
```

## Configuration

Default configuration can be customized in `~/.config/yt-dlp/config`:

```
# Prefer 1080p
-f bestvideo[height<=1080]+bestaudio/best

# Always embed thumbnails
--embed-thumbnail

# Add metadata
--add-metadata

# Output template
-o "~/Downloads/YouTube/%(title)s-%(id)s.%(ext)s"
```

## Limitations

- ⚠️ Respects copyright and YouTube Terms of Service
- ⚠️ Some videos may be geo-blocked or unavailable
- ⚠️ Live streams require special handling
- ⚠️ Very long videos may take significant time

## Troubleshooting

### "Video unavailable"

- Check if video exists and is public
- Try with `--cookies-from-browser chrome`

### "Format not available"

- Try different quality option
- Use `best` for automatic selection

### "Slow download"

- Use lower quality (720p or 480p)
- Check network connection

### "yt-dlp outdated"

```bash
# Update yt-dlp
brew upgrade yt-dlp
# or
pip install -U yt-dlp
```

## Legal Notice

⚠️ **Important**: Only download videos you have permission to download. Respect:

- YouTube Terms of Service
- Copyright laws
- Content creator rights
- Fair use guidelines

This tool is for personal, educational, and fair use purposes only.

## Integration with Other Skills

Works well with:

- **youtube-transcript**: Download video + extract transcript
- **notebooklm**: Download + analyze video content
- **gen_wechat_article**: Download + create article from video

## Script Location

Main download script: `scripts/download.sh`

Can be called directly:

```bash
~/.claude/skills/youtube-downloader/scripts/download.sh <args>
```

## Updates

yt-dlp is actively maintained. Update regularly:

```bash
brew upgrade yt-dlp  # macOS
pip install -U yt-dlp  # pip
pipx upgrade yt-dlp  # pipx
```

## Resources

- [yt-dlp GitHub](https://github.com/yt-dlp/yt-dlp)
- [yt-dlp Documentation](https://github.com/yt-dlp/yt-dlp#readme)
- [Supported Sites](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

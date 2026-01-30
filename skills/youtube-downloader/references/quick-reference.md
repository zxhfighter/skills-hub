# YouTube Downloader Quick Reference

## Quick Commands

```bash
# Download best quality
youtube-download <video-url-or-id>

# Download 720p
youtube-download <video-url-or-id> 720p

# Download audio (MP3)
youtube-download <video-url-or-id> audio

# Download to specific folder
youtube-download <video-url-or-id> best mp4 ~/Videos
```

## Supported Input Formats

All these formats work:

```bash
# Full URL
https://www.youtube.com/watch?v=dQw4w9WgXcQ

# Short URL
https://youtu.be/dQw4w9WgXcQ

# Video ID only
dQw4w9WgXcQ

# URL without protocol
youtube.com/watch?v=dQw4w9WgXcQ
```

## Quality Options

| Option  | Resolution    | File Size | Use Case              |
| ------- | ------------- | --------- | --------------------- |
| `best`  | Max available | Largest   | Archive, editing      |
| `1080p` | 1920×1080     | ~500MB/hr | HD viewing            |
| `720p`  | 1280×720      | ~300MB/hr | Standard HD           |
| `480p`  | 854×480       | ~150MB/hr | Mobile, slow internet |
| `audio` | Audio only    | ~50MB/hr  | Music, podcasts       |

## Common Use Cases

### Download Tutorial Video

```bash
youtube-download "https://www.youtube.com/watch?v=abc123" 720p
```

### Extract Music

```bash
youtube-download dQw4w9WgXcQ audio
```

### Download Playlist (First 10)

```bash
youtube-download "https://www.youtube.com/playlist?list=..." best mp4 ~/Videos
```

### Download with Subtitles

```bash
# Run manually with yt-dlp
yt-dlp --write-subs --sub-lang en <url>
```

## Troubleshooting

### yt-dlp Not Found

**Solution**: The script will auto-install it. Or manually:

```bash
# macOS
brew install yt-dlp

# Python pip
pip3 install yt-dlp

# pipx (recommended)
pipx install yt-dlp
```

### Video Unavailable

**Possible Causes**:

- Video is private or deleted
- Geographic restriction
- Age restriction

**Solutions**:

- Check if video exists
- Use VPN for geo-blocked content
- Use `--cookies-from-browser chrome` for age-restricted

### Format Not Available

**Solution**:

- Try `best` quality for automatic selection
- Use lower quality option

### Slow Download

**Solutions**:

- Use lower quality (`720p` instead of `best`)
- Check internet connection
- Download during off-peak hours

## Advanced Features

### Custom Output Template

```bash
yt-dlp -o "%(upload_date)s-%(title)s.%(ext)s" <url>
```

### Download Best Format

```bash
yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]" <url>
```

### Download Specific Time Range

```bash
yt-dlp --download-sections "*10:00-20:00" <url>
```

### Download Playlist Range

```bash
yt-dlp --playlist-start 1 --playlist-end 10 <playlist-url>
```

## File Naming

Downloaded files follow this pattern:

```
<Video Title>-<Video ID>.<ext>

Example:
Never Gonna Give You Up-dQw4w9WgXcQ.mp4
How to Install Python-abc123xyz.mp4
Beethoven Symphony No 5-def456.mp3
```

## Configuration File

Create `~/.config/yt-dlp/config` for default settings:

```
# Always download best quality
-f bestvideo+bestaudio

# Embed metadata
--embed-metadata
--embed-thumbnail

# Output location
-o ~/Downloads/YouTube/%(title)s.%(ext)s

# Prefer free formats
--prefer-free-formats

# Continue on errors
--ignore-errors
```

## External Resources

- [yt-dlp GitHub](https://github.com/yt-dlp/yt-dlp)
- [Format Selection](https://github.com/yt-dlp/yt-dlp#format-selection)
- [Output Template](https://github.com/yt-dlp/yt-dlp#output-template)
- [Post-Processing](https://github.com/yt-dlp/yt-dlp#post-processing-options)

## Legal & Ethical Use

⚠️ **Important Reminders**:

1. Only download videos you have permission to download
2. Respect YouTube Terms of Service
3. Respect copyright and intellectual property
4. Consider supporting content creators
5. Use for personal, educational, or fair use only

## Updates

Keep yt-dlp updated for best compatibility:

```bash
# Homebrew
brew upgrade yt-dlp

# pip
pip3 install -U yt-dlp

# pipx
pipx upgrade yt-dlp
```

Check version:

```bash
yt-dlp --version
```

## Performance Tips

1. **Use lower quality** for faster downloads
2. **Download during off-peak** hours
3. **Use wired connection** instead of WiFi
4. **Close other applications** using bandwidth
5. **Update yt-dlp** regularly for performance improvements

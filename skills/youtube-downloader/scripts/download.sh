#!/bin/bash

#
# YouTube Video Downloader
# Uses yt-dlp to download YouTube videos
# Supports full URLs and video IDs
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DEFAULT_OUTPUT_DIR="$HOME/Downloads/YouTube"
DEFAULT_QUALITY="best"
DEFAULT_FORMAT="mp4"

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to check if yt-dlp is installed
check_ytdlp() {
    if command -v yt-dlp &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to install yt-dlp
install_ytdlp() {
    print_warning "yt-dlp not found. Installing..."
    
    # Check OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            print_info "Installing via Homebrew..."
            brew install yt-dlp
        elif command -v pip3 &> /dev/null; then
            print_info "Installing via pip3..."
            pip3 install --user yt-dlp
        else
            print_error "Neither Homebrew nor pip3 found. Please install one of them first."
            print_info "Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v pip3 &> /dev/null; then
            print_info "Installing via pip3..."
            pip3 install --user yt-dlp
        else
            print_error "pip3 not found. Please install python3-pip first."
            exit 1
        fi
    else
        print_error "Unsupported OS: $OSTYPE"
        exit 1
    fi
    
    # Verify installation
    if check_ytdlp; then
        print_success "yt-dlp installed successfully"
    else
        print_error "Failed to install yt-dlp"
        exit 1
    fi
}

# Function to normalize YouTube URL/ID
normalize_url() {
    local input="$1"
    
    # If it's already a full URL, return as-is
    if [[ "$input" =~ ^https?:// ]]; then
        echo "$input"
        return
    fi
    
    # If it looks like a video ID (11 characters, alphanumeric + - and _)
    if [[ "$input" =~ ^[a-zA-Z0-9_-]{11}$ ]]; then
        echo "https://www.youtube.com/watch?v=$input"
        return
    fi
    
    # If it's a short format without protocol
    if [[ "$input" =~ youtube\.com/watch\?v= ]] || [[ "$input" =~ youtu\.be/ ]]; then
        echo "https://$input"
        return
    fi
    
    # Otherwise, assume it's a video ID
    echo "https://www.youtube.com/watch?v=$input"
}

# Function to get quality format string
get_format_string() {
    local quality="$1"
    local format="$2"
    
    # If format is mp3 or quality is audio, download audio only
    if [[ "$format" == "mp3" ]] || [[ "$quality" == "audio" ]]; then
        echo "bestaudio/best"
        return
    fi
    
    # Video quality settings
    # Use H.264 (avc1) for QuickTime compatibility instead of VP9
    case "$quality" in
        best)
            # Prefer H.264 codec for compatibility
            echo "bestvideo[vcodec^=avc1]+bestaudio[acodec^=mp4a]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"
            ;;
        1080p)
            echo "bestvideo[vcodec^=avc1][height<=1080]+bestaudio[acodec^=mp4a]/bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4]"
            ;;
        720p)
            echo "bestvideo[vcodec^=avc1][height<=720]+bestaudio[acodec^=mp4a]/bestvideo[ext=mp4][height<=720]+bestaudio[ext=m4a]/best[ext=mp4]"
            ;;
        480p)
            echo "bestvideo[vcodec^=avc1][height<=480]+bestaudio[acodec^=mp4a]/bestvideo[ext=mp4][height<=480]+bestaudio[ext=m4a]/best[ext=mp4]"
            ;;
        *)
            echo "bestvideo[vcodec^=avc1]+bestaudio[acodec^=mp4a]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"
            ;;
    esac
}

# Function to download video
download_video() {
    local url="$1"
    local quality="${2:-$DEFAULT_QUALITY}"
    local format="${3:-$DEFAULT_FORMAT}"
    local output_dir="${4:-$DEFAULT_OUTPUT_DIR}"
    
    # Create output directory if it doesn't exist
    mkdir -p "$output_dir"
    
    # Get format string
    local format_string
    format_string=$(get_format_string "$quality" "$format")
    
    # Construct output template
    local output_template="$output_dir/%(title)s-%(id)s.%(ext)s"
    
    print_info "Downloading from: $url"
    print_info "Quality: $quality"
    print_info "Format: $format"
    print_info "Output: $output_dir"
    echo ""
    
    # Build yt-dlp command
    local ytdlp_cmd=(
        yt-dlp
        -f "$format_string"
        -o "$output_template"
        --embed-thumbnail
        --add-metadata
        --progress
    )
    
    # Add post-processing for audio/mp3
    if [[ "$format" == "mp3" ]] || [[ "$quality" == "audio" ]]; then
        ytdlp_cmd+=(
            --extract-audio
            --audio-format mp3
            --audio-quality 192K
        )
    else
        # For video, merge to mp4
        ytdlp_cmd+=(
            --merge-output-format mp4
        )
    fi
    
    # Add URL
    ytdlp_cmd+=("$url")
    
    # Execute download
    if "${ytdlp_cmd[@]}"; then
        echo ""
        print_success "Download completed!"
        print_info "Files saved to: $output_dir"
        
        # Show downloaded files
        echo ""
        print_info "Downloaded files:"
        ls -lh "$output_dir" | tail -3
    else
        echo ""
        print_error "Download failed"
        exit 1
    fi
}

# Function to show usage
show_usage() {
    cat << EOF
${GREEN}YouTube Video Downloader${NC}

Usage: $0 <url-or-video-id> [quality] [format] [output-dir]

Arguments:
  url-or-video-id    YouTube URL or video ID (required)
                     Examples: 
                       - https://www.youtube.com/watch?v=dQw4w9WgXcQ
                       - https://youtu.be/dQw4w9WgXcQ
                       - dQw4w9WgXcQ

  quality            Video quality (optional, default: best)
                     Options: best, 1080p, 720p, 480p, audio

  format             Output format (optional, default: mp4)
                     Options: mp4, mp3

  output-dir         Download directory (optional)
                     Default: $DEFAULT_OUTPUT_DIR

Examples:
  # Download best quality
  $0 "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  
  # Download using video ID
  $0 dQw4w9WgXcQ
  
  # Download 720p quality
  $0 dQw4w9WgXcQ 720p
  
  # Download audio only
  $0 dQw4w9WgXcQ audio
  
  # Download as MP3
  $0 dQw4w9WgXcQ "" mp3
  
  # Download to custom directory
  $0 dQw4w9WgXcQ best mp4 ~/Videos

EOF
}

# Main script
main() {
    # Show banner
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   ${GREEN}YouTube Video Downloader${BLUE}            ║${NC}"
    echo -e "${BLUE}║   ${YELLOW}Powered by yt-dlp${BLUE}                  ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    
    # Check arguments
    if [[ $# -lt 1 ]] || [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
        show_usage
        exit 0
    fi
    
    # Check/install yt-dlp
    if ! check_ytdlp; then
        install_ytdlp
    else
        print_success "yt-dlp found: $(yt-dlp --version | head -1)"
    fi
    
    echo ""
    
    # Parse arguments
    local url_or_id="$1"
    local quality="${2:-$DEFAULT_QUALITY}"
    local format="${3:-$DEFAULT_FORMAT}"
    local output_dir="${4:-$DEFAULT_OUTPUT_DIR}"
    
    # Normalize URL
    local normalized_url
    normalized_url=$(normalize_url "$url_or_id")
    
    # Download video
    download_video "$normalized_url" "$quality" "$format" "$output_dir"
}

# Run main function
main "$@"

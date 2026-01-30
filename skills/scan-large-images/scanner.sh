#!/bin/bash
# 大图片扫描器 (macOS 原生版本)
# 使用 sips 命令获取图片尺寸

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 图片扩展名
IMAGE_EXTENSIONS="png jpg jpeg gif bmp webp tiff tif ico"

# 忽略的目录
IGNORED_DIRS="node_modules .git .svn dist build target vendor __pycache__ .venv venv env .idea .vscode .next .nuxt coverage .pytest_cache .mypy_cache"

# 格式化文件大小
format_size() {
    local size=$1
    local units=("B" "KB" "MB" "GB")
    local unit_index=0

    while [[ $size -gt 1024 && $unit_index -lt $((${#units[@]} - 1)) ]]; do
        size=$((size / 1024))
        ((unit_index++))
    done

    echo "${size} ${units[$unit_index]}"
}

# 检查文件是否为图片
is_image() {
    local file=$1
    local ext="${file##*.}"
    ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')

    for img_ext in $IMAGE_EXTENSIONS; do
        if [[ "$ext" == "$img_ext" ]]; then
            return 0
        fi
    done
    return 1
}

# 检查目录是否应该被忽略
is_ignored_dir() {
    local dir=$1
    local dir_name=$(basename "$dir")

    for ignored in $IGNORED_DIRS; do
        if [[ "$dir_name" == "$ignored" ]]; then
            return 0
        fi
    done
    return 1
}

# 主扫描函数
scan_directory() {
    local directory=$1
    local min_width=$2
    local min_height=$3
    local min_size=$4

    local total_count=0
    local large_count=0
    local large_images=()

    echo -e "${BLUE}正在扫描目录: ${directory}${NC}"
    echo ""

    # 使用 find 命令查找图片文件
    while IFS= read -r -d '' file; do
        # 检查文件路径中是否包含忽略的目录
        skip=0
        for ignored in $IGNORED_DIRS; do
            if [[ "$file" == */"$ignored"/* ]]; then
                skip=1
                break
            fi
        done

        if [[ $skip -eq 1 ]]; then
            continue
        fi

        if ! is_image "$file"; then
            continue
        fi

        # 使用 sips 获取图片尺寸
        dims=$(sips -g pixelWidth -g pixelHeight "$file" 2>/dev/null)
        if [[ $? -ne 0 ]]; then
            continue
        fi

        width=$(echo "$dims" | grep pixelWidth | awk '{print $2}')
        height=$(echo "$dims" | grep pixelHeight | awk '{print $2}')

        # 获取文件大小
        size_bytes=$(stat -f%z "$file")
        size_formatted=$(format_size "$size_bytes")

        ((total_count++))

        # 检查是否超过阈值
        is_large=0
        if [[ -n "$min_width" ]] && [[ $width -ge $min_width ]]; then
            is_large=1
        fi
        if [[ -n "$min_height" ]] && [[ $height -ge $min_height ]]; then
            is_large=1
        fi
        if [[ -n "$min_size" ]] && [[ $size_bytes -ge $min_size ]]; then
            is_large=1
        fi

        if [[ $is_large -eq 1 ]]; then
            ((large_count++))
            large_images+=("$file|$width|$height|$size_formatted|$size_bytes")
        fi

    done < <(find "$directory" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.gif" -o -iname "*.bmp" -o -iname "*.webp" -o -iname "*.tiff" -o -iname "*.tif" -o -iname "*.ico" \) -print0)

    # 输出报告
    echo "================================================================================"
    echo -e "${BLUE}📊 大图片扫描报告${NC}"
    echo "================================================================================"
    echo ""
    echo -e "${YELLOW}📈 统计信息:${NC}"
    echo "  • 总图片数量: $total_count"
    echo "  • 大图片数量: $large_count"

    if [[ $total_count -gt 0 ]]; then
        percentage=$(echo "scale=2; $large_count * 100 / $total_count" | bc)
        echo "  • 占比: ${percentage}%"
    fi

    if [[ -n "$min_width" ]] || [[ -n "$min_height" ]] || [[ -n "$min_size" ]]; then
        echo ""
        echo -e "${YELLOW}🎯 阈值设置:${NC}"
        if [[ -n "$min_width" ]]; then
            echo "  • 最小宽度: ${min_width}px"
        fi
        if [[ -n "$min_height" ]]; then
            echo "  • 最小高度: ${min_height}px"
        fi
        if [[ -n "$min_size" ]]; then
            min_size_formatted=$(format_size "$min_size")
            echo "  • 最小文件大小: $min_size_formatted"
        fi
    fi

    if [[ $large_count -gt 0 ]]; then
        echo ""
        echo -e "${YELLOW}🖼️  大图片列表 (按尺寸降序):${NC}"
        echo "--------------------------------------------------------------------------------"

        # 按尺寸排序（先按文件大小降序，再按宽度降序）
        IFS=$'\n' sorted=($(sort -t'|' -k5 -nr -k2 -nr -k3 -nr <<<"${large_images[*]}"))
        unset IFS

        index=1
        for img_info in "${sorted[@]}"; do
            IFS='|' read -r file width height size_formatted size_bytes <<< "$img_info"
            relative_path="${file#$directory/}"

            echo ""
            echo "${index}. $relative_path"
            echo "   尺寸: ${width} x ${height} px"
            echo "   大小: $size_formatted"

            ((index++))
        done

        echo ""
        echo "--------------------------------------------------------------------------------"
        echo ""
        echo -e "${GREEN}💡 优化建议:${NC}"
        echo "  • 考虑使用图片压缩工具（如 TinyPNG、ImageOptim）"
        echo "  • 对于大尺寸图片，考虑使用响应式图片或 CDN"
        echo "  • 将 PNG 转换为 WebP 格式可减少 30-50% 文件大小"
        echo "  • 对于图标，考虑使用 SVG 格式"
    else
        echo ""
        echo -e "${GREEN}✅ 未发现超过阈值的图片！${NC}"
    fi

    echo ""
    echo "================================================================================"
    echo ""
}

# 显示帮助信息
show_help() {
    echo "大图片扫描器 - 扫描项目中的大图片"
    echo ""
    echo "用法: $0 [目录] --min-width <宽度> --min-height <高度> --min-size <大小>"
    echo ""
    echo "参数:"
    echo "  目录              要扫描的目录（默认为当前目录）"
    echo "  --min-width       最小宽度阈值（像素）"
    echo "  --min-height      最小高度阈值（像素）"
    echo "  --min-size        最小文件大小阈值（字节，如 5242880 = 5MB）"
    echo ""
    echo "示例:"
    echo "  $0 --min-width 1920"
    echo "  $0 /path/to/project --min-height 1080"
    echo "  $0 --min-width 2560 --min-height 1440"
    echo "  $0 --min-size 5242880"
    echo "  $0 --min-width 1920 --min-size 5242880"
}

# 主函数
main() {
    local directory="."
    local min_width=""
    local min_height=""
    local min_size=""

    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            --min-width)
                min_width="$2"
                shift 2
                ;;
            --min-height)
                min_height="$2"
                shift 2
                ;;
            --min-size)
                min_size="$2"
                shift 2
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                if [[ "$1" == --* ]]; then
                    echo -e "${RED}错误: 未知参数 '$1'${NC}"
                    exit 1
                fi
                directory="$1"
                shift
                ;;
        esac
    done

    # 检查目录是否存在
    if [[ ! -d "$directory" ]]; then
        echo -e "${RED}错误: 目录 '$directory' 不存在${NC}"
        exit 1
    fi

    # 检查是否指定了至少一个阈值
    if [[ -z "$min_width" ]] && [[ -z "$min_height" ]] && [[ -z "$min_size" ]]; then
        echo -e "${RED}错误: 必须指定至少一个阈值 (--min-width、--min-height 或 --min-size)${NC}"
        echo ""
        show_help
        exit 1
    fi

    # 执行扫描
    scan_directory "$directory" "$min_width" "$min_height" "$min_size"
}

# 执行主函数
main "$@"

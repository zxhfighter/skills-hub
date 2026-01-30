#!/usr/bin/env python3
"""
大图片扫描器
扫描项目中的图片文件，检测超过指定尺寸的图片
"""

import os
import sys
from pathlib import Path
from PIL import Image
import json

# 常见图片格式
IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.tiff', '.tif', '.ico'}

# 常见忽略目录
IGNORED_DIRS = {
    'node_modules', '.git', '.svn', 'dist', 'build', 'target', 'vendor',
    '__pycache__', '.venv', 'venv', 'env', '.idea', '.vscode', '.next',
    '.nuxt', 'coverage', '.pytest_cache', '.mypy_cache'
}


def get_image_dimensions(file_path):
    """获取图片的宽度和高度"""
    try:
        with Image.open(file_path) as img:
            return img.size  # (width, height)
    except Exception as e:
        return None


def get_file_size(file_path):
    """获取文件大小（字节）"""
    return os.path.getsize(file_path)


def format_size(size_bytes):
    """格式化文件大小"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} TB"


def scan_directory(directory, min_width=None, min_height=None):
    """
    扫描目录中的图片文件

    Args:
        directory: 要扫描的目录路径
        min_width: 最小宽度阈值（像素）
        min_height: 最小高度阈值（像素）

    Returns:
        tuple: (所有图片列表, 大图片列表)
    """
    all_images = []
    large_images = []

    for root, dirs, files in os.walk(directory):
        # 过滤忽略的目录
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]

        for file in files:
            file_path = Path(root) / file
            ext = file_path.suffix.lower()

            if ext not in IMAGE_EXTENSIONS:
                continue

            dimensions = get_image_dimensions(file_path)
            if dimensions is None:
                continue

            width, height = dimensions
            file_size = get_file_size(file_path)

            image_info = {
                'path': str(file_path.relative_to(directory)),
                'absolute_path': str(file_path),
                'width': width,
                'height': height,
                'size_bytes': file_size,
                'size_formatted': format_size(file_size)
            }

            all_images.append(image_info)

            # 检查是否超过阈值
            is_large = False
            if min_width and width >= min_width:
                is_large = True
            if min_height and height >= min_height:
                is_large = True

            if is_large:
                large_images.append(image_info)

    return all_images, large_images


def generate_report(all_images, large_images, min_width=None, min_height=None):
    """生成扫描报告"""
    total_count = len(all_images)
    large_count = len(large_images)
    percentage = (large_count / total_count * 100) if total_count > 0 else 0

    report = {
        'summary': {
            'total_images': total_count,
            'large_images': large_count,
            'percentage': round(percentage, 2),
            'threshold': {
                'min_width': min_width,
                'min_height': min_height
            }
        },
        'large_images': sorted(large_images, key=lambda x: x['width'] * x['height'], reverse=True)
    }

    return report


def print_report(report):
    """打印报告到控制台"""
    summary = report['summary']
    large_images = report['large_images']

    print("\n" + "=" * 80)
    print("📊 大图片扫描报告")
    print("=" * 80)

    print(f"\n📈 统计信息:")
    print(f"  • 总图片数量: {summary['total_images']}")
    print(f"  • 大图片数量: {summary['large_images']}")
    print(f"  • 占比: {summary['percentage']}%")

    if summary['threshold']['min_width'] or summary['threshold']['min_height']:
        print(f"\n🎯 阈值设置:")
        if summary['threshold']['min_width']:
']:
            print(f"  • 最小宽度: {summary['threshold']['min_width']}px")
        if summary['threshold']['min_height']:
            print(f"  • 最小高度: {summary['threshold']['min_height']}px")

    if large_images:
        print(f"\n🖼️  大图片列表 (按尺寸降序):")
        print("-" * 80)

        for i, img in enumerate(large_images, 1):
            print(f"\n{i}. {img['path']}")
            print(f"   尺寸: {img['width']} x {img['height']} px")
            print(f"   大小: {img['size_formatted']}")

        print("\n" + "-" * 80)
        print("\n💡 优化建议:")
        print("  • 考虑使用图片压缩工具（如 TinyPNG、ImageOptim）")
        print("  • 对于大尺寸图片，考虑使用响应式图片或 CDN")
        print("  • 将 PNG 转换为 WebP 格式可减少 30-50% 文件大小")
        print("  • 对于图标，考虑使用 SVG 格式")
    else:
        print("\n✅ 未发现超过阈值的图片！")

    print("\n" + "=" * 80 + "\n")


def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description='扫描项目中的大图片')
    parser.add_argument('directory', nargs='?', default='.', help='要扫描的目录（默认为当前目录）')
    parser.add_argument('--min-width', type=int, help='最小宽度阈值（像素）')
    parser.add_argument('--min-height', type=int, help='最小高度阈值（像素）')
    parser.add_argument('--json', action='store_true', help='以 JSON 格式输出结果')

    args = parser.parse_args()

    # 检查目录是否存在
    if not os.path.isdir(args.directory):
        print(f"错误: 目录 '{args.directory}' 不存在")
        sys.exit(1)

    # 检查是否指定了至少一个阈值
    if not args.min_width and not args.min_height:
        print("错误: 必须指定至少一个阈值 (--min-width 或 --min-height)")
        sys.exit(1)

    # 扫描目录
    print(f"正在扫描目录: {os.path.abspath(args.directory)}")
    all_images, large_images = scan_directory(
        args.directory,
        min_width=args.min_width,
        min_height=args.min_height
    )

    # 生成报告
    report = generate_report(all_images, large_images, args.min_width, args.min_height)

    # 输出结果
    if args.json:
        print(json.dumps(report, indent=2, ensure_ascii=False))
    else:
        print_report(report)


if __name__ == '__main__':
    main()

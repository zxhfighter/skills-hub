---
name: scan-large-images
description: 扫描当前项目目录，查找所有超过指定尺寸或文件大小的图片文件
---

扫描当前项目目录，查找所有超过指定尺寸或文件大小的图片文件，并生成详细的报告。

## 使用场景
- 项目优化前检查图片资源
- 发现可能导致性能问题的大尺寸图片
- 发现占用过多存储空间的大文件图片
- 审计项目中的图片资源使用情况

## 执行步骤

1. 使用 AskUserQuestion 询问用户要扫描的阈值类型：
   - 提供以下选项：
     - 仅按尺寸扫描（宽度/高度）
     - 仅按文件大小扫描
     - 同时按尺寸和文件大小扫描

2. 根据用户选择，询问具体的阈值：
   - 如果选择尺寸扫描，提供预设选项：
     - 1920x1080 (Full HD)
     - 2560x1440 (2K)
     - 3840x2160 (4K)
     - 自定义
   - 如果选择文件大小扫描，提供预设选项：
     - 1MB
     - 5MB
     - 10MB
     - 自定义

3. 根据用户选择，执行扫描脚本：
   - 使用 Bash 运行：`/Users/bytedance/.claude/skills/scan-large-images/scanner.sh --min-width <宽度> --min-height <高度> --min-size <大小>`
   - 注意：5MB = 5242880 字节

4. 任务完成后执行通知：`play -n synth 0.5 sine 1000-100 vol 0.2`

## 技术说明

- 使用 macOS 原生的 `sips` 命令获取图片尺寸
- 自动忽略常见目录：node_modules、.git、dist、build 等
- 支持的图片格式：PNG、JPG、JPEG、GIF、BMP、WebP、TIFF、ICO
- 按文件大小降序排列大图片列表
- 提供优化建议

#!/usr/bin/env python3
"""
Markdown Checker Script
检查 markdown 文件的语法、样式、错别字和排版问题
"""

import re
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Tuple


class MarkdownChecker:
    def __init__(self, filepath: str):
        self.filepath = Path(filepath)
        self.issues = []
        self.content = ""
        self.lines = []

    def load_file(self) -> bool:
        """加载 markdown 文件"""
        try:
            self.content = self.filepath.read_text(encoding='utf-8')
            self.lines = self.content.split('\n')
            return True
        except Exception as e:
            print(f"Error reading file: {e}")
            return False

    def check_heading_levels(self):
        """检查标题层级问题"""
        prev_level = 0
        for i, line in enumerate(self.lines, 1):
            # 检查 ATX 风格标题 (# 标题)
            atx_match = re.match(r'^(#{1,6})\s+(.+)$', line)
            if atx_match:
                level = len(atx_match.group(1))
                # 检查是否跳级（如从 H1 直接跳到 H3）
                if prev_level > 0 and level > prev_level + 1:
                    self.issues.append({
                        'line': i,
                        'type': 'heading_level',
                        'severity': 'warning',
                        'message': f'标题跳级: 从 H{prev_level} 跳到 H{level}',
                        'content': line.strip()
                    })
                prev_level = level

    def check_links(self):
        """检查链接格式问题"""
        for i, line in enumerate(self.lines, 1):
            # 检查空链接文本
            if re.search(r'\[\]\([^)]+\)', line):
                self.issues.append({
                    'line': i,
                    'type': 'link',
                    'severity': 'error',
                    'message': '链接文本为空',
                    'content': line.strip()
                })

            # 检查缺少 URL 的链接
            if re.search(r'\[[^\]]+\]\(\)', line):
                self.issues.append({
                    'line': i,
                    'type': 'link',
                    'severity': 'error',
                    'message': '链接缺少 URL',
                    'content': line.strip()
                })

            # 检查链接中有空格
            if re.search(r'\[[^\]]+\]\([^)]+\s+[^)]*\)', line):
                self.issues.append({
                    'line': i,
                    'type': 'link',
                    'severity': 'warning',
                    'message': '链接 URL 中包含空格',
                    'content': line.strip()
                })

    def check_code_blocks(self):
        """检查代码块问题"""
        in_code_block = False
        code_block_start = 0

        for i, line in enumerate(self.lines, 1):
            # 检查代码块标记
            if line.strip().startswith('```'):
                if not in_code_block:
                    in_code_block = True
                    code_block_start = i
                    # 检查是否指定语言
                    if line.strip() == '```':
                        self.issues.append({
                            'line': i,
                            'type': 'code_block',
                            'severity': 'info',
                            'message': '代码块未指定语言',
                            'content': line.strip()
                        })
                else:
                    in_code_block = False

        # 检查未闭合的代码块
        if in_code_block:
            self.issues.append({
                'line': code_block_start,
                'type': 'code_block',
                'severity': 'error',
                'message': '代码块未闭合',
                'content': self.lines[code_block_start - 1].strip()
            })

    def check_lists(self):
        """检查列表格式问题"""
        for i, line in enumerate(self.lines, 1):
            # 检查无序列表符号后缺少空格
            if re.match(r'^(\s*)[-*+][^\s]', line):
                self.issues.append({
                    'line': i,
                    'type': 'list',
                    'severity': 'error',
                    'message': '列表符号后缺少空格',
                    'content': line.strip()
                })

            # 检查有序列表格式
            if re.match(r'^\s*\d+\.[^\s]', line):
                self.issues.append({
                    'line': i,
                    'type': 'list',
                    'severity': 'error',
                    'message': '有序列表数字后缺少空格',
                    'content': line.strip()
                })

    def check_spacing(self):
        """检查空格和缩进问题"""
        for i, line in enumerate(self.lines, 1):
            # 检查行尾空格
            if line != line.rstrip():
                self.issues.append({
                    'line': i,
                    'type': 'spacing',
                    'severity': 'warning',
                    'message': '行尾有多余空格',
                    'content': line.strip()
                })

            # 检查使用 Tab 缩进（markdown 建议使用空格）
            if line.startswith('\t'):
                self.issues.append({
                    'line': i,
                    'type': 'spacing',
                    'severity': 'info',
                    'message': '使用 Tab 缩进，建议使用空格',
                    'content': line.strip()
                })

    def check_punctuation(self):
        """检查标点符号问题"""
        for i, line in enumerate(self.lines, 1):
            # 检查中文标点后缺少空格（如果后面有英文）
            if re.search(r'[\u4e00-\u9fff][，。；：！？][a-zA-Z]', line):
                self.issues.append({
                    'line': i,
                    'type': 'punctuation',
                    'severity': 'warning',
                    'message': '中文标点后建议添加空格',
                    'content': line.strip()
                })

            # 检查英文单词和中文之间缺少空格
            if re.search(r'[a-zA-Z][\u4e00-\u9fff]|[\u4e00-\u9fff][a-zA-Z]', line):
                self.issues.append({
                    'line': i,
                    'type': 'punctuation',
                    'severity': 'info',
                    'message': '英文和/或中文之间建议添加空格',
                    'content': line.strip()
                })

    def check_empty_lines(self):
        """检查空行问题"""
        consecutive_empty = 0

        for i, line in enumerate(self.lines, 1):
            if line.strip() == '':
                consecutive_empty += 1
            else:
                # 检查连续空行超过 2 行
                if consecutive_empty > 2:
                    self.issues.append({
                        'line': i - consecutive_empty,
                        'type': 'spacing',
                        'severity': 'info',
                        'message': f'连续 {consecutive_empty} 个空行，建议不超过 2 个',
                        'content': '(空行)'
                    })
                consecutive_empty = 0

    def check_all(self) -> List[Dict]:
        """执行所有检查"""
        if not self.load_file():
            return []

        self.check_heading_levels()
        self.check_links()
        self.check_code_blocks()
        self.check_lists()
        self.check_spacing()
        self.check_punctuation()
        self.check_empty_lines()

        return self.issues

    def print_report(self):
        """打印检查报告"""
        if not self.issues:
            print("✅ 未发现任何问题")
            return

        # 按严重程度分组
        errors = [i for i in self.issues if i['severity'] == 'error']
        warnings = [i for i in self.issues if i['severity'] == 'warning']
        infos = [i for i in self.issues if i['severity'] == 'info']

        print(f"\n📊 检查报告: {self.filepath}")
        print(f"   总计: {len(self.issues)} 个问题")
        print(f"   ❌ 错误: {len(errors)}")
        print(f"   ⚠️  警告: {len(warnings)}")
        print(f"   ℹ️  提示: {len(infos)}\n")

        # 打印错误
        if errors:
            print("❌ 错误:")
            for issue in errors:
                print(f"   第 {issue['line']} 行: {issue['message']}")
                print(f"   内容: {issue['content']}")
                print()

        # 打印警告
        if warnings:
            print("⚠️  警告:")
            for issue in warnings:
                print(f"   第 {issue['line']} 行: {issue['message']}")
                print(f"   内容: {issue['content']}")
                print()

        # 打印提示
        if infos:
            print("ℹ️  提示:")
            for issue in infos:
                print(f"   第 {issue['line']} 行: {issue['message']}")
                print(f"   内容: {issue['content']}")
                print()


def main():
    parser = argparse.ArgumentParser(description='Markdown 文件检查工具')
    parser.add_argument('file', help='要检查的 markdown 文件路径')
    parser.add_argument('--fix', action='store_true', help='自动修复问题（功能开发中）')

    args = parser.parse_args()

    checker = MarkdownChecker(args.file)
    issues = checker.check_all()
    checker.print_report()

    # 返回退出码
    sys.exit(1 if any(i['severity'] == 'error' for i in issues) else 0)


if __name__ == '__main__':
    main()

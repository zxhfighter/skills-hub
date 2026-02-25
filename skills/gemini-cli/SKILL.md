---
name: gemini-cli
description: Integrate with Gemini CLI - an AI-powered command-line tool by Google. Provides access to Gemini models through CLI interface with advanced features like context awareness, memory management, and tool integration.
homepage: https://geminicli.com/
metadata: { "openclaw": { "emoji": "💎", "requires": { "bins": ["gemini"] } } }
---

# Gemini CLI Integration

Gemini CLI is Google's official command-line interface for Gemini AI models. This skill enables OpenClaw to interact with Gemini CLI, providing access to powerful AI capabilities through the terminal.

## Setup

### Install Gemini CLI

```bash
npm install -g @google/gemini-cli
```

### Authenticate

```bash
gemini auth login
```

This will open a browser window for you to authenticate with your Google account.

### Verify Installation

```bash
gemini --version
```

## Quick Start

### Basic AI Interaction

```bash
npx ts-node {baseDir}/scripts/gemini.ts --prompt "Explain quantum computing"
```

### With Context File

```bash
npx ts-node {baseDir}/scripts/gemini.ts \
  --prompt "Review this code" \
  --context /path/to/code.ts
```

### With System Instructions

```bash
npx ts-node {baseDir}/scripts/gemini.ts \
  --prompt "Summarize this document" \
  --system "You are a technical writer. Summarize in simple terms."
```

### Interactive Mode

```bash
npx ts-node {baseDir}/scripts/gemini.ts -i
```

## Script Options

| Option                  | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `-p, --prompt <text>`   | Prompt/question for the AI (required in non-interactive mode) |
| `-i, --interactive`     | Start in interactive mode                        |
| `-c, --context <path>`  | Add context from a file                         |
| `-s, --system <text>`   | System instructions for the AI                  |
| `-m, --model <model>`   | Specify model (default: gemini-2.0-flash)       |
| `-t, --temperature <n>` | Temperature (0.0-1.0, default: 0.7)              |
| `-f, --format <fmt>`    | Output format: text, json, markdown (default: text) |
| `-o, --output <path>`   | Save output to file                             |
| `--session <id>`        | Continue from a previous session                 |
| `--new-session`         | Start a new session                             |
| `--help`                | Show help message                               |

## Available Models

| Model              | Description                          |
| ------------------ | ------------------------------------ |
| gemini-2.0-flash   | Fast, cost-effective model (default) |
| gemini-2.5-pro     | Most capable model                    |
| gemini-2.0-pro     | Balanced performance                  |

## Output Formats

### Text (default)

Plain text output from the AI.

### Markdown

Formatted output with markdown syntax for rich text.

### JSON

Structured output with metadata:

```json
{
  "response": "AI response text",
  "model": "gemini-2.0-flash",
  "tokens": {
    "input": 150,
    "output": 300
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Session Management

### Continue Previous Session

```bash
npx ts-node {baseDir}/scripts/gemini.ts \
  --session abc123 \
  --prompt "Can you elaborate on point 2?"
```

### Start New Session

```bash
npx ts-node {baseDir}/scripts/gemini.ts \
  --new-session \
  --prompt "Let's start fresh"
```

## Use Cases

### Code Generation

```bash
npx ts-node {baseDir}/scripts/gemini.ts \
  --prompt "Write a Python function to sort a list"
  --context existing_code.py
```

### Code Review

```bash
npx ts-node {baseDir}/scripts/gemini.ts \
  --prompt "Review this code for bugs and improvements" \
  --context app.ts \
  --system "You are a senior code reviewer. Focus on security and performance."
```

### Documentation

```bash
npx ts-node {baseDir}/scripts/gemini.ts \
  --prompt "Generate API documentation for this code" \
  --context myapi.ts \
  --format markdown
```

### Translation

```bash
npx ts-node {baseDir}/scripts/gemini.ts \
  --prompt "Translate this to Spanish" \
  --context document.txt
```

### Summary

```bash
npx ts-node {baseDir}/scripts/gemini.ts \
  --prompt "Summarize in 3 bullet points" \
  --context long_article.txt
```

## Memory Management

Gemini CLI maintains conversation context across sessions. Use `--session` to continue conversations and `--new-session` to start fresh.

## Advanced Features

### Chain of Thought

```bash
npx ts-node {baseDir}/scripts/gemini.ts \
  --prompt "Solve this step by step and explain your reasoning" \
  --temperature 0.3
```

### Creative Writing

```bash
npx ts-node {baseDir}/scripts/gemini.ts \
  --prompt "Write a short story about..." \
  --temperature 0.9
```

### Factual Responses

```bash
npx ts-node {baseDir}/scripts/gemini.ts \
  --prompt "What is the capital of France?" \
  --temperature 0.1
```

## Integration with OpenClaw

This skill allows OpenClaw to leverage Gemini AI for:
- Complex reasoning tasks
- Code generation and review
- Content creation
- Multi-step problem solving
- Context-aware responses

## Notes

- Requires `gemini` CLI to be installed and authenticated
- Network connection required for API calls
- Use `--context` to provide additional information
- Adjust `--temperature` for creativity vs. accuracy
- Sessions preserve conversation context

## Troubleshooting

### Authentication Error

```bash
# Re-authenticate
gemini auth login
```

### CLI Not Found

```bash
# Install globally
npm install -g @google/gemini-cli
```

### Session Not Found

Use `--new-session` to start fresh.

## Resources

- Official Documentation: https://geminicli.com/docs/
- GitHub Repository: https://github.com/google/gemini-cli
- API Reference: https://geminicli.com/docs/cli/cli-reference/

## License

Gemini CLI is developed by Google. See their terms of service for usage policies.

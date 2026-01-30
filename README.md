# Skills Hub 🛠️

A curated collection of production-grade, highly specialized **AI Skills** designed to empower AI agents and developers. This repository serves as a central hub for practical, reusable logic and workflows focusing on content generation, code quality, and media processing.

## ✨ Highlights

- **Aesthetic First**: Beautiful SVG illustrations and optimized document formatting.
- **Code Health**: Deep analysis tools for React component architecture.
- **Media Mastery**: Comprehensive YouTube downloader and transcript extraction.
- **Content Engineering**: AI-powered rewriting for social media and technical docs.

---

## 🏗️ Skills Catalog

| Category          | Skill                         | Description                                                                |
| :---------------- | :---------------------------- | :------------------------------------------------------------------------- |
| **Content**       | `gen_wechat_article`          | Rewrites content into engaging WeChat Official Account articles.           |
| **Code Quality**  | `god-component-detector`      | Identifies oversized React/Next.js "God Components" with refactoring tips. |
| **Documentation** | `markdown-checker`            | Validates Markdown syntax, links, and hierarchy.                           |
| **Documentation** | `markdown-formatter`          | Intelligent formatting, emoji cleanup, and layout optimization.            |
| **Documentation** | `svg-illustrator`             | Generates premium SVG illustrations (Architecture, Minimalist, Geometric). |
| **Media**         | `youtube-downloader`          | High-quality YouTube video/audio downloader via `yt-dlp`.                  |
| **Media**         | `youtube-transcript`          | Rapid extraction of subtitles using local APIs.                            |
| **Media**         | `youtube-rapidapi-transcript` | Transcript extraction via RapidAPI for enhanced reliability.               |
| **Optimization**  | `scan-large-images`           | Scans for bloated assets to keep projects lean and fast.                   |

---

## 🛠️ Design Philosophy

Based on our core engineering principles:

1.  **Simplicity Over Complexity**: Each skill performs one task exceptionally well.
2.  **Progressive Enhancement**: Tools start from MVP and scale to advanced options.
3.  **Visual Excellence**: Output from skills like `svg-illustrator` and `markdown-formatter` is designed to WOW at first glance.
4.  **Developer Experience**: Standardized `SKILL.md` structure for easy integration.

---

## 🏗️ Creating a New Skill

Follow these steps to add a new skill to the hub:

1.  **Create Directory**: Create a new folder in `skills/`.
2.  **Add `SKILL.md`**: Include YAML frontmatter and detailed instructions.
    ```markdown
    ---
    name: your-skill-name
    description: Brief description of what it does
    ---

    # Your Skill Name

    ...
    ```
3.  **Implement Logic**: Add necessary scripts (`scripts/`), assets, or templates.
4.  **License**: Ensure it aligns with the project's MIT license.

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** (for Python-based skills)
- **Node.js 18+** (for React/Next.js analysis)
- **yt-dlp** (for YouTube downloader)

### Installation

Clone the repository and explore specific skill directories:

```bash
git clone https://github.com/your-username/skills-hub.git
cd skills-hub
```

Each skill contains a `SKILL.md` with specific installation steps and usage examples.

---

## 🍱 Structure

```text
skills/
├── content/          # Content generation & adaptation
├── development/      # Code analysis & developer tools
├── documentation/    # Markdown & SVG assets
└── media/            # YouTube & image processing
```

_Note: Grouping shown above is conceptual. Skills are currently organized flat in the `skills/` directory._

---

## 📝 License

MIT © [zxhfighter](https://github.com/zxhfighter)

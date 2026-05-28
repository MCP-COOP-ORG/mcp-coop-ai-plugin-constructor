# [MCP COOP AI Plugin Constructor](https://mcpcoop.org/agent-builder/) 🤖🛠️

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Production Ready](https://img.shields.io/badge/status-production_ready-success.svg)

A modern, production-ready web application designed to help developers visually construct, configure, and generate custom AI Agent rules and project contexts for various IDEs and AI Assistants (Cursor, Windsurf, GitHub Copilot, Antigravity, etc.).

## 🌟 The Problem

Generic AI rules are often too abstract and lack project-specific constraints. Developers waste time copy-pasting poorly written prompts and correcting AI hallucinations.

## 🚀 The Solution

This tool provides a guided, step-by-step wizard where developers can:

1. Select their target IDE/Assistant.
2. Check off their tech stack, domain, and architectural constraints.
3. Instantly download a `.zip` archive containing a perfectly structured, logic-checked set of rules and context files ready to be dropped into their project root.

## 🏗️ Architecture Overview

Built for high performance and maintainability, the Builder leverages a **Dual-Build Strategy**:

- **Standalone PWA:** An ultra-fast, Client-Side Rendered application optimized with Docker and Nginx for production.
- **Micro-Frontend:** Fully compatible with Native Federation for seamless integration into host platforms.

_For a deep dive into our technical decisions, folder structure, and design patterns, read the [Architecture Documentation](docs/architecture.md)._

## 🤝 Contributing (Open Source)

We believe community-driven context is the best context! You don't need to be an Angular expert to contribute. **Our entire engine is file-system driven**, meaning you can add new AI Platforms, Frameworks, and Architectural Rules simply by creating JSON files!

Read our **[Contributing Guide](CONTRIBUTING.md)** to get started. It contains detailed instructions on how to structure your JSON assets and submit Pull Requests.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v20+)
- Angular CLI (v21+)

### Installation

```bash
git clone https://github.com/shpakich/mcp-coop-agent-builder.git
cd mcp-coop-agent-builder
npm install
```

### Development Server

Run `npm start` for the standalone dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any source files.

### Testing & Validation

We enforce strict >85% code coverage. Run `npm test` to execute the Vitest suite.
All code is automatically formatted via Prettier upon commit.

---

_© 2026 MCP COOP DAO. Open Source under the MIT License._

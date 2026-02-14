# .claude Context Files - Index

This directory contains context information for AI assistants working on the SpellCooldowns2 Stream Deck plugin.

## Files Overview

### 📋 [project-context.md](project-context.md)
**Purpose**: High-level project overview  
**Contains**:
- Project goals and status
- Current implementation summary
- Technical architecture overview
- Next development steps
- Build commands and dependencies

**Read this first** for general project understanding.

---

### 🗂️ [codebase-structure.md](codebase-structure.md)
**Purpose**: Directory layout and file organization  
**Contains**:
- Complete directory tree
- Key file descriptions
- Action development patterns
- Build process explanation
- Settings persistence patterns

**Use this** to understand where files are located and how they're organized.

---

### ⏱️ [timer-implementation-guide.md](timer-implementation-guide.md)
**Purpose**: Specific guidance for implementing cooldown timers  
**Contains**:
- Recommended timer patterns from documentation
- Code examples for countdown logic
- Timer cleanup best practices
- Settings type definitions
- Feature implementation checklist

**Use this** when implementing the cooldown timer functionality.

---

### 📚 [documentation-summary.md](documentation-summary.md)
**Purpose**: Overview of available documentation resources  
**Contains**:
- Documentation structure (knowledge-base, doc-site, rag-system)
- Key examples with line numbers
- Relevant patterns for timer implementation
- Commands to access documentation

**Use this** to find specific documentation or examples.

---

### 💻 [current-code-state.md](current-code-state.md)
**Purpose**: Current state of all source code files  
**Contains**:
- Complete listing of src/plugin.ts
- Complete listing of src/actions/increment-counter.ts
- Manifest.json structure
- Missing functionality checklist
- Next implementation tasks

**Use this** to understand the current codebase without reading files.

---

## Quick Reference

### Project Type
Stream Deck Plugin using @elgato/streamdeck SDK v2.0.0

### Current Status
✅ Basic counter action working  
❌ Timer/cooldown functionality not implemented

### Main Task
Implement spell cooldown timer that:
- Counts down from configurable duration
- Updates display every second
- Alerts on completion
- Handles multiple instances
- Cleans up timers properly

### Key Technologies
- TypeScript 5.2.2
- Node.js 20
- Rollup (bundler)
- Stream Deck SDK 2.0.0

### Build Commands
```bash
npm run build   # Build once
npm run watch   # Watch mode with auto-restart
```

### Documentation Access
```bash
npm run docs:start  # Start Docusaurus site (port 3000)
npm run ingest      # Build RAG vector database
npm run test:query  # Query documentation with AI
```

---

## Context File Maintenance

These files should be updated when:
- ✅ **project-context.md**: Project goals change, new features planned
- ✅ **codebase-structure.md**: New files/directories added
- ✅ **timer-implementation-guide.md**: Implementation patterns change
- ✅ **documentation-summary.md**: New documentation added
- ✅ **current-code-state.md**: Source code is modified

## Last Updated
February 13, 2026

## Version
0.1.0 - Initial context creation

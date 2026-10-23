\
---
name: agfy
description: Turn any folder of files into a navigable knowledge graph
---

# Workflow: agfy

Run the fast, local, zero-token headless extraction CLI directly instead of heavy multi-turn chat subagents.

### Execution:
1. Determine target path (default `.` if not specified).
2. Execute the headless extraction command:
   ```powershell
   agfy <path> --code-only
   ```
   *(For current directory: `agfy . --code-only`)*
3. If an existing graph exists and only code was changed, run `agfy update <path>` instead.
4. Output a brief 2-line summary with links to [graph.html](file:///<path>/graphify-out/graph.html) and [GRAPH_REPORT.md](file:///<path>/graphify-out/GRAPH_REPORT.md).

> **DO NOT** dispatch subagents in chat or read chunks/communities into the chat LLM context. Headless CLI does AST extraction, Leiden community clustering, and export locally with 0 Antigravity IDE token cost.

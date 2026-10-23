---
trigger: always_on
description: Consult the agfy knowledge graph at graphify-out/ for codebase and architecture questions.
---

## agfy

This project has an agfy knowledge graph at graphify-out/.

Rules:
- For codebase or architecture questions, when `graphify-out/graph.json` exists, first run `agfy query "<question>"` (CLI) or `query_graph` (MCP). Use `agfy path "<A>" "<B>"` / `shortest_path` for relationships and `agfy explain "<concept>"` / `get_node` for focused concepts. These return a scoped subgraph, usually much smaller than `GRAPH_REPORT.md` or raw grep output.
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context
- After modifying code files in this session, run `agfy update .` to keep the graph current (AST-only, no API cost)

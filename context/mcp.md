# Adding MCP

Supabase
```bash
claude mcp add --scope project --transport http supabase [SUPABASE_MCP_URL]
```

github with docker

```bash
claude mcp add github -e GITHUB_PERSONAL_ACCESS_TOKEN=[YOUR_GITHUB_PAT] -- docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server
```
# mcp-usajobs

USAJOBS.gov MCP — US federal job postings

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 673+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search` | Search USAJOBS announcements. Returns title, agency, location, salary band, posting/closing dates. |
| `get_job` | Fetch a single announcement by USAJOBS announcement number. |
| `list_agencies` | Federal agency reference codes. |
| `list_pay_grades` | Pay grade codes (GS, GG, ES, etc.). |
| `list_occupational_series` | Occupational series codes (e.g. 2210 Information Technology). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "usajobs": {
      "url": "https://gateway.pipeworx.io/usajobs/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 673+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Usajobs data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

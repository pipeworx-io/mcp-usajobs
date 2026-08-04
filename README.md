# @pipeworx/usajobs

USAJOBS.gov MCP — US federal civilian job postings. ~10k active openings any given day.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `search(keyword?, location?, position_title?, organization?, pay_grade_low?, pay_grade_high?, remote?, results_per_page?, page?)` — primary search
- `get_job(announcement_number)` — full announcement record by number
- `list_agencies()` — federal agency reference
- `list_pay_grades()` — GS/SES grade reference
- `list_occupational_series()` — occupational series codes

## Auth

USAJOBS requires a `User-Agent` (email) and an `Authorization-Key` header. Both come from a free registration at https://developer.usajobs.gov/.

- **Platform key:** gateway env `PLATFORM_USAJOBS_KEY` (the auth key) — the User-Agent email is hard-coded to the operator's contact email at the pack level. Set `PLATFORM_USAJOBS_USER_AGENT` separately if you want to override.
- **BYO:** `?_apiKey=<auth_key>:<email>` (colon-joined).

## Data source

`https://data.usajobs.gov/api/` — `Host: data.usajobs.gov` is automatic via fetch.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

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

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

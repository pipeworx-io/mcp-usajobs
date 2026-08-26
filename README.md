# @pipeworx/usajobs

USAJOBS.gov MCP — US federal civilian job postings. ~10k active openings any given day.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/usajobs/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Usajobs data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

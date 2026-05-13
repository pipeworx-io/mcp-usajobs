interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * USAJOBS.gov MCP — US federal job postings
 *
 * Auth: two headers required —
 *   - Authorization-Key: <auth_key from developer.usajobs.gov>
 *   - User-Agent: <your registered email>
 *
 * The pack accepts the combined credential as "<auth_key>:<email>" via _apiKey.
 * Without a colon we treat the value as just the auth key and use a default
 * contact email registered with USAJOBS.
 *
 * Docs: https://developer.usajobs.gov/
 */


const SEARCH_HOST = 'https://data.usajobs.gov/api';
const CODES_HOST = 'https://data.usajobs.gov/api/codelist';
const DEFAULT_UA = 'pipeworx@mojibake.ai';

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description: 'Search USAJOBS announcements. Returns title, agency, location, salary band, posting/closing dates.',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: 'Free-text — title + description + agency name' },
        location: { type: 'string', description: 'City/state (e.g. "San Francisco, CA")' },
        position_title: { type: 'string', description: 'Restrict to job title field' },
        organization: { type: 'string', description: 'Agency code or name (e.g. "VATA" or "Veterans")' },
        pay_grade_low: { type: 'string', description: '"GS5", "GS9", "SES", ...' },
        pay_grade_high: { type: 'string' },
        remote: { type: 'boolean', description: 'Telework/remote only' },
        results_per_page: { type: 'number', description: '1-500 (default 25)' },
        page: { type: 'number', description: '1-based page' },
      },
    },
  },
  {
    name: 'get_job',
    description: 'Fetch a single announcement by USAJOBS announcement number.',
    inputSchema: {
      type: 'object',
      properties: {
        announcement_number: { type: 'string', description: 'USAJOBS announcement number (e.g. "AF-DHA-2024-12345")' },
      },
      required: ['announcement_number'],
    },
  },
  {
    name: 'list_agencies',
    description: 'Federal agency reference codes.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_pay_grades',
    description: 'Pay grade codes (GS, GG, ES, etc.).',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_occupational_series',
    description: 'Occupational series codes (e.g. 2210 Information Technology).',
    inputSchema: { type: 'object', properties: {} },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = (args._apiKey as string | undefined)?.trim();
  if (!apiKey) {
    throw new Error(
      'USAJOBS requires an Authorization-Key. Contact the operator about platform credentials, or BYO via ?_apiKey=<auth_key>:<email> after registering at https://developer.usajobs.gov/.',
    );
  }
  const colon = apiKey.indexOf(':');
  const authKey = colon === -1 ? apiKey : apiKey.slice(0, colon);
  const userAgent = colon === -1 ? DEFAULT_UA : apiKey.slice(colon + 1);

  switch (name) {
    case 'search':
      return search(authKey, userAgent, args);
    case 'get_job':
      return getJob(authKey, userAgent, reqStr(args, 'announcement_number', '"AF-DHA-2024-12345"'));
    case 'list_agencies':
      return codesGet(authKey, userAgent, '/agencysubelement');
    case 'list_pay_grades':
      return codesGet(authKey, userAgent, '/paygrades');
    case 'list_occupational_series':
      return codesGet(authKey, userAgent, '/occupationalseries');
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function search(authKey: string, userAgent: string, args: Record<string, unknown>) {
  const params = new URLSearchParams({
    ResultsPerPage: String(Math.min(500, Math.max(1, (args.results_per_page as number) ?? 25))),
    Page: String(Math.max(1, (args.page as number) ?? 1)),
  });
  if (args.keyword) params.set('Keyword', String(args.keyword));
  if (args.location) params.set('LocationName', String(args.location));
  if (args.position_title) params.set('PositionTitle', String(args.position_title));
  if (args.organization) params.set('Organization', String(args.organization));
  if (args.pay_grade_low) params.set('PayGradeLow', String(args.pay_grade_low));
  if (args.pay_grade_high) params.set('PayGradeHigh', String(args.pay_grade_high));
  if (args.remote === true) params.set('RemoteIndicator', 'True');
  return usajobsFetch(authKey, userAgent, `${SEARCH_HOST}/search?${params}`);
}

async function getJob(authKey: string, userAgent: string, announcementNumber: string) {
  // USAJOBS doesn't expose a direct "get by announcement number" endpoint;
  // search filters on the field instead and returns the first hit.
  const params = new URLSearchParams({
    Keyword: announcementNumber,
    ResultsPerPage: '5',
  });
  return usajobsFetch(authKey, userAgent, `${SEARCH_HOST}/search?${params}`);
}

async function codesGet(authKey: string, userAgent: string, path: string) {
  return usajobsFetch(authKey, userAgent, `${CODES_HOST}${path}`);
}

async function usajobsFetch(authKey: string, userAgent: string, url: string) {
  const res = await fetch(url, {
    headers: {
      Host: 'data.usajobs.gov',
      'User-Agent': userAgent,
      'Authorization-Key': authKey,
      Accept: 'application/json',
    },
  });
  if (res.status === 401) throw new Error('USAJOBS: unauthorized — check key + User-Agent email');
  if (res.status === 429) throw new Error('USAJOBS: rate-limit (HTTP 429)');
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`USAJOBS error: ${res.status} ${t.slice(0, 200)}`);
  }
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;

import chalk from 'chalk';
import { getApiKey } from '../config';
import {
  API_BASE_URL,
  GATEWAY_BASE,
  getClientIfAuthenticated,
  PinarkiveAPIError,
} from '../api';

async function fetchWithTimeout(url: string, ms = 5000): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function doctorCommand(): Promise<void> {
  const checks: Array<{ name: string; ok: boolean; message?: string }> = [];

  // 1. API reachable (no auth)
  try {
    await fetchWithTimeout(API_BASE_URL);
    checks.push({ name: 'API reachable', ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    checks.push({ name: 'API reachable', ok: false, message: msg });
  }

  // 2. API key present and valid
  const apiKey = getApiKey();
  if (!apiKey?.trim()) {
    checks.push({ name: 'API key valid', ok: false, message: 'No API key (run pinarkive login)' });
  } else {
    try {
      const client = getClientIfAuthenticated();
      if (client) await client.getMe();
      checks.push({ name: 'API key valid', ok: true });
    } catch (err: unknown) {
      const msg =
        err instanceof PinarkiveAPIError && err.statusCode === 401
          ? 'Invalid or expired API key'
          : err instanceof Error
            ? err.message
            : String(err);
      checks.push({ name: 'API key valid', ok: false, message: msg });
    }
  }

  // 3. Gateway reachable
  try {
    await fetchWithTimeout(`${GATEWAY_BASE}/`);
    checks.push({ name: 'Gateway reachable', ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    checks.push({ name: 'Gateway reachable', ok: false, message: msg });
  }

  // 4. Cluster access (only if we have a valid key)
  if (checks.find((c) => c.name === 'API key valid' && c.ok)) {
    try {
      const client = getClientIfAuthenticated();
      if (client) await client.getClusters();
      checks.push({ name: 'Cluster access', ok: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      checks.push({ name: 'Cluster access', ok: false, message: msg });
    }
  } else {
    checks.push({ name: 'Cluster access', ok: false, message: 'Skipped (no valid API key)' });
  }

  for (const c of checks) {
    if (c.ok) {
      console.log(chalk.green('✔'), chalk.white(c.name));
    } else {
      console.log(chalk.red('✖'), chalk.white(c.name));
      if (c.message) console.log(chalk.gray('  ' + c.message));
    }
  }

  const failed = checks.filter((c) => !c.ok).length;
  if (failed > 0) {
    process.exit(1);
  }
}

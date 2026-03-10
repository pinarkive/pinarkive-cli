import chalk from 'chalk';
import { getConfig, getApiKey } from '../config';
import { API_BASE_URL, GATEWAY_BASE, getClientIfAuthenticated } from '../api';

async function fetchWithTimeout(url: string, ms = 5000): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function statusCommand(): Promise<void> {
  const config = getConfig();
  const apiKey = config.apiKey?.trim();
  const cluster = config.cluster ?? 'default';

  let apiReachable = false;
  let gatewayReachable = false;
  let userDisplay = chalk.gray('not authenticated');
  let planDisplay = '—';
  let clustersCount: number | null = null;

  try {
    await fetchWithTimeout(API_BASE_URL);
    apiReachable = true;
  } catch {
    // leave false
  }

  try {
    await fetchWithTimeout(`${GATEWAY_BASE}/`);
    gatewayReachable = true;
  } catch {
    // leave false
  }

  if (apiKey) {
    try {
      const client = getClientIfAuthenticated();
      if (client) {
        const me = await client.getMe();
        const data = (me || {}) as Record<string, unknown>;
        userDisplay = chalk.white(String(data.email ?? data.username ?? 'authenticated'));
        planDisplay = String(data.plan ?? '—');
      }
    } catch {
      userDisplay = chalk.gray('not authenticated');
    }

    if (userDisplay !== chalk.gray('not authenticated')) {
      try {
        const client = getClientIfAuthenticated();
        if (client) {
          const list = await client.getClusters();
          clustersCount = Array.isArray(list) ? list.length : 0;
        }
      } catch {
        clustersCount = null;
      }
    }
  }

  console.log(chalk.cyan('Pinarkive CLI Status'));
  console.log();
  console.log(chalk.cyan('User:'), userDisplay);
  if (!apiKey) {
    console.log(chalk.gray('Run: pinarkive login'));
  }
  console.log(chalk.cyan('Plan:'), chalk.white(planDisplay));
  console.log(chalk.cyan('API:'), chalk.white(apiReachable ? 'reachable' : 'unreachable'));
  console.log(chalk.cyan('Gateway:'), chalk.white(gatewayReachable ? 'reachable' : 'unreachable'));
  console.log(chalk.cyan('Cluster:'), chalk.white(cluster));
  console.log(
    chalk.cyan('Clusters available:'),
    chalk.white(clustersCount !== null ? String(clustersCount) : '—')
  );
}

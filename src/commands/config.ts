import chalk from 'chalk';
import {
  getConfig,
  getConfigValue,
  setConfigValue,
  isAllowedConfigKey,
} from '../config';
import { GATEWAY_BASE } from '../api';

const DISPLAY_KEYS = ['apiKey', 'cluster', 'gateway'] as const;
const MASKED_KEYS = new Set(['apiKey']);
const DEFAULT_GATEWAY = `${GATEWAY_BASE}`;

function maskValue(value: string | undefined): string {
  if (value == null || value === '') return '—';
  return '************';
}

export async function configCommand(
  action: string,
  key?: string,
  value?: string
): Promise<void> {
  const act = (action || '').toLowerCase();

  if (act === 'list') {
    const config = getConfig();
    console.log(chalk.cyan('Pinarkive CLI configuration'));
    console.log();
    for (const k of DISPLAY_KEYS) {
      const raw = (config as Record<string, unknown>)[k];
      const val = typeof raw === 'string' ? raw : undefined;
      const display = k === 'apiKey' ? maskValue(val) : val ?? '—';
      const gatewayDefault = k === 'gateway' && !val ? DEFAULT_GATEWAY : display;
      console.log(chalk.cyan(`${k}:`), chalk.white(k === 'gateway' ? gatewayDefault : display));
    }
    return;
  }

  if (act === 'get') {
    if (!key?.trim()) {
      console.error(chalk.red('Usage: pinarkive config get <key>'));
      process.exit(1);
    }
    const k = key.trim();
    if (!isAllowedConfigKey(k)) {
      console.error(chalk.red('Unknown config key.'));
      process.exit(1);
    }
    const val = getConfigValue(k);
    if (val == null || val === '') {
      console.log(chalk.gray('Key not set.'));
      return;
    }
    const display = MASKED_KEYS.has(k) ? maskValue(val) : val;
    console.log(chalk.cyan(`${k}:`), chalk.white(display));
    return;
  }

  if (act === 'set') {
    if (!key?.trim() || value === undefined) {
      console.error(chalk.red('Usage: pinarkive config set <key> <value>'));
      process.exit(1);
    }
    const k = key.trim();
    if (!isAllowedConfigKey(k)) {
      console.error(chalk.red('Unknown config key.'));
      process.exit(1);
    }
    setConfigValue(k, value.trim());
    console.log(chalk.green('✔'), chalk.white(`${k} updated`));
    return;
  }

  console.error(chalk.red('Unknown action. Use: list | get | set'));
  process.exit(1);
}

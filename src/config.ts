import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.pinarkive');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export interface PinarkiveConfig {
  apiKey?: string;
  cluster?: string;
  gateway?: string;
}

const ALLOWED_KEYS = ['apiKey', 'cluster', 'gateway'] as const;
export type ConfigKey = (typeof ALLOWED_KEYS)[number];

export function isAllowedConfigKey(key: string): key is ConfigKey {
  return ALLOWED_KEYS.includes(key as ConfigKey);
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function getConfig(): PinarkiveConfig {
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(data) as PinarkiveConfig;
  } catch {
    return {};
  }
}

export function saveConfig(config: PinarkiveConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

export function getApiKey(): string | undefined {
  return getConfig().apiKey;
}

export function setApiKey(apiKey: string): void {
  const config = getConfig();
  config.apiKey = apiKey;
  saveConfig(config);
}

export function getConfigValue(key: string): string | undefined {
  const config = getConfig();
  const value = (config as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
}

export function setConfigValue(key: string, value: string): void {
  if (!isAllowedConfigKey(key)) {
    throw new Error('Unknown config key.');
  }
  const config = getConfig();
  (config as Record<string, unknown>)[key] = value;
  saveConfig(config);
}

import { PinarkiveClient, PinarkiveAPIError } from '@pinarkive/pinarkive-sdk-ts';
import * as fs from 'fs';
import * as path from 'path';
import { getApiKey, getConfigValue } from './config';

export { PinarkiveAPIError };

export const API_BASE_URL = 'https://api.pinarkive.com/api/v3';
export const GATEWAY_BASE = 'https://gateway.pinarkive.com/ipfs';

export function getGatewayUrl(cid: string): string {
  return `${GATEWAY_BASE}/${cid}`;
}

export function getClient(): PinarkiveClient {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Not authenticated. Run: pinarkive login');
  }
  return new PinarkiveClient({ apiKey }, API_BASE_URL);
}

/** For doctor/status: get client only if apiKey exists; does not throw. */
export function getClientIfAuthenticated(): PinarkiveClient | null {
  const apiKey = getApiKey();
  if (!apiKey?.trim()) return null;
  return new PinarkiveClient({ apiKey }, API_BASE_URL);
}

function uploadOptions(): { clusterId?: string } {
  const cluster = getConfigValue('cluster');
  return cluster ? { clusterId: cluster } : {};
}

export async function uploadFile(filePath: string): Promise<{
  cid: string;
  size?: number;
  gatewayUrl?: string;
}> {
  const client = getClient();
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const buffer = fs.readFileSync(absolutePath);
  const blob = new Blob([buffer]);
  const result = await client.uploadFile(blob, uploadOptions());
  return {
    cid: result.cid,
    gatewayUrl: getGatewayUrl(result.cid),
  };
}

export async function uploadBuffer(
  buffer: Buffer,
  _filename: string
): Promise<{ cid: string; size?: number; gatewayUrl?: string }> {
  const client = getClient();
  const blob = new Blob([buffer]);
  const result = await client.uploadFile(blob, uploadOptions());
  return {
    cid: result.cid,
    gatewayUrl: getGatewayUrl(result.cid),
  };
}

export function getShareLink(cid: string, password: string, cluster?: string): string {
  const host = cluster
    ? `https://${cluster}.pinarkive.com`
    : 'https://pinarkive.com';
  const fragment = password ? `${cid}:${encodeURIComponent(password)}` : cid;
  return `${host}/#/${fragment}`;
}

export async function pinCid(cid: string, options?: { clusterId?: string; customName?: string }): Promise<void> {
  const client = getClient();
  const cluster = options?.clusterId ?? getConfigValue('cluster');
  await client.pinCid(cid, { clusterId: cluster, customName: options?.customName });
}

export async function listUploads(): Promise<
  Array<{
    cid: string;
    size?: number;
    cluster?: string;
    created_at?: string;
  }>
> {
  const client = getClient();
  const out: Array<{ cid: string; size?: number; cluster?: string; created_at?: string }> = [];
  let page = 1;
  const limit = 100;
  let total = 0;
  do {
    const res = await client.listUploads(page, limit);
    const items = res.uploads ?? [];
    total = res.pagination?.total ?? items.length;
    for (const item of items) {
      out.push({
        cid: item.cid ?? '',
        size: item.size,
        cluster: item.clusterId,
        created_at: item.uploadedAt,
      });
    }
    page++;
  } while (out.length < total && out.length > 0);
  return out;
}

export async function deleteFile(cid: string): Promise<void> {
  const client = getClient();
  await client.removeFile(cid);
}

export async function listClusters(): Promise<Array<Record<string, unknown>>> {
  const client = getClient();
  const list = await client.getClusters();
  return Array.isArray(list) ? list as Array<Record<string, unknown>> : [];
}

export interface MeResponse {
  email?: string;
  username?: string;
  plan?: string;
  clusters?: unknown;
}

export async function getMe(): Promise<MeResponse> {
  const client = getClient();
  const data = await client.getMe();
  return (data || {}) as MeResponse;
}

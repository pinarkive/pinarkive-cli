import chalk from 'chalk';
import ora from 'ora';
import { listUploads } from '../api';

export async function filesCommand(): Promise<void> {
  const spinner = ora('Loading files...').start();

  try {
    const items = await listUploads();
    spinner.stop();

    if (items.length === 0) {
      console.log(chalk.gray('No files found.'));
      return;
    }

    const col = {
      cid: 52,
      size: 12,
      cluster: 16,
      created: 22,
    };

    const pad = (s: string, n: number) => (s ?? '').slice(0, n).padEnd(n);
    const header =
      chalk.cyan(pad('CID', col.cid)) +
      chalk.cyan(pad('Size', col.size)) +
      chalk.cyan(pad('Cluster', col.cluster)) +
      chalk.cyan('Created');
    console.log(header);
    console.log(chalk.gray('-'.repeat(col.cid + col.size + col.cluster + col.created)));

    for (const row of items) {
      const sizeStr = row.size != null ? formatBytes(row.size) : '—';
      const createdStr = row.created_at ? formatDate(row.created_at) : '—';
      console.log(
        pad(row.cid, col.cid) +
          pad(sizeStr, col.size) +
          pad(row.cluster ?? '—', col.cluster) +
          createdStr
      );
    }
  } catch (err: unknown) {
    spinner.fail(chalk.red('Failed to list files'));
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(message));
    process.exit(1);
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(value: string | number): string {
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toISOString().slice(0, 19).replace('T', ' ');
}

import chalk from 'chalk';
import open from 'open';
import { getGatewayUrl } from '../api';

export async function openCommand(cid: string): Promise<void> {
  if (!cid?.trim()) {
    console.error(chalk.red('CID is required.'));
    process.exit(1);
  }

  const url = getGatewayUrl(cid.trim());

  try {
    await open(url);
    console.log(chalk.green('Opened'), chalk.cyan(url));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red('Failed to open browser:'), message);
    console.log(chalk.gray('URL:'), url);
    process.exit(1);
  }
}

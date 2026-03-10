import chalk from 'chalk';
import ora from 'ora';
import { pinCid } from '../api';

export async function pinCommand(cid: string): Promise<void> {
  if (!cid?.trim()) {
    console.error(chalk.red('CID is required.'));
    process.exit(1);
  }

  const spinner = ora('Pinning CID...').start();

  try {
    await pinCid(cid.trim());
    spinner.succeed(chalk.green('Pinned successfully'));
  } catch (err: unknown) {
    spinner.fail(chalk.red('Pin failed'));
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(message));
    process.exit(1);
  }
}

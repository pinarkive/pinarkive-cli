import chalk from 'chalk';
import ora from 'ora';
import { deleteFile } from '../api';

export async function deleteCommand(cid: string): Promise<void> {
  if (!cid?.trim()) {
    console.error(chalk.red('CID is required.'));
    process.exit(1);
  }

  const spinner = ora('Deleting file...').start();

  try {
    await deleteFile(cid.trim());
    spinner.succeed(chalk.green('Deleted successfully'));
  } catch (err: unknown) {
    spinner.fail(chalk.red('Delete failed'));
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(message));
    process.exit(1);
  }
}

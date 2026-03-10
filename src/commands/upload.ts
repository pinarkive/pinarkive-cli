import chalk from 'chalk';
import ora from 'ora';
import { uploadFile } from '../api';

export async function uploadCommand(file: string): Promise<void> {
  const spinner = ora('Uploading file...').start();

  try {
    const result = await uploadFile(file);
    spinner.succeed(chalk.green('Upload successful'));

    console.log();
    console.log(chalk.cyan('CID:'));
    console.log(chalk.white(result.cid));
    if (result.size != null) {
      console.log();
      console.log(chalk.cyan('Size:'));
      console.log(chalk.white(formatBytes(result.size)));
    }
    if (result.gatewayUrl) {
      console.log();
      console.log(chalk.cyan('Gateway:'));
      console.log(chalk.white(result.gatewayUrl));
    }
  } catch (err: unknown) {
    spinner.fail(chalk.red('Upload failed'));
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

import chalk from 'chalk';
import ora from 'ora';
import { listClusters } from '../api';

export async function clustersCommand(): Promise<void> {
  const spinner = ora('Loading clusters...').start();

  try {
    const items = await listClusters();
    spinner.stop();

    if (items.length === 0) {
      console.log(chalk.gray('No clusters found.'));
      return;
    }

    for (const cluster of items) {
      const name = cluster.name ?? cluster.id ?? 'Unnamed';
      console.log(chalk.cyan(String(name)));
      if (Object.keys(cluster).length > 1) {
        for (const [key, value] of Object.entries(cluster)) {
          if (key === 'name' || key === 'id') continue;
          if (value != null && typeof value !== 'object') {
            console.log(chalk.gray(`  ${key}: ${value}`));
          }
        }
      }
      console.log();
    }
  } catch (err: unknown) {
    spinner.fail(chalk.red('Failed to list clusters'));
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(message));
    process.exit(1);
  }
}

import chalk from 'chalk';
import ora from 'ora';
import { getMe } from '../api';

export async function whoamiCommand(): Promise<void> {
  const spinner = ora('Loading...').start();

  try {
    const user = await getMe();
    spinner.stop();

    console.log(chalk.cyan('User:'));
    console.log(chalk.white(user.email ?? user.username ?? '—'));
    console.log();
    console.log(chalk.cyan('Plan:'));
    console.log(chalk.white(user.plan ?? '—'));
    console.log();
    console.log(chalk.cyan('Clusters:'));
    const count =
      typeof user.clusters === 'number'
        ? user.clusters
        : Array.isArray(user.clusters)
          ? user.clusters.length
          : 0;
    console.log(chalk.white(String(count)));
  } catch (err: unknown) {
    spinner.fail(chalk.red('Failed to load user'));
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(message));
    process.exit(1);
  }
}

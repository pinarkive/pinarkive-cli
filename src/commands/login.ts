import * as readline from 'readline';
import chalk from 'chalk';
import { setApiKey, getConfigPath } from '../config';

export async function loginCommand(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = (question: string): Promise<string> =>
    new Promise((resolve) => rl.question(question, resolve));

  console.log(chalk.cyan('Pinarkive API key'));
  console.log(chalk.gray('Get your key at https://pinarkive.com or your dashboard.\n'));

  const apiKey = (await ask(chalk.yellow('API key: '))).trim();
  rl.close();

  if (!apiKey) {
    console.error(chalk.red('API key cannot be empty.'));
    process.exit(1);
  }

  setApiKey(apiKey);
  console.log(chalk.green('✔ API key saved to'), chalk.gray(getConfigPath()));
}

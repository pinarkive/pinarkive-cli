import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import { encryptFile } from '../crypto-share';
import { uploadBuffer, getShareLink } from '../api';

export interface ShareOptions {
  password?: string;
  expires?: string;
  cluster?: string;
}

export async function shareCommand(
  file: string,
  cmd?: { opts(): ShareOptions }
): Promise<void> {
  const options = cmd?.opts() ?? {};
  const absolutePath = path.resolve(file);
  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    console.error(chalk.red(`File not found: ${file}`));
    process.exit(1);
  }

  let password = options.password;
  if (!password?.trim()) {
    password = await promptPassword();
  }
  if (!password?.trim()) {
    console.error(chalk.red('A password is required for secure share. Use -p <password> or enter when prompted.'));
    process.exit(1);
  }

  const encryptSpinner = ora('Encrypting file...').start();
  let encrypted: Buffer;
  try {
    encrypted = encryptFile(absolutePath, password);
    encryptSpinner.succeed(chalk.green('File encrypted'));
  } catch (err: unknown) {
    encryptSpinner.fail(chalk.red('Encryption failed'));
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(message));
    process.exit(1);
  }

  const uploadSpinner = ora('Uploading...').start();
  const tmpName = path.basename(absolutePath) + '.encrypted';
  try {
    const result = await uploadBuffer(encrypted, tmpName);
    uploadSpinner.succeed(chalk.green('Uploaded'));

    console.log();
    console.log(chalk.cyan('CID:'));
    console.log(chalk.white(result.cid));
    const shareLink = getShareLink(result.cid, password, options.cluster);
    console.log();
    console.log(chalk.cyan('Share link:'));
    console.log(chalk.white(shareLink));
    if (options.expires) {
      console.log();
      console.log(chalk.gray('Expires:'), options.expires);
    }
  } catch (err: unknown) {
    uploadSpinner.fail(chalk.red('Upload failed'));
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(message));
    process.exit(1);
  }
}

function promptPassword(): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(chalk.yellow('Password for share link: '), (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

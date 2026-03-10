import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import chokidar from 'chokidar';
import { uploadFile } from '../api';

export async function watchCommand(folder: string): Promise<void> {
  const absoluteDir = path.resolve(folder);
  if (!fs.existsSync(absoluteDir) || !fs.statSync(absoluteDir).isDirectory()) {
    console.error(chalk.red(`Folder not found or not a directory: ${folder}`));
    process.exit(1);
  }

  console.log(chalk.cyan('Watching'), chalk.white(absoluteDir));
  console.log(chalk.gray('New files will be uploaded and pinned. Ctrl+C to stop.\n'));

  const watcher = chokidar.watch(absoluteDir, {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 500 },
  });

  watcher.on('add', async (filePath: string) => {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) return;

    const relative = path.relative(absoluteDir, filePath);
    process.stdout.write(chalk.gray(`Uploading ${relative}... `));

    try {
      const result = await uploadFile(filePath);
      console.log(chalk.green('✔'), chalk.cyan(result.cid));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(chalk.red('✖'), chalk.red(message));
    }
  });

  watcher.on('error', (err: Error) => {
    console.error(chalk.red('Watcher error:'), err.message);
  });
}

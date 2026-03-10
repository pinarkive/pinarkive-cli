import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import * as fs from 'fs';
import chokidar from 'chokidar';
import { uploadFile } from '../api';

const MANIFEST_FILENAME = '.pinarkive-sync.json';

interface SyncManifest {
  version: number;
  files: Record<string, { cid: string; mtime: number }>;
}

function listFilesRecursive(dir: string, baseDir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(baseDir, full);
    const relNorm = rel.split(path.sep).join('/');
    if (e.isDirectory()) {
      results.push(...listFilesRecursive(full, baseDir));
    } else if (e.isFile() && relNorm !== MANIFEST_FILENAME) {
      results.push(full);
    }
  }
  return results;
}

function loadManifest(folder: string): SyncManifest {
  const filePath = path.join(folder, MANIFEST_FILENAME);
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(data) as SyncManifest;
    if (parsed?.files && typeof parsed.files === 'object') {
      return { version: 1, files: parsed.files };
    }
  } catch {
    // ignore
  }
  return { version: 1, files: {} };
}

function saveManifest(folder: string, manifest: SyncManifest): void {
  const filePath = path.join(folder, MANIFEST_FILENAME);
  fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2), 'utf-8');
}

function relativeKey(folder: string, absolutePath: string): string {
  return path.relative(folder, absolutePath).split(path.sep).join('/');
}

export async function syncCommand(
  folder: string,
  cmd?: { opts(): { watch?: boolean } }
): Promise<void> {
  const options = cmd?.opts() ?? {};
  const absoluteDir = path.resolve(folder);
  if (!fs.existsSync(absoluteDir) || !fs.statSync(absoluteDir).isDirectory()) {
    console.error(chalk.red(`Folder not found or not a directory: ${folder}`));
    process.exit(1);
  }

  await runSync(absoluteDir);

  if (options?.watch) {
    console.log();
    console.log(chalk.cyan('Watching'), chalk.white(absoluteDir));
    console.log(chalk.gray('New files will be uploaded and pinned. Ctrl+C to stop.\n'));

    const watcher = chokidar.watch(absoluteDir, {
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 500 },
    });

    watcher.on('add', async (filePath: string) => {
      const stat = fs.statSync(filePath);
      if (!stat.isFile()) return;
      const rel = path.relative(absoluteDir, filePath);
      if (rel.split(path.sep).join('/') === MANIFEST_FILENAME) return;

      process.stdout.write(chalk.gray(`Uploading ${rel}... `));
      try {
        const result = await uploadFile(filePath);
        const manifest = loadManifest(absoluteDir);
        manifest.files[relativeKey(absoluteDir, filePath)] = {
          cid: result.cid,
          mtime: Math.floor(stat.mtimeMs / 1000),
        };
        saveManifest(absoluteDir, manifest);
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
}

async function runSync(absoluteDir: string): Promise<void> {
  const scanSpinner = ora('Scanning folder ' + absoluteDir).start();

  const allFiles = listFilesRecursive(absoluteDir, absoluteDir);
  const manifest = loadManifest(absoluteDir);

  const toUpload: string[] = [];
  let alreadyCount = 0;

  for (const filePath of allFiles) {
    const rel = relativeKey(absoluteDir, filePath);
    const stat = fs.statSync(filePath);
    const mtime = Math.floor(stat.mtimeMs / 1000);
    const entry = manifest.files[rel];
    if (entry && entry.cid && entry.mtime === mtime) {
      alreadyCount++;
    } else {
      toUpload.push(filePath);
    }
  }

  scanSpinner.stop();

  console.log(chalk.cyan('Scanning folder'), chalk.white(absoluteDir));
  console.log();
  console.log(chalk.cyan('Found files:'), chalk.white(String(allFiles.length)));
  console.log(chalk.cyan('Already uploaded:'), chalk.white(String(alreadyCount)));
  console.log(chalk.cyan('Uploading:'), chalk.white(String(toUpload.length)));
  console.log();

  if (toUpload.length === 0) {
    console.log(chalk.green('Sync complete'));
    return;
  }

  for (const filePath of toUpload) {
    const rel = relativeKey(absoluteDir, filePath);
    const stat = fs.statSync(filePath);
    try {
      const result = await uploadFile(filePath);
      manifest.files[rel] = { cid: result.cid, mtime: Math.floor(stat.mtimeMs / 1000) };
      console.log(chalk.green('✔'), chalk.white(rel), chalk.gray('→'), chalk.cyan(result.cid));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red('✖'), chalk.white(rel), chalk.red(message));
      process.exit(1);
    }
  }

  saveManifest(absoluteDir, manifest);
  console.log();
  console.log(chalk.green('Sync complete'));
}

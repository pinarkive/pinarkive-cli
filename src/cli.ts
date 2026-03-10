#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { loginCommand } from './commands/login';
import { uploadCommand } from './commands/upload';
import { pinCommand } from './commands/pin';
import { filesCommand } from './commands/files';
import { deleteCommand } from './commands/delete';
import { clustersCommand } from './commands/clusters';
import { gatewayCommand } from './commands/gateway';
import { openCommand } from './commands/open';
import { initCommand } from './commands/init';
import { shareCommand } from './commands/share';
import { whoamiCommand } from './commands/whoami';
import { doctorCommand } from './commands/doctor';
import { watchCommand } from './commands/watch';
import { configCommand } from './commands/config';
import { statusCommand } from './commands/status';
import { syncCommand } from './commands/sync';

const program = new Command();

program
  .name('pinarkive')
  .description('CLI for the Pinarkive API v3')
  .version('1.0.0');

program
  .command('login')
  .description('Store your API key locally')
  .action(loginCommand);

program
  .command('upload <file>')
  .description('Upload a file to Pinarkive')
  .action(uploadCommand);

program
  .command('pin <cid>')
  .description('Pin an existing CID')
  .action(pinCommand);

program
  .command('files')
  .description('List your uploaded files')
  .action(filesCommand);

program
  .command('delete <cid>')
  .description('Delete a file by CID')
  .action(deleteCommand);

program
  .command('clusters')
  .description('List your clusters')
  .action(clustersCommand);

program
  .command('gateway <cid>')
  .description('Print the gateway URL for a CID')
  .action(gatewayCommand);

program
  .command('open <cid>')
  .description('Open the gateway URL in your browser')
  .action(openCommand);

program
  .command('init')
  .description('Create a new project from a template')
  .action(initCommand);

program
  .command('share <file>')
  .description('Encrypt, upload, and get a share link')
  .option('-p, --password <password>', 'Password for the share link')
  .option('-e, --expires <date>', 'Expiration (e.g. 2025-12-31)')
  .option('-c, --cluster <name>', 'Target cluster for share URL')
  .action(shareCommand);

program
  .command('whoami')
  .description('Show current user (email, plan, clusters)')
  .action(whoamiCommand);

program
  .command('doctor')
  .description('Run connectivity and auth diagnostics')
  .action(doctorCommand);

program
  .command('watch <folder>')
  .description('Watch folder and upload/pin new files')
  .action(watchCommand);

program
  .command('config <action> [key] [value]')
  .description('View or set CLI config (list | get <key> | set <key> <value>)')
  .action(configCommand);

program
  .command('status')
  .description('Show environment and account status summary')
  .action(statusCommand);

program
  .command('sync <folder>')
  .description('Sync folder to Pinarkive (upload only new or changed files)')
  .option('-w, --watch', 'After sync, watch for new files')
  .action(syncCommand);

program.parseAsync().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(chalk.red(message));
  process.exit(1);
});

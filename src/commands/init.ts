import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import degit from 'degit';

const TEMPLATES_REPO = 'pinarkive/pinarkive-templates';
const GITHUB_API = 'https://api.github.com/repos';

export async function initCommand(): Promise<void> {
  const spinner = ora('Fetching templates...').start();

  let templateDirs: string[];
  try {
    const { data } = await axios.get<Array<{ name: string; type: string }>>(
      `${GITHUB_API}/${TEMPLATES_REPO}/contents`,
      { timeout: 10000 }
    );
    templateDirs = (data || [])
      .filter((item) => item.type === 'dir' && item.name !== '.github')
      .map((item) => item.name)
      .sort();
  } catch (err: unknown) {
    spinner.fail(chalk.red('Failed to fetch templates'));
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(message));
    process.exit(1);
  }

  if (templateDirs.length === 0) {
    spinner.fail(chalk.red('No templates found in repository'));
    process.exit(1);
  }

  spinner.stop();

  const { template } = await inquirer.prompt<{ template: string }>({
    type: 'list',
    name: 'template',
    message: 'Select template:',
    choices: templateDirs,
  });

  const { projectName } = await inquirer.prompt<{ projectName: string }>({
    type: 'input',
    name: 'projectName',
    message: 'Project folder name:',
    default: path.basename(path.resolve('.')),
    validate: (input: string) => {
      if (!input.trim()) return 'Enter a folder name';
      if (input.includes('/') || input.includes('\\')) return 'Invalid folder name';
      return true;
    },
  });

  const targetDir = path.resolve(process.cwd(), projectName.trim());
  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    console.error(chalk.red(`Directory already exists and is not empty: ${targetDir}`));
    process.exit(1);
  }

  const createSpinner = ora('Creating project...').start();

  try {
    const emitter = degit(`${TEMPLATES_REPO}/${template}`, {
      cache: false,
      force: true,
    });

    await emitter.clone(targetDir);
    createSpinner.succeed(chalk.green('Template installed'));
    console.log();
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.gray(`  cd ${projectName.trim()}`));
    console.log(chalk.gray('  npm install'));
    console.log(chalk.gray('  pinarkive login   # if not already'));
  } catch (err: unknown) {
    createSpinner.fail(chalk.red('Failed to create project'));
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(message));
    process.exit(1);
  }
}

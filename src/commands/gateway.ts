import chalk from 'chalk';
import { getGatewayUrl } from '../api';

export async function gatewayCommand(cid: string): Promise<void> {
  if (!cid?.trim()) {
    console.error(chalk.red('CID is required.'));
    process.exit(1);
  }

  const url = getGatewayUrl(cid.trim());
  console.log(url);
}

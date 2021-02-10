import * as fs from 'fs';

import * as proc from './proc';

export function toBase64Url(input: string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function writeToFile(path: string, content: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, error => {
      if (error) reject(error);
      else resolve();
    });
  });
}

export function generateTemporaryFile(): Promise<string> {
  return proc.exec('mktemp');
}

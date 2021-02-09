import * as proc from 'child_process';

export function shell(command: string): Promise<void> {
  const sh = proc.spawn(command, { shell: true });
  sh.stdout.on('data', data => console.log(`${data}`));
  sh.stderr.on('data', data => console.log(`${data}`));

  return new Promise((resolve, reject) => {
    sh.on('exit', resolve);
    sh.on('error', reject);
  });
}

import * as proc from 'child_process';

export function shell(command: string): Promise<void> {
  const sh = proc.spawn(command, { shell: true });
  sh.stdout.on('data', data => console.log(`${data}`));
  sh.stderr.on('data', data => console.log(`${data}`));

  return new Promise((resolve, reject) => {
    sh.on('error', error => reject(error));
    sh.on('exit', code => {
      if (code) reject(new Error(`Command '${command}' exited with '${code}'`));
      else resolve();
    });
  });
}

export function exec(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const p = proc.execSync(command);
      const output = Buffer.from(p)
        .toString()
        .trim();
      resolve(output);
    } catch (error) {
      reject(error);
    }
  });
}

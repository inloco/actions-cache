import * as core from '@actions/core';
import * as io from '@actions/io';
import * as glob from '@actions/glob';
import * as utils from './utils'
import * as auth from './auth';
import * as proc from './proc';

async function run(): Promise<void> {
  try {
    if (core.getState('cache-hit')) {
      core.info('Cache hit, skipping save...');
    } else {
      core.info('Preparing to save cache...');

      core.info('Retrieving credentials...');
      const key = core.getInput('key', { required: true });
      const authResponse = await auth.get(key, auth.Type.Upload);
      core.setSecret(authResponse.accessKeyId);
      core.setSecret(authResponse.secretAccessKey);
      core.setSecret(authResponse.sessionToken);

      core.info('Setting up environment...');
      process.env.AWS_ACCESS_KEY_ID = authResponse.accessKeyId;
      process.env.AWS_SECRET_ACCESS_KEY = authResponse.secretAccessKey;
      process.env.AWS_SESSION_TOKEN = authResponse.sessionToken;
      process.env.S3_PATH = authResponse.s3ObjectPath;

      core.info('Generating files list...');
      const patterns = core
        .getInput('path', { required: true })
        .split('\n')
        .map(s => s.trim())
        .filter(x => x !== '');
      const globber = await glob.create(patterns.join('\n'));
      const files = await globber.glob();
      await utils.writeToFile('CACHEFILE.txt', files.join('\n'));

      core.info('Saving cache...');
      await proc.shell('tar -c -T CACHEFILE.txt | aws s3 cp - $S3_PATH');
      await io.rmRF('CACHEFILE.txt');
    }
  } catch (error) {
    core.setFailed(error);
  }
}

run();

export default run;

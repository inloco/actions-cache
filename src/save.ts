import * as core from '@actions/core';
import * as glob from '@actions/glob';
import * as io from '@actions/io';

import * as auth from './auth';
import * as proc from './proc';
import * as utils from './utils';

async function run(): Promise<void> {
  try {
    if (core.getState('cache-hit') === 'true') {
      core.info('Cache hit, skipping save...');
    } else {
      core.info('Preparing to save cache...');

      core.info('Retrieving credentials...');
      const key = core.getInput('key', { required: true });
      const response = await auth.get(key, auth.Type.Upload);

      if (response === null) {
        core.warning('Failed to get credentials');
        return;
      }

      core.setSecret(response.accessKeyId);
      core.setSecret(response.secretAccessKey);
      core.setSecret(response.sessionToken);

      core.info('Setting up environment...');
      process.env.AWS_ACCESS_KEY_ID = response.accessKeyId;
      process.env.AWS_SECRET_ACCESS_KEY = response.secretAccessKey;
      process.env.AWS_SESSION_TOKEN = response.sessionToken;
      process.env.S3_PATH = response.s3ObjectPath;

      core.info('Generating files list...');
      const patterns = utils.getInputArray('path', true);
      const globber = await glob.create(patterns.join('\n'));
      const files = await globber.glob();
      const tmp = await utils.generateTemporaryFile();
      await utils.writeToFile(tmp, files.join('\n'));

      core.info('Saving cache...');
      await proc.shell(`tar -c -T ${tmp} | aws s3 cp - $S3_PATH`);
      await io.rmRF(tmp);
    }
  } catch (error) {
    core.setFailed(error);
  }
}

run();

export default run;

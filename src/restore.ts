import * as core from '@actions/core';

import * as auth from './auth';
import * as proc from './proc';
import * as utils from './utils';

async function run(): Promise<void> {
  try {
    core.info('Retrieving credentials...');
    const key = core.getInput('key', { required: true });
    const restoreKeys = utils.getInputArray('restore-keys');
    const response = await auth.get(key, auth.Type.Download, restoreKeys);

    if (response == null) {
      core.info('Cache not found!');
      core.saveState('cache-hit', false);
      core.setOutput('cache-hit', false);
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

    core.info(`Cache hit: ${response.cacheHit}`);
    core.info('Restoring cache...');
    await proc.shell(`aws s3 cp $S3_PATH - | tar -xf - -C /`);

    core.saveState('cache-hit', response.cacheHit);
    core.setOutput('cache-hit', response.cacheHit);
  } catch (error) {
    core.setFailed(error);
  }
}

run();

export default run;

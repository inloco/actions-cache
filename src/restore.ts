import * as core from '@actions/core';

import * as auth from './auth';
import * as proc from './proc';

async function run(): Promise<void> {
  try {
    core.info('Retrieving credentials...');
    const key = core.getInput('key', { required: true });
    const authResponse = await auth.get(key, auth.Type.Download);
    core.setSecret(authResponse.accessKeyId);
    core.setSecret(authResponse.secretAccessKey);
    core.setSecret(authResponse.sessionToken);

    core.info('Setting up environment...');
    process.env.AWS_ACCESS_KEY_ID = authResponse.accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = authResponse.secretAccessKey;
    process.env.AWS_SESSION_TOKEN = authResponse.sessionToken;
    process.env.S3_PATH = authResponse.s3ObjectPath;

    if (!authResponse.cacheHit) {
      core.info('Cache not found!');
    } else {
      core.info('Restoring cache...');
      await proc.shell(`aws s3 cp $S3_PATH - | tar -xf - -C /`);
    }
    core.saveState('cache-hit', authResponse.cacheHit);
    core.setOutput('cache-hit', authResponse.cacheHit);
  } catch (error) {
    core.setFailed(error);
  }
}

run();

export default run;

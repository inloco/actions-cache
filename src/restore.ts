import * as core from '@actions/core';

import restore from '../node_modules/cache/dist/restore';

async function run(): Promise<void> {
  process.env['ACTIONS_CACHE_URL'] = core.getInput('cache-url', { required: true });

  const runtimeURL = core.getInput('runtime-url')
  if (runtimeURL) {
    process.env['ACTIONS_RUNTIME_URL'] = runtimeURL;
  }

  const runtimeToken = core.getInput('runtime-token')
  if (runtimeToken) {
    process.env['ACTIONS_RUNTIME_TOKEN'] = runtimeToken;
  }

  return restore();
}

run();

export default run;

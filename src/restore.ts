import * as core from '@actions/core';

import restore from '../node_modules/cache/dist/restore';

async function run(): Promise<void> {
  const newCacheURL = core.getInput('cache-url', { required: true }).replace(/\/$/, '');
  const oldCacheURL = Buffer.from(process.env['ACTIONS_CACHE_URL']!).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
  process.env['ACTIONS_CACHE_URL'] = `${newCacheURL}/${oldCacheURL}/`;

  return restore();
}

run();

export default run;

import axios from 'axios';

import * as utils from './utils';

const BASE_URL = 'http://service.artifactcache.svc.cluster.local';

const defaultCacheUrl = utils.toBase64Url(process.env['ACTIONS_CACHE_URL']!);

const authReqOpts = {
  headers: {
    Authorization: `Bearer ${process.env.ACTIONS_RUNTIME_TOKEN}`,
  },
  validateStatus: (status): boolean => status < 300,
};

export enum Type {
  Download = 'download',
  Upload = 'upload',
}

export class Response {
  constructor(
    public accessKeyId: string,
    public secretAccessKey: string,
    public sessionToken: string,
    public s3ObjectPath: string,
    public cacheHit: boolean
  ) {}
}

export async function get(cacheKey: string, type: Type): Promise<Response> {
  const url = `${BASE_URL}/${defaultCacheUrl}/assumeRole/${cacheKey}/${type}`;
  const response = await axios.get(url, authReqOpts);

  const data = new Response(
    response.data['AccessKeyId'],
    response.data['SecretAccessKey'],
    response.data['SessionToken'],
    response.data['ObjectS3URI'],
    response.data['CacheHit']
  );

  if (
    data.accessKeyId === '' ||
    data.secretAccessKey === '' ||
    data.sessionToken === '' ||
    data.s3ObjectPath == ''
  ) {
    const dataStr = JSON.stringify(data);
    const status = response.status;
    throw new Error(`auth: invalid response (status ${status}): ${dataStr}`);
  }

  return data;
}

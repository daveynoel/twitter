import request from 'request-promise';

export default async options => {
  options.method = options.method || 'GET';

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Encoding': 'deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'max-age=0',
    'x-forwarded-for': '127.0.0.1'
  };

  if (options.headers) {
    for (const key of Object.keys(options.headers)) {
      headers[key] = options.headers[key];
    }
  }

  const settings = {
    ...options,
    proxy: options.proxy,
    uri: options.uri,
    method: options.method,
    json: options.json,
    followAllRedirects: options.followAllRedirects,
    headers,
    simple: false,
    resolveWithFullResponse: true
  };
  //console.log('settings options--->',options)

  if (options.body) settings.body = options.body;

  if (options.form) settings.form = options.form;

  //console.log('settings--->',settings)

  return await request.defaults({ jar: true })(settings);
};

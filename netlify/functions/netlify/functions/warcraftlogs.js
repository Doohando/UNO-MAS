exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }
  const clientId = process.env.WL_CLIENT_ID;
  const clientSecret = process.env.WL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'WarcraftLogs credentials not configured on server.' }),
    };
  }
  let url, options;
  try {
    const parsed = JSON.parse(event.body);
    url = parsed.url;
    options = parsed.options || {};
    if (url.includes('/oauth/token')) {
      options.body = `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`;
      options.method = 'POST';
      options.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    }
  } catch(e) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Invalid body' }),
    };
  }
  try {
    const response = await fetch(url, {
      method: options.method || 'POST',
      headers: options.headers || {},
      body: options.body || null,
    });
    const data = await response.text();
    return {
      statusCode: response.status,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: data,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};

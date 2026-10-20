const https = require('https');

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const httpGetJson = (url, headers) =>
  new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(
            new Error(`TronGrid request failed (${res.statusCode}): ${data}`)
          );
        }
        try {
          return resolve(JSON.parse(data));
        } catch (err) {
          return reject(new Error(`Invalid JSON from TronGrid: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
  });

const requestWithRetry = async (url, headers, retries) => {
  let attempt = 0;
  let lastError;

  while (attempt < retries) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const payload = await httpGetJson(url, headers);
      return payload;
    } catch (err) {
      lastError = err;
      attempt += 1;
      if (attempt >= retries) break;
      // eslint-disable-next-line no-await-in-loop
      await sleep(500 * attempt);
    }
  }

  throw lastError;
};

const normalizeTrc20Amount = (tx) => {
  const value = tx && tx.value ? Number(tx.value) : 0;
  const decimals =
    tx && tx.token_info && tx.token_info.decimals !== undefined
      ? Number(tx.token_info.decimals)
      : 6;
  if (!Number.isFinite(value) || !Number.isFinite(decimals)) return 0;
  return value / 10 ** decimals;
};

exports.getUsdtTransactionsByAddress = async ({
  address,
  contractAddress,
  minTimestamp,
  apiKey,
}) => {
  const base = `https://api.trongrid.io/v1/accounts/${encodeURIComponent(
    address
  )}/transactions/trc20`;

  const query = [
    'only_confirmed=true',
    'limit=200',
    `contract_address=${encodeURIComponent(contractAddress)}`,
    `min_timestamp=${Number(minTimestamp)}`,
  ].join('&');

  const url = `${base}?${query}`;
  const headers = {};
  if (apiKey) headers['TRON-PRO-API-KEY'] = apiKey;

  const payload = await requestWithRetry(url, headers, 3);
  const transactions =
    payload && Array.isArray(payload.data) ? payload.data : [];

  return transactions.map((tx) => ({
    txHash: tx.transaction_id,
    to: tx.to,
    from: tx.from,
    amount: normalizeTrc20Amount(tx),
    timestamp: tx.block_timestamp,
    raw: tx,
  }));
};


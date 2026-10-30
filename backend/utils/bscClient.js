const https = require('https');

const USDT_BEP20_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

const RPC_ENDPOINTS = [
  'https://bsc-rpc.publicnode.com',
  'https://bsc.meowrpc.com',
  'https://1rpc.io/bnb',
  'https://bsc-dataseed.binance.org',
  'https://bsc-dataseed1.binance.org',
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const roundToUsdt = (value) => Number(Number(value).toFixed(6));

const rpcPost = (rpcUrl, method, params = []) =>
  new Promise((resolve, reject) => {
    const parsed = new URL(rpcUrl);
    const body = JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    });

    const req = https.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname + parsed.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: 8000,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error(`RPC ${parsed.hostname} returned status ${res.statusCode}`));
          }
          try {
            const parsedJson = JSON.parse(raw);
            if (parsedJson.error) {
              return reject(new Error(`RPC Error [${parsedJson.error.code}]: ${parsedJson.error.message}`));
            }
            resolve(parsedJson.result);
          } catch (e) {
            reject(new Error(`Invalid JSON from ${parsed.hostname}: ${e.message}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`RPC timeout on ${parsed.hostname}`));
    });

    req.write(body);
    req.end();
  });

const callRpcWithFailover = async (method, params = []) => {
  let lastError = null;
  for (let i = 0; i < RPC_ENDPOINTS.length; i += 1) {
    const endpoint = RPC_ENDPOINTS[i];
    try {
      // eslint-disable-next-line no-await-in-loop
      const result = await rpcPost(endpoint, method, params);
      return result;
    } catch (err) {
      lastError = err;
      // eslint-disable-next-line no-await-in-loop
      await sleep(150);
    }
  }
  throw lastError || new Error('All BSC RPC endpoints failed');
};

const padAddressToTopic = (address) => {
  const clean = String(address || '').trim().toLowerCase().replace(/^0x/, '');
  return `0x${'0'.repeat(64 - clean.length)}${clean}`;
};

const extractAddressFromTopic = (topic) => {
  if (!topic || topic.length < 26) return '';
  return `0x${topic.slice(-40).toLowerCase()}`;
};

/**
 * Fetches incoming BEP-20 USDT transfer logs for a specific recipient wallet address
 */
exports.getBep20UsdtTransactionsByAddress = async ({
  address,
  contractAddress = USDT_BEP20_CONTRACT,
  blockLookback = 500, // ~25 minutes on BSC (3s block time)
}) => {
  if (!address) return [];

  const cleanAddress = address.trim().toLowerCase();
  const targetContract = (contractAddress || USDT_BEP20_CONTRACT).trim().toLowerCase();
  const paddedTo = padAddressToTopic(cleanAddress);

  const blockHex = await callRpcWithFailover('eth_blockNumber');
  const currentBlock = parseInt(blockHex, 16);
  const fromBlock = Math.max(0, currentBlock - blockLookback);
  const fromHex = `0x${fromBlock.toString(16)}`;

  const logs = await callRpcWithFailover('eth_getLogs', [
    {
      fromBlock: fromHex,
      toBlock: 'latest',
      address: targetContract,
      topics: [TRANSFER_TOPIC, null, paddedTo],
    },
  ]);

  if (!Array.isArray(logs) || logs.length === 0) {
    return [];
  }

  const now = Date.now();
  return logs
    .map((log) => {
      try {
        const to = extractAddressFromTopic(log.topics[2]);
        const from = extractAddressFromTopic(log.topics[1]);
        const rawValue = BigInt(log.data);
        const amount = roundToUsdt(Number(rawValue) / 1e18);
        const logBlock = parseInt(log.blockNumber, 16);
        // Estimate timestamp based on block difference (3000ms per block on BSC)
        const blockDiff = currentBlock - logBlock;
        const timestamp = now - blockDiff * 3000;

        return {
          txHash: log.transactionHash,
          to,
          from,
          amount,
          blockNumber: logBlock,
          timestamp,
          raw: log,
        };
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);
};

/**
 * Verifies a single transaction receipt on BSC blockchain directly
 */
exports.verifyBep20TransactionReceipt = async ({
  txHash,
  expectedTo,
  contractAddress = USDT_BEP20_CONTRACT,
}) => {
  if (!txHash) {
    return { verified: false, reason: 'Missing txHash' };
  }

  const cleanTxHash = txHash.trim();
  const allowedAddresses = Array.isArray(expectedTo)
    ? expectedTo.map((a) => String(a || '').trim().toLowerCase()).filter(Boolean)
    : expectedTo
    ? [String(expectedTo).trim().toLowerCase()]
    : [];
  const targetContract = (contractAddress || USDT_BEP20_CONTRACT).trim().toLowerCase();

  const receipt = await callRpcWithFailover('eth_getTransactionReceipt', [cleanTxHash]);
  if (!receipt) {
    return { verified: false, reason: 'Transaction receipt not found yet on BSC' };
  }

  if (receipt.status !== '0x1') {
    return { verified: false, reason: 'Transaction failed or reverted on BSC' };
  }

  const logs = Array.isArray(receipt.logs) ? receipt.logs : [];
  for (let i = 0; i < logs.length; i += 1) {
    const log = logs[i];
    if (
      log &&
      log.address &&
      log.address.toLowerCase() === targetContract &&
      Array.isArray(log.topics) &&
      log.topics[0] === TRANSFER_TOPIC &&
      log.topics[2]
    ) {
      const recipient = extractAddressFromTopic(log.topics[2]);
      const isRecipientMatch = allowedAddresses.length === 0 || allowedAddresses.includes(recipient);
      if (isRecipientMatch) {
        const rawValue = BigInt(log.data);
        const amount = roundToUsdt(Number(rawValue) / 1e18);
        const sender = extractAddressFromTopic(log.topics[1]);

        return {
          verified: true,
          txHash: receipt.transactionHash,
          from: sender,
          to: recipient,
          amount,
          blockNumber: parseInt(receipt.blockNumber, 16),
        };
      }
    }
  }

  return { verified: false, reason: 'No matching USDT transfer found in transaction receipt' };
};

exports.USDT_BEP20_CONTRACT = USDT_BEP20_CONTRACT;

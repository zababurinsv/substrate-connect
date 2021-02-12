import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import { ApiPromise } from '@polkadot/api';
import {SmoldotProvider} from '../';
import {logger} from '@polkadot/util';
import { FsDatabase } from '../FsDatabase';

// polyfill for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const l = logger('examples');

let api: ApiPromise | undefined = undefined;


beforeAll(async () => {
  const chainSpec = await readFile(join(__dirname, 'westend.json'), 'utf-8');
  const database = new FsDatabase('test');
  const provider = new SmoldotProvider(chainSpec, database);
  await provider.connect();
  api = await ApiPromise.create({ provider });
  l.log('API is ready');
  expect(api);
});

test('API constants', async () => {
  if (!api) { throw new Error('api was not initialised by before hook'); }
  const genesisHash = api.genesisHash.toHex();
  l.log('genesis hash: ', genesisHash);
  expect(genesisHash).not.toBe('');
  const epochDuration = api.consts.babe.epochDuration.toNumber();
  l.log('epoch duration: ', epochDuration);
  expect(epochDuration > 0).toBe(true);
  const existentialDeposit = api.consts.balances.existentialDeposit.toHuman();
  l.log('existentialDeposit' , existentialDeposit);
  expect(genesisHash).not.toBe('');
});

// This errors and error handling isnt yet implemented for storage queries
// in smoldot: https://github.com/paritytech/smoldot/issues/388
test.skip('State queries', async t => {
  if (!api) { throw new Error('api was not initialised by before hook'); }
  const testAddress = '5FHyraDcRvSYCoSrhe8LiBLdKmuL9ptZ5tEtAtqfKfeHxA4y';
  const now = await api.query.timestamp.now();
  const { nonce, data: balance } = await api.query.system.account(testAddress);
  l.log(`balance of ${balance.free} and a nonce of ${nonce}`);
  expect(true);
});

test('RPC queries', async () => {
  if (!api) { throw new Error('api was not initialised by before hook'); }
  const chain = await api.rpc.system.chain();
  const lastHeader = await api.rpc.chain.getHeader();
  l.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`);
  expect(true);
});

test('RPC query subscriptions', async () => {
  if (!api) { throw new Error('api was not initialised by before hook'); }
  const chain = await api.rpc.system.chain();

  return new Promise<void>((resolve, reject) => {
    if (!api) { throw new Error('api was not initialised by before hook'); }
    let unsubscribe: any = undefined;
    return api.rpc.chain.subscribeNewHeads((lastHeader: any) => {
      l.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`);
      unsubscribe();
      expect(true);
      resolve();
    }).then(cb => {
      unsubscribe = cb;
    });
  });
});

import express from 'express';
import morgan from 'morgan';
import { join } from 'path';
import { pagesRouter } from './routes/pages-router';
import { staticsRouter } from './routes/statics-router';
import * as config from './config';

console.log(`*******************************************`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`config: ${JSON.stringify(config, null, 2)}`);
console.log(`*******************************************`);

const app = express();
const cwd = process.cwd();

app.use(morgan('common'));
app.set('view engine', 'ejs');

app.get('/polkadot/polkadot_cli_bg.wasm', (req, res) => {
  res.setHeader('content-type', 'application/wasm')
  res.sendFile(join(cwd, 'assets', 'wasm', 'polkadot', 'polkadot_cli_bg.wasm'));
});

app.use('/assets', express.static(join(cwd, 'assets')));
app.use(staticsRouter());
app.use(pagesRouter());

app.listen(config.SERVER_PORT, () => {
  console.log(`App listening on port ${config.SERVER_PORT}!`);
});

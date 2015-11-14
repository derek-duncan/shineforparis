'use strict';

// Dependencies
import Koa from 'koa';
import logger from 'koa-logger';
import mount from 'koa-mount';
import convert from 'koa-convert';
import serve from 'koa-static-cache';
import co from 'co';
import json from 'koa-json';
import compress from 'koa-compress';
import path from 'path';
import redis from 'redis';

import config from './config.js';

import lightsController from './lights/lightsController.js';

// Main app
const app = new Koa();

// Connect to redis
let client = redis.createClient();
client.on('error', err => {
  console.log(err);
});

// Setup Koa modules
app.use(convert(logger()));
app.use(convert(json()));

// Routes
let lightsRoutes = lightsController.routes();
app.use(co.wrap(lightsRoutes));

// Serve static files
let publicDirectory = path.join(__dirname, 'public');
let cacheOptions = {
  maxAge: 60 * 60 * 24,
  gzip: true
};
app.use(convert(serve(publicDirectory, cacheOptions)));

app.use(convert(compress()));

app.listen(config.koa.port);
console.log(`listening on port ${config.koa.port}`);

export default app;


'use strict';

// Dependencies
import Koa from 'koa';
import logger from 'koa-logger';
import convert from 'koa-convert';
import serve from 'koa-static-cache';
import co from 'co';
import json from 'koa-json';
import compress from 'koa-compress';
import mongoose from 'mongoose';
import path from 'path';
import socket from 'socket.io';
import http from 'http';

import config from './config.js';

import lightsController from './lights/lightsController.js';
import lightsActions from './lights/lightsActions.js';

// Main app
const app = new Koa();

// Connect to mongoose
const connect = () => {
  const options = {
    server: {
      socketOptions: {
        keepAlive: 1
      }
    }
  };
  mongoose.connect(config.mongodb.url, options);
};
connect();
mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);

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

const server = http.createServer(app.callback());

// Setup socket.io
let io = socket(server);

io.on('connection', function(socket){
  let ipAddress = socket.handshake.address;

  lightsActions.list().then(lights => {
    socket.emit('init', lights);
  });

  lightsActions.exists(ipAddress).then(exists => {
    if (exists) {
      socket.emit('already lit up', true);
    }
  });

  socket.on('light it up', data => {

    let entry = {
      ipAddress: ipAddress
    };

    lightsActions.add(entry).then(light => {
      socket.emit('lit up', 'success');
      socket.broadcast.emit('someone lit it up', light.ip);
    });
  });

  socket.on('disconnect', function() {
    // User is gone
  });
});

server.listen(config.koa.port);
console.log(`listening on port ${config.koa.port}`);

export default app;



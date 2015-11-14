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
  lightsActions.list().then(lights => {
    socket.emit('init', lights);
  });

  socket.on('light it up', data => {

    let entry = {
      ipAddress: socket.handshake.address
    };

    lightsActions.add(entry).then(light => {
      socket.emit('more light', light);
    });
  });

  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});

server.listen(config.koa.port);
console.log(`listening on port ${config.koa.port}`);

export default app;



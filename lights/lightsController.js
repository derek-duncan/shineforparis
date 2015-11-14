// Dependencies
import co from 'co';
import convert from 'koa-convert';
import Router from 'koa-66';

import config from '../config.js';
import render from '../lib/render.js';

const router = new Router();

// All routes are mounted with the /posts prefix
router.get('/', co.wrap(home));

export default router;

/**
 * Home
 */
function *home(ctx, next) {
  ctx.body = yield render('home');
}

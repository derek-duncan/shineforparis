import co from 'co';
import mongoose from 'mongoose';

import Light from './lightsModel.js';

let actions = {
  list: list,
  add: add,
  exists: exists
};

export default actions;

/**
 * List
 */
function list() {
  return co(function *() {
    let lights = yield Light.find({}).exec();
    return lights;
  });
}

/**
 * Add
 */
function add(data) {
  return co(function *() {

    let exists = yield actions.exists();
    if (exists) throw new Error('light exists');

    let light = new Light({
      ip: data.ipAddress
    });

    try {
      yield light.save();
      return light;
    } catch(err) {
      throw err;
    }
  });
}

/**
 * Exists
 */
function exists(ip) {
  return co(function *() {
    let exists = yield Light.findOne({ ip: ip });
    return exists ? true : false;
  });
}

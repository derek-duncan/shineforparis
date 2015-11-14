import co from 'co';
import mongoose from 'mongoose';

import Light from './lightsModel.js';

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

let actions = {
  list: list,
  add: add
};

export default actions;

import mongoose from 'mongoose';
import shortid from 'shortid';

const Schema = mongoose.Schema;

let LightSchema = new Schema({
  _id: { type: String, default: shortid.generate },
  ip: { type: String },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('Light', LightSchema);

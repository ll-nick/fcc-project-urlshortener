const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
console.log("Connected to database");

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 }
});

const urlSchema = new mongoose.Schema({
  url: {type: String, unique: true},
  short: { type: Number, unique: true }
});

urlSchema.pre('save', async function (next) {
    try {
      const counter = await Counter.findOneAndUpdate({ name: 'urlShortCounter' }, { $inc: { value: 1 } });
      this.short = counter.value;
      next();
    } catch (error) {
      next(error);
    }
  });

const Counter = mongoose.model('Counter', counterSchema);
const Url = mongoose.model('Url', urlSchema);

module.exports = { Counter, Url };

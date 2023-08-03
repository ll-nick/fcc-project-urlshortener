require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

const app = express();


// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
console.log("Connected to database")

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 }
});

const urlSchema = new mongoose.Schema({
  url: {type: String, unique: true},
  short: { type: Number, unique: true }
});

async function initializeCounter() {
  try {
    const existingCounter = await Counter.findOne({ name: 'urlShortCounter' });
    if (!existingCounter) {
      const newCounter = new Counter({ name: 'urlShortCounter' });
      await newCounter.save();
    }
    console.log('Counter initialized.');
  } catch (error) {
    console.error('Error initializing counter:', error);
  }
}

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

initializeCounter();

// Helper functions
const isValidUrl = urlString=> {
  try { 
    let url = new URL(urlString)
    return url.protocol === 'http:' || url.protocol === 'https:';
  }
  catch(e){ 
    return false; 
  }
}

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', async (req, res) => {
  let url = req.body.url;

  if (!isValidUrl(url)) {
    res.json({error: 'invalid url'})
  }

  try {
    // Check if the URL exists in the database
    const existingUrl = await Url.findOne({ url: url });

    if (existingUrl) {
      // If the URL already exists, send the response using the existing entry
      res.json({
        original_url: existingUrl.url,
        short_url: existingUrl.short
      });
    } else {

      const newUrl = new Url({
        url: url
      });
      
      // Save the new URL object
      newUrl.save((err, savedUrl) => {
        if (err) {
          console.error(err);
        } else {
          res.json({
            original_url: newUrl.url,
            short_url: newUrl.short
          })
        }
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while processing the URL.' });
  }

});

app.get('/api/shorturl/:url', (req, res) => {
  let url = req.params.url;
  if (!url.match(/^[0-9]+$/)) {
    res.send("Short url must be an integer.")
  } 
  
  Url.findOne({short: url})
  .then(searchResult => {
    if (searchResult) {
      res.redirect(searchResult.url)
    } else {
      res.send("Short url not in database. Please enter valid short url.")
    }
  })
  .catch(err => console.error(err))
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

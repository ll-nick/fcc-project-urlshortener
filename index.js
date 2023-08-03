require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

const app = express();

mongoose.connect(process.env.MONGO_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
console.log("Connected to database")

// Basic Configuration
const port = process.env.PORT || 3000;

const isValidUrl = urlString=> {
  try { 
    return Boolean(new URL(urlString)); 
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

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  if (!isValidUrl(req.body.url)) {
    res.json({error: 'invalid url'})
  }

  res.json({
    original_url: req.body.url
  })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

const { Counter } = require('./db');

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

module.exports = initializeCounter;

const path = require('path');
console.log('Looking for .env at:', path.resolve(__dirname, '.env'));

require('dotenv').config({ debug: true });  // Enable debug mode
console.log('API Key:', process.env.OPENAI_API_KEY || 'NOT FOUND');
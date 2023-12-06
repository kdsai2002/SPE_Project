const crypto = require('crypto');

// Generate a random key
const jwtSecretKey = crypto.randomBytes(64).toString('hex');

console.log(jwtSecretKey);

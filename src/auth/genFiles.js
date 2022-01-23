const fs = require('fs');
const { generateKeyPair } = require('crypto');
require('dotenv').config();

const secret = process.env.GEN_SECRET;

generateKeyPair('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
    cipher: 'aes-256-cbc',
    passphrase: secret
  }
}, (err, publicKey, privateKey) => {
    fs.writeFileSync('public.pem', publicKey);
    fs.writeFileSync('private.key', privateKey);
    }
);
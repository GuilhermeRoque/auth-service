const fs = require('fs');
const { generateKeyPairSync } = require('crypto');
require('dotenv').config()

const passphrase = process.env.GEN_SECRET
const privateKeyPath = process.env.PRIVATE_KEY
const publicKeyPath = process.env.PUBLIC_KEY

const {publicKey, privateKey} = generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: passphrase
      }
    })

fs.writeFileSync(publicKeyPath, publicKey);
fs.writeFileSync(privateKeyPath, privateKey);

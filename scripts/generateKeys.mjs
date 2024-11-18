import fs from 'fs';
import crypto from 'crypto';

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
    },
    privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
    },
});

fs.writeFileSync('certs/private.pem', privateKey);
fs.writeFileSync('certs/public.pem', publicKey);

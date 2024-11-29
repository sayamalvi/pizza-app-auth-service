import fs from 'fs';
import rsaPemToJwk from 'rsa-pem-to-jwk';

const privateKey = fs.readFileSync('./certs/private.pem', { encoding: 'utf8' });

const jwk = rsaPemToJwk(privateKey, { use: 'sig' }, 'public');

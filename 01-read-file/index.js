const fs = require('fs');
const { join } = require('path');
const { stdout } = require('process');

const pathFile = join(__dirname, 'text.txt');

let readableStream = fs.createReadStream(pathFile, 'utf8');
readableStream.pipe(stdout);

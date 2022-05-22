const fs = require('fs');
const { join } = require('path');
const { stdin, stdout } = require('process');
const readline = require('readline');

const pathFile = join(__dirname, 'text.txt');
fs.open('text.txt', 'a', (err) => {
  if (err) throw err;
});
let writeStream = fs.createWriteStream(pathFile, 'utf8');

const rl = readline.createInterface({ input: stdin, output: writeStream });

stdout.write(
  '\x1b[31m' + 'Enter text, click to finish "CTRL + C" or "exit"\n' + '\x1b[0m'
);

rl.on('line', (line) => {
  if (line.toLowerCase().split(' ').indexOf('exit') !== -1) {
    writeStream.write(line.replace(/exit/gi, ''));
    process.emit('SIGINT');
  }
  writeStream.write(line + '\n');
});

process.on('SIGINT', () => {
  rl.close();
  stdout.write('\x1b[31m' + 'Finished. Good bye' + '\x1b[0m');
  process.exit();
});

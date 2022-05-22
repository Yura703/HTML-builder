const { open, readdir } = require('fs/promises');
const fs = require('fs');
const { join, extname } = require('path');

async function mergeStyles(input, output) {
  const pathInput = input ?? join(__dirname, 'styles');
  const pathOutput = output ?? join(__dirname, 'project-dist', 'bundle.css');

  const fd = await open(pathOutput, 'a');
  const ws = fs.createWriteStream(pathOutput, 'utf8');

  const infoDir = await readdir(pathInput, { withFileTypes: true });

  for (let i = 0; i < infoDir.length; i++) {
    if (extname(infoDir[i].name) !== '.css') {
      break;
    } else {
      const rs = fs.createReadStream(join(pathInput, infoDir[i].name), 'utf8');
      //rs.on('end', () => ws.write('\n'));
      rs.pipe(ws);
    }
  }
  fd.close();
}

mergeStyles();

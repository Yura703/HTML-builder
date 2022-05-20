const { mkdir, open, rm, copyFile, readdir } = require('fs/promises');
const fs = require('fs');
const { join } = require('path');

async function main(input, output) {
  const pathInput = input ?? join(__dirname, 'styles');
  const pathOutput = output ?? join(__dirname, 'project-dist', 'bundle.css');

  await open(pathOutput, 'a');
  const ws = fs.createWriteStream(pathOutput, 'utf8');

  const infoDir = await readdir(pathInput, { withFileTypes: true });

  for (let i = 0; i < infoDir.length; i++) {
    if (infoDir[i].isDirectory()) {
      await main(join(pathInput, infoDir[i].name), undefined);
    } else {
      const rs = fs.createReadStream(join(pathInput, infoDir[i].name), 'utf8');
      await rs.pipe(ws);
      ws.close();
    }
  }
}

main();

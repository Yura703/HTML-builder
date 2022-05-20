const { readdir, stat } = require('fs/promises');
const { join, extname } = require('path');

const path = join(__dirname, 'secret-folder');

async function main() {
  const infoDir = await readdir(path, { withFileTypes: true });

  for (let i = 0; i < infoDir.length; i++) {
    const path = join(__dirname, 'secret-folder', infoDir[i].name);
    const statFile = await stat(path);

    if (!statFile.isDirectory()) {
      const index = infoDir[i].name.lastIndexOf('.');
      const name = infoDir[i].name.slice(0, index);
      console.log(
        `${name} - ${extname(path).slice(1)} -  ${
          Math.round((statFile.size / 1024) * 100) / 100
        }kb`
      );
    }
  }
}

main();

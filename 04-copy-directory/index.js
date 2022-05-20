const { mkdir, rm, copyFile, readdir } = require('fs/promises');
const { join } = require('path');

async function copyDir(input, output) {
  const pathInput = input ?? join(__dirname, 'files');
  const pathOutput = output ?? join(__dirname, 'files-copy');

  await rm(pathOutput, { recursive: true, force: true });
  await mkdir(pathOutput, { recursive: true });

  const infoDir = await readdir(pathInput, { withFileTypes: true });

  for (let i = 0; i < infoDir.length; i++) {
    if (infoDir[i].isDirectory()) {
      await copyDir(
        join(pathInput, infoDir[i].name),
        join(pathOutput, infoDir[i].name)
      );
    } else
      await copyFile(
        join(pathInput, infoDir[i].name),
        join(pathOutput, infoDir[i].name)
      );
  }
}

copyDir();

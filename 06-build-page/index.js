const { mkdir, rm, open, copyFile, readdir } = require('fs/promises');
const { join, extname } = require('path');
const fs = require('fs');
const readline = require('readline');
const { Transform, pipeline } = require('stream');

async function main() {
  const path = join(__dirname, 'project-dist');
  await rm(path, { recursive: true, force: true });
  await mkdir(path, { recursive: true });

  await copyDir(join(__dirname, 'assets'), join(path, 'assets'));

  await mergeStyles(join(__dirname, 'styles'), join(path, 'style.css'));

  await open(join(path, 'index.html'), 'a');

  const ws = fs.createWriteStream(join(path, 'index.html'), 'utf8');
  const rs = fs.createReadStream(join(__dirname, 'template.html'), 'utf8');
  const ts = new Transform({
    transform(chunk, enc, cb) {
      getTags(chunk.toString()).then((data) => {
        chunk = data;
        this.push(chunk);
        cb();
      });
    },
  });
  pipeline(rs, ts, ws, (err) => {
    if (err) console.log(err);
  });
}

async function getTags(chunk) {
  let str = chunk;

  while (str.match(/{{.*}}/g)) {
    const sample = str.match(/{{.*}}/g)[0].slice(2, -2);

    await readFile(join(__dirname, 'components', `${sample}.html`)).then(
      (data) => {
        str = str.replace(`{{${sample}}}`, data);
      }
    );
  }

  return str;
}

async function readFile(path) {
  let str = '';

  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    str += line + '\n';
  }

  rl.close();
  fileStream.close();
  return str;
}

async function mergeStyles(input, output) {
  const pathInput = input;
  const pathOutput = output;

  const fd = await open(pathOutput, 'a');
  const ws = fs.createWriteStream(pathOutput, 'utf8');

  const infoDir = await readdir(pathInput, { withFileTypes: true });

  for (let i = 0; i < infoDir.length; i++) {
    if (extname(infoDir[i].name) !== '.css') {
      break;
    } else {
      const rs = fs.createReadStream(join(pathInput, infoDir[i].name), 'utf8');
      rs.on('data', () => ws.write('\n'));
      rs.pipe(ws);
    }
  }
  fd.close();
}

async function copyDir(input, output) {
  const pathInput = input;
  const pathOutput = output;

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

main();

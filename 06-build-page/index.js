const { mkdir, rm, open, copyFile, readdir } = require('fs/promises');
const { join, extname } = require('path');
const fs = require('fs');
const readline = require('readline');
const { Transform, pipeline } = require('stream');

async function main() {
  const path = join(__dirname, 'project-dist');
  await rm(path, { recursive: true, force: true });
  await mkdir(path, { recursive: true });

  copyDir(join(__dirname, 'assets'), join(path, 'assets')); //ошибка раз в 4 раза

  mergeStyles(join(__dirname, 'styles'), join(path, 'style.css'));

  let header = '';
  await readFile(join(__dirname, 'components', 'header.html')).then((data) => {
    header = data;
  });

  let articles = '';
  await readFile(join(__dirname, 'components', 'articles.html')).then(
    (data) => {
      articles = data;
    }
  );

  let footer = '';
  await readFile(join(__dirname, 'components', 'footer.html')).then((data) => {
    footer = data;
  });

  await open(join(path, 'index.html'), 'a');

  const ws = fs.createWriteStream(join(path, 'index.html'), 'utf8');
  const rs = fs.createReadStream(join(__dirname, 'template.html'), 'utf8');
  const ts = new Transform({
    transform(chunk, enc, cb) {
      chunk = chunk.toString().replace('{{header}}', header);
      chunk = chunk.toString().replace('{{articles}}', articles);
      chunk = chunk.toString().replace('{{footer}}', footer);

      this.push(chunk);
      cb();
    },
  });
  pipeline(rs, ts, ws, (err) => {
    if (err) console.log(err);
  });
}

async function readFile(path) {
  let ss = '';

  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    ss += line + '\n';
  }

  rl.close();
  fileStream.close();
  return ss;
}

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

main();

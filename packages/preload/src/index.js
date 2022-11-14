const fs = require('fs');
const path = require('path');

export {sha256sum} from './nodeCrypto';
export {versions} from './versions';
export {cmd} from './cmd.js';

export function readFile(name) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve('../xiudongPupp', name), 'utf-8', (e, res) => {
      if (e) {
        reject(e);
        return;
      }
      resolve(res);
    });
  });
}

export function writeFile(name, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.resolve('../xiudongPupp', name), data, (e) => {
      if (e) {
        reject(e);
        return;
      }
      resolve();
    });
  });
}
export function readDir(name) {
  return fs.readdirSync(path.resolve('../xiudongPupp', name));
}

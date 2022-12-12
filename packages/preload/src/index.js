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
    fs.writeFile(path.resolve('../xiudongPupp', name), data, e => {
      if (e) {
        reject(e);
        return;
      }
      resolve();
    });
  });
}
export function readDir(name) {
  return new Promise((resolve, reject) => {
    fs.readdir(path.resolve('../xiudongPupp', name), (e, data) => {
      if (e) {
        reject(e);
        return;
      }
      resolve(data);
    });
  });
}

export function rename(dir, newName) {
  return new Promise((resolve, reject) => {
    let fs = require('fs');
    let file = path.resolve('../xiudongPupp', dir);
    let newFile = path.resolve('../xiudongPupp', newName);

    fs.rename(file, newFile, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function rmDir(dir) {
  let util = require('util');
  let stat = util.promisify(fs.stat);
  let readdir = util.promisify(fs.readdir);
  let rmdir = util.promisify(fs.rmdir);
  let unlink = util.promisify(fs.unlink);

  let realDir = path.resolve('../xiudongPupp', dir);
  async function removeDir(p) {
    let statObj = await stat(p);
    if (statObj.isDirectory()) {
      let dirs = await readdir(p);
      dirs = dirs.map(dir => path.join(p, dir));
      let promises = dirs.map(dir => removeDir(dir));
      await Promise.all(promises);
      await rmdir(p);
    } else {
      // 要等待文件删除后 才让promise执行完 所以需要await
      await unlink(p);
    }
  }
  await removeDir(realDir);
}


export function  getComputerName  () {
  let os = require('os');
  let map = {
    'DESKTOP-AAKRGOM': '宏基',
    CCRPC028: '公司',
    'DESKTOP-3ML3QTF': '虚拟机',
    'DESKTOP-U1N2FOL': '联想',
    'DESKTOP-STTL34E': '新电脑',
  };
  let hostname = os.hostname();
  return map[hostname] || hostname;
}

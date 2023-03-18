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

export function getComputerName() {
  let os = require('os');
  let map = {
    'DESKTOP-AAKRGOM': '宏基',
    CCRPC028: '公司',
    'DESKTOP-43': '虚拟机4.3',
    'DESKTOP-3ML3QTF': '虚拟机4.4',
    'DESKTOP-U1N2FOL': '联想',
    'DESKTOP-STTL34E': '新电脑',
  };
  let hostname = os.hostname();
  return map[hostname] || hostname;
}

export function readClip() {
  let {clipboard} = require('electron');
  return clipboard.readText().trim().replace('尊敬的用户，你的UID是：', '');
}
export function copyText(str) {
  let {clipboard} = require('electron');
  return clipboard.writeText(str);
}

export function sendMsgToMain(eventName, val) {
  const {ipcRenderer} = require('electron');
  ipcRenderer.send(eventName, val);
}

export function sendStop() {
    const child = require('child_process');

    return new Promise((resolve, reject) => {
      child.execFile(path.resolve(__dirname,'../../..//sendStop.exe'), (err, stdout, stderr) => {
        console.log({ err, stdout, stderr });
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }



export function getContentLength(formData) {
  return new Promise((resolve, reject) => {
    formData.getLength(async (err, length) => {
      if (err) {
        reject(err);
      }
      resolve(length);
    });
  });
}

export function zip(dest, zipPath) {
  let AdmZip = require('adm-zip');
  const file = new AdmZip();
  // 压缩文件夹
  file.addLocalFolder(dest);
  console.time();
  file.writeZip(zipPath);
  console.timeEnd();
}

export function unZip(dest, name) {
  let AdmZip = require('adm-zip');
  let filePath = path.resolve(dest, name + '.zip');
  const admzip = new AdmZip(filePath);
  admzip.extractAllTo(path.resolve(dest, name));
  fs.unlinkSync(filePath);
}

export async function cloneRemoteConfig(ip, username, data) {
  let http = require('http');
  return new Promise((resolve, reject) => {
    http
      .get(`http://${ip}:4000/downloadConfig?username=${username}`, res => {
        let folder = path.resolve(__dirname, '../../../../xiudongPupp/userData/');
        const dest = path.resolve(folder, username + '.zip');

        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', async () => {
          file.close();
          await unZip(folder, username);
          let config = await readFile('config.json');
          config = JSON.parse(config);
          config[username] = data;
          await writeFile('config.json', JSON.stringify(config, null, 4));
          resolve();
        });
      })
      .on('error', err => {
        console.log('Error: ', err.message);
        reject(err);
      });
  });
}

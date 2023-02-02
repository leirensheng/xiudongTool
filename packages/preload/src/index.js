import axios from 'axios';

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

export function openExe() {
  const {shell} = require('electron');
  const path = require('path');
  const app = path.resolve(__dirname, '../../../../xiudongServer/dist/server.exe');
  shell.openExternal(app);
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

export async function copyFile(name) {
  const fs = require('fs');
  const axios = require('axios');
  const path = require('path');
  const FormData = require('form-data');
  console.log(0);
  const dest = path.resolve(__dirname, '../../../../xiudongPupp/userData/', name);
  console.log(111, dest, name);
  const zipPath = path.resolve(dest, name + '.zip');
  zip(dest, zipPath);

  var localFile = fs.createReadStream(zipPath);
  var formData = new FormData();
  formData.append('file', localFile);
  let rest = formData.get('file');
  console.log(rest);
  console.log(formData);
  var headers = formData.getHeaders(); //获取headers

  formData.getLength(async function (err, length) {
    if (err) {
      return;
    }
    //设置长度，important!!!
    headers['content-length'] = length;
    console.log(12, length);
    await axios
      .post('http://127.0.0.1:4000/file', formData, {'Content-Type': 'multipart/formData'})
      .then(res => {
        console.log('上传成功', res.data);
      })
      .catch(res => {
        console.log(res.data);
      });
  });
  // var headers = formData.getHeaders();
  // headers['content-length'] = await getContentLength(formData);
}

export async function cloneRemoteConfig(ip, username, data) {
  let http = require('http');
  http
    .get(`http://${ip}:4000/downloadConfig?username=${username}`, res => {
      const dest = path.resolve(__dirname, '../../../../xiudongPupp/userData/', username + '.zip');

      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
      });
    })
    .on('error', err => {
      console.log('Error: ', err.message);
    });
  // console.log('done');
}

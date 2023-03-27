import {refreshIp} from '#preload';
import {ElNotification} from 'element-plus';
import axios from 'axios';

export function debounce(fn, time = 2500) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.call(this, ...args);
    }, time);
  };
}

let getRunningCheck = pidInfo => {
  let cmds = Object.keys(pidInfo).filter(one => one.includes('npm run check'));
  let res = [];
  cmds.forEach(cmd => {
    if (cmd.match(/check \d+ (\d+-\d+)/)) {
      let [start, end] = cmd.match(/check \d+ (\d+-\d+)/)[1].split('-');
      let isNotData = cmd.includes('useNot');

      let startWith = isNotData ? 'not_data' : 'data';
      let length = end - start + 1;
      let arr = Array.from({length}, (_, index) => startWith + (index + Number(start)));
      res = [...res, ...arr];
    }
  });
  return res;
};

let getRunningUser = pidInfo => {
  let cmds = Object.keys(pidInfo).filter(one => one.includes('npm run start'));
  let res = cmds.map(cmd => cmd.match(/npm run start (.*?)(\s|$)/)[1]);
  return res;
};

let getIp = async () => {
  try {
    let ip = await refreshIp();
    ElNotification({
      title: 'DNS更新成功',
      message: ip,
      type: 'success',
    });
  } catch (e) {
    ElNotification({
      title: 'DNS更新出错',
      type: 'error',
    });
  }
};

let startCmdWithPidInfo = (cmd, successMsg = '信息获取完成') => {
  return new Promise((resolve, reject) => {
    const socketURL = 'ws://127.0.0.1:4000/socket/';
    axios
      .get('http://127.0.0.1:4000/terminal')
      .then(res => res.data)
      .then(pid => {
        console.log('新增进程:' + pid);
        let ws = new WebSocket(socketURL + pid);
        ws.onmessage = ({data}) => {
          if (data.includes(successMsg)) {
            ws.close();
            resolve(pid);
          } else if (data.includes('需要登陆')) {
            ws.close();
            axios.get('http://127.0.0.1:4000/close/' + pid);
            reject(new Error(cmd + '需要登录'));
          }
        };
        ws.onopen = () => {
          ws.send(`${cmd} \r\n`);
        };
      });
  });
};
let sleep = time =>
  new Promise(r => {
    setTimeout(r, time);
  });
export {getRunningCheck, getRunningUser, getIp, startCmdWithPidInfo, sleep};

import {refreshDns, readDir} from '#preload';
import {ElNotification} from 'element-plus';
import axios from 'axios';
import {useStore} from '/@/store/global';
import {storeToRefs} from 'pinia';

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
    let regRes = cmd.match(/check(Many)? [\d-]+ (\d+-\d+)/);
    if (regRes) {
      let [start, end] = regRes[2].split('-');
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
    let ip = await refreshDns();
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
      .then(res => res.data.data)
      .then(pid => {
        console.log('新增进程:' + pid);
        let ws = new WebSocket(socketURL + pid);
        ws.onmessage = ({data}) => {
          if (data.includes(successMsg)) {
            ws.close();
            resolve(pid);
          } else if (data.includes('需要登陆') || data.includes('at ')) {
            //报错会出现at
            ws.close();
            axios.get('http://127.0.0.1:4000/close/' + pid);
            reject(new Error(cmd + '需要登录或报错'));
          }
        };
        ws.onopen = () => {
          ws.send(`${cmd} \r\n`);
        };
      });
  });
};

let stopCmd = async cmd => {
  let store = useStore();
  let {setPidInfo} = store;
  let {pidInfo} = storeToRefs(store);
  let pid = pidInfo[cmd];
  await axios.get('http://127.0.0.1:4000/close/' + pid);
  delete pidInfo[cmd];
  setPidInfo({...pidInfo});
};

let sleep = time =>
  new Promise(r => {
    setTimeout(r, time);
  });

let getCheckNumbers = async () => {
  let res = await readDir('checkData');
  let startStr = 'data';
  res = res
    .filter(one => one.indexOf(startStr) === 0)
    .map(one => one.replace(startStr, ''))
    .map(one => Number(one));
  res = res.sort((a, b) => a - b);

  if (!res.length) {
    ElNotification({
      title: 'Error',
      message: '没有有效的以data开头的目录！',
      type: 'error',
    });
    throw new Error('没有有效的以data开头的目录！');
  }
  let isNotOk = res.some((one, index) =>
    index !== res.length - 1 ? one + 1 !== res[index + 1] : false,
  );
  if (isNotOk) {
    ElNotification({
      title: 'Error',
      message: '目录名称不连续, 请修改checkData文件夹名称！',
      type: 'error',
    });
    throw new Error('目录名称不连续');
  }
  return res;
};
export {
  getRunningCheck,
  getCheckNumbers,
  getRunningUser,
  getIp,
  startCmdWithPidInfo,
  sleep,
  stopCmd,
};

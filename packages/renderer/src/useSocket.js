// 引入 Socket.IO 客户端库
import io from 'socket.io-client';
import {useStore} from '/@/store/global';
import eventBus from '/@/utils/eventBus.js';
import {startCmdWithPidInfo} from '/@/utils/index.js';

// 连接到本地服务器
const socket = io('http://localhost:4000', {
  reconnection: true, // 开启自动重连
  reconnectionAttempts: 100000, // 最多重连 10 次
});
window.socket = socket;

// 监听连接成功事件
socket.on('connect', () => {
  console.log('连接成功！');
});

// 监听连接失败事件
socket.on('connect_error', error => {
  console.log('连接失败，错误信息：', error.message);
});

// 监听重连事件
socket.on('reconnect', attemptNumber => {
  console.log(`第 ${attemptNumber} 次重连成功！`);
});

// 监听重连失败事件
socket.on('reconnect_error', error => {
  console.log('重连失败，错误信息：', error.message);
});

window.socket.on('closePid', closePid => {
  console.log('客户端收到的', closePid);
  let store = useStore();
  let {pidInfo} = store;
  for (let [cmd, pid] of Object.entries(pidInfo)) {
    console.log(cmd, pid);
    if (Number(closePid) === Number(pid)) {
      delete pidInfo[cmd];
      eventBus.emit('getUserList');
    }
  }
});

window.socket.on('startUser', async cmd => {
  console.log('客户端收到的', cmd);
  let store = useStore();
  let {pidInfo} = store;
  let isSuccess = false;
  try {
    let pid = await startCmdWithPidInfo(cmd, '信息获取完成');
    pidInfo[cmd] = pid;
    isSuccess = true;
    eventBus.emit('getUserList');
  } catch (e) {
    console.log(e);
  }
  window.socket.emit('startUserDone', isSuccess);
});

window.socket.on('getConfigList', async () => {
  eventBus.emit('getUserList');
});

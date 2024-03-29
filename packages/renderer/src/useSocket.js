// 引入 Socket.IO 客户端库
import {useStore} from '/@/store/global';
import eventBus from '/@/utils/eventBus.js';
import {startCmdWithPidInfo, sleep} from '/@/utils/index.js';

// 连接到本地服务器

// window.socket = socket;

class MySocket {
  constructor() {
    this.heartTimer = null;
    this.connected = false;
    this.socket = null;
    this.toDisconnectedTimer = null;
    this.connect();
  }

  async connect() {
    console.log('尝试连接');
    clearInterval(this.heartTimer);
    clearTimeout(this.toDisconnectedTimer);
    if (this.socket) {
      this.socket.close();
    }

    this.connected = false;
    this.socket = new WebSocket('ws://localhost:4000/electronSocket');
    this.socket.onopen = () => {
      console.log('打开连接', this.socket);
      window.socket = this.socket;
      this.connected = true;
      this.changeToDisconnected();
      this.startHeatBeat();
      this.socket.onmessage = async ({data: str}) => {
        let data = JSON.parse(str);
        if (data.type === 'pong') {
          this.connected = true;
          this.changeToDisconnected();
        } else if (data.type === 'closePid') {
          let closePid = data.pid;
          let store = useStore();
          let {pidInfo} = store;
          for (let [cmd, pid] of Object.entries(pidInfo)) {
            console.log(cmd, pid);
            if (Number(closePid) === Number(pid)) {
              delete pidInfo[cmd];
              eventBus.emit('getUserList');
            }
          }
        } else if (data.type === 'getConfigList') {
          eventBus.emit('getUserList');
        } else if (data.type === 'recover') {
          eventBus.emit('switchTab', 'ConfigManage');
          eventBus.emit('recover');
          eventBus.once('recoverDone', failCmds => {
            console.log('recoverDone');
            this.socket.send(
              JSON.stringify({
                type: 'recoverDone',
                data: {
                  failCmds,
                },
              }),
            );
          });
        } else if (data.type === 'startUser') {
          let {cmd} = data;
          let store = useStore();
          let {pidInfo} = store;
          let isSuccess = false;
          let msg;
          try {
            let res = await startCmdWithPidInfo(cmd, '信息获取完成', true);
            pidInfo[cmd] = res.pid;
            msg = res.msg;
            isSuccess = true;
            eventBus.emit('getUserList');
          } catch (e) {
            console.log(e);
          }
          this.socket.send(
            JSON.stringify({
              type: 'startUserDone',
              data: {
                isSuccess,
                msg,
              },
            }),
          );
        }
      };
    };
    this.socket.onerror = async e => {
      console.log('WebSocket连接打开失败，请检查！', e);
      this.connected = false;
      await sleep(1000);
      this.connect();
    };
  }
  changeToDisconnected() {
    clearTimeout(this.toDisconnectedTimer);
    this.toDisconnectedTimer = setTimeout(() => {
      this.connected = false;
      this.connect();
    }, 30000);
  }

  startHeatBeat() {
    clearInterval(this.heartTimer);
    this.heartTimer = setInterval(() => {
      this.socket.send(JSON.stringify({type: 'ping'}));
    }, 1000);
  }
}

new MySocket();

// window.socket = socket;
// // 监听连接成功事件
// socket.on('connect', () => {
//   console.log('连接成功！');
// });

// // 监听连接失败事件
// socket.on('connect_error', error => {
//   console.log('连接失败，错误信息：', error.message);
// });

// // 监听重连事件
// socket.on('reconnect', attemptNumber => {
//   console.log(`第 ${attemptNumber} 次重连成功！`);
// });

// // 监听重连失败事件
// socket.on('reconnect_error', error => {
//   console.log('重连失败，错误信息：', error.message);
// });

// window.socket.on('closePid', closePid => {
//   console.log('客户端收到的', closePid);
//   let store = useStore();
//   let {pidInfo} = store;
//   for (let [cmd, pid] of Object.entries(pidInfo)) {
//     console.log(cmd, pid);
//     if (Number(closePid) === Number(pid)) {
//       delete pidInfo[cmd];
//       eventBus.emit('getUserList');
//     }
//   }
// });

// window.socket.on('startUser', async cmd => {
//   console.log('客户端收到的', cmd);
//   let store = useStore();
//   let {pidInfo} = store;
//   let isSuccess = false;
//   try {
//     let pid = await startCmdWithPidInfo(cmd, '信息获取完成');
//     pidInfo[cmd] = pid;
//     isSuccess = true;
//     eventBus.emit('getUserList');
//   } catch (e) {
//     console.log(e);
//   }
//   window.socket.emit('startUserDone', isSuccess);
// });

// window.socket.on('getConfigList', async () => {
//   eventBus.emit('getUserList');
// });

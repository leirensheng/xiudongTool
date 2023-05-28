const {exec} = require('child_process');

let cmd = ({cmd, successStr, failStr, isSuccessStop}) =>
  new Promise((resolve, reject) => {
    let data = '';
    let child = exec(cmd);
    child.stdout.on('data', cur => {
      data += cur;
      if (data.includes(failStr)) {
        reject();
      } else if (data.includes(successStr)) {
        resolve();
        if (isSuccessStop) {
          cmd('taskkill /T /F /PID ' + child.pid);
        }
      }
    });
    child.stderr.on('data', data => {
      console.log(data);
      reject();
    });
  });

let startServer = async () => {
  try {
    await cmd({
      cmd: 'pm2 restart index',
      successStr: 'Applying action restartProcessId on app',
      isSuccessStop: false,
    });
  } catch (e) {
    await cmd({
      cmd: 'cd ../xiudongServer && pm2 start index',
    });
  }
};

export {startServer};

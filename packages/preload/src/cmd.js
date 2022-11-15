const shell = require('shelljs');

export function cmd(str, cb) {
  var child = shell.exec(str, {async: true, silent: true});
  if (cb) {
    child.stdout.on('data', cb);
    child.stderr.on('data', cb);
    child.stdout.on('end', () => {
      cb('done');
    });
  }
  child.close = () => {
    cmd('taskkill /T /F /PID ' + child.pid);
  };
  return child;
}

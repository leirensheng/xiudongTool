// eslint-disable-next-line import/prefer-default-export
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

export {getRunningCheck};

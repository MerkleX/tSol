const spawn = require('child_process').spawn;

module.exports = function(file_path) {
  return new Promise((resolve, reject) => {
    const ps = spawn('cpp', ['-P', file_path]);

    const data = [];

    ps.stdin.setEncoding('utf-8');
    ps.stdout.setEncoding('utf-8');

    ps.stdout.on('data', buf => {
      data.push(buf);
    });

    ps.stdout.on('end', () => {
      resolve(data.join(''));
    });

    ps.on('error', err => {
      reject(err);
    });

    ps.stdin.end();
  });
};

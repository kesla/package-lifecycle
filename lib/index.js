import {join} from 'path';

import readJSON from 'then-read-json';
import {getIn} from 'immutable-object-methods';
import {exec} from 'mz/child_process';

const runScript = async ({dir, script}) => {
  const [stdout, stderr] = await exec(script, {
    cwd: dir
  });
  if (stdout.length) {
    process.stdout.write(stdout);
  }
  if (stderr.length) {
    process.stderr.write(stderr);
  }
};

module.exports = async ({dir}) => {
  const pkg = await readJSON(join(dir, 'package.json'));
  return {
    preinstall: () => runScript({dir, script: getIn(pkg, ['scripts', 'preinstall'])}),
    install: () => runScript({dir, script: getIn(pkg, ['scripts', 'install'])}),
    postinstall: () => runScript({dir, script: getIn(pkg, ['scripts', 'postinstall'])})
  };
};

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

module.exports = async ({dir, install: installPromise}) => {
  const pkg = await readJSON(join(dir, 'package.json'));
  const preinstall = getIn(pkg, ['scripts', 'preinstall']);
  if (preinstall) {
    await runScript({dir, script: preinstall});
  }
  await installPromise();
};

import {join} from 'path';

import readJSON from 'then-read-json';
import {set, getIn} from 'immutable-object-methods';
import {exec} from 'mz/child_process';
import {exists} from 'mz/fs';
import promisify from 'promisify-function';
import _npmPath from 'npm-path';

const npmPath = promisify(_npmPath);

const runScript = async ({dir, script}) => {
  const path = await npmPath({cwd: dir});
  const env = set(process.env, 'PATH', path);

  const [stdout, stderr] = await exec(script, {cwd: dir, env});
  process.stdout.write(stdout);
  process.stderr.write(stderr);
};

module.exports = async ({dir}) => {
  const pkg = await readJSON(join(dir, 'package.json'));
  return {
    preinstall: () => runScript({dir, script: getIn(pkg, ['scripts', 'preinstall'])}),
    install: async () => {
      const script = getIn(pkg, ['scripts', 'install']);
      if (script) {
        await runScript({dir, script});
      } else if (await exists(join(dir, 'binding.gyp'))) {
        await runScript({dir, script: 'node-gyp rebuild'});
      }
    },
    postinstall: () => runScript({dir, script: getIn(pkg, ['scripts', 'postinstall'])})
  };
};

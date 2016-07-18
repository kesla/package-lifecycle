import {join} from 'path';

import tmp from 'then-tmp';
import fs from 'mz/fs';
import test from 'tapava';
import packageLifecycle from './lib';

test('packageLifecycle(), empty package.json', async t => {
  const {path: dir} = await tmp.dir();
  await fs.writeFile(join(dir, 'package.json'), '{}');

  await t.notThrows(packageLifecycle({
    dir, install: () => Promise.resolve(null)
  }));
});

test('packageLifecycle(), preinstall', async t => {
  const {path: dir} = await tmp.dir();
  await fs.writeFile(join(dir, 'package.json'), JSON.stringify({
    scripts: {
      preinstall: 'touch preinstall'
    }
  }));

  let installCalled = false;
  await packageLifecycle({
    dir, install: async () => {
      installCalled = true;
      t.true(await fs.exists(join(dir, 'preinstall')));
      t.false(await fs.exists(join(__dirname, 'preinstall')));
      return Promise.resolve(null);
    }
  });
  t.true(installCalled);
});

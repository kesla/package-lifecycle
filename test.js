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

  const {preinstall, install, postinstall} = await packageLifecycle({dir});

  await preinstall();
  await install();
  await postinstall();
  t.true(await fs.exists(join(dir, 'preinstall')));
  t.false(await fs.exists(join(__dirname, 'preinstall')));
});

test('packageLifecycle(), install', async t => {
  const {path: dir} = await tmp.dir();
  await fs.writeFile(join(dir, 'package.json'), JSON.stringify({
    scripts: {
      install: 'touch install'
    }
  }));

  const {preinstall, install, postinstall} = await packageLifecycle({dir});

  await preinstall();
  await install();
  await postinstall();
  t.true(await fs.exists(join(dir, 'install')));
  t.false(await fs.exists(join(__dirname, 'install')));
});

test('packageLifecycle(), postinstall', async t => {
  const {path: dir} = await tmp.dir();
  await fs.writeFile(join(dir, 'package.json'), JSON.stringify({
    scripts: {
      postinstall: 'touch postinstall'
    }
  }));

  const {preinstall, install, postinstall} = await packageLifecycle({dir});

  await preinstall();
  await install();
  await postinstall();
  t.true(await fs.exists(join(dir, 'postinstall')));
  t.false(await fs.exists(join(__dirname, 'postinstall')));
});

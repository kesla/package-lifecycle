import {join} from 'path';

import tmp from 'then-tmp';
import fs from 'mz/fs';
import test from 'tapava';
import packageLifecycle from './lib';

test('packageLifecycle(), empty package.json', async t => {
  const {path: dir} = await tmp.dir();
  await fs.writeFile(join(dir, 'package.json'), '{}');

  const {preinstall, install, postinstall} = await packageLifecycle({
    dir, install: () => Promise.resolve(null)
  });

  t.notThrows(preinstall());
  t.notThrows(install());
  t.notThrows(postinstall());
});

test('packageLifecycle(), preinstall', async t => {
  const {path: dir} = await tmp.dir();
  await fs.writeFile(join(dir, 'package.json'), JSON.stringify({
    scripts: {
      preinstall: 'touch preinstall'
    }
  }));

  const {preinstall} = await packageLifecycle({dir});

  await preinstall();
  t.true(await fs.exists(join(dir, 'preinstall')));
  t.false(await fs.exists(join(__dirname, 'preinstall')));
});

test('packageLifecycle() install', async t => {
  const {path: dir} = await tmp.dir();
  await fs.writeFile(join(dir, 'package.json'), JSON.stringify({
    scripts: {
      install: 'touch install'
    }
  }));

  const {install} = await packageLifecycle({dir});

  await install();
  t.true(await fs.exists(join(dir, 'install')));
  t.false(await fs.exists(join(__dirname, 'install')));
});

test('packageLifecycle() binding.gyp file + custom install script', async t => {
  const {path: dir} = await tmp.dir();
  await fs.writeFile(join(dir, 'binding.gyp'), '{}');
  await fs.writeFile(join(dir, 'package.json'), JSON.stringify({
    scripts: {
      install: 'touch install'
    }
  }));

  const {install} = await packageLifecycle({dir});

  await install();
  t.true(await fs.exists(join(dir, 'install')));
  t.false(await fs.exists(join(__dirname, 'install')));
});

test('packageLifecycle(), binding.gyp file, no custom install script', async t => {
  const {path: dir} = await tmp.dir();
  await fs.writeFile(join(dir, 'binding.cc'), '');
  await fs.writeFile(join(dir, 'binding.gyp'), `{
    'targets': [{
      'target_name': 'binding',
      'sources': [ 'binding.cc' ]
    }]
  }`);
  await fs.writeFile(join(dir, 'package.json'), JSON.stringify({}));

  const {install} = await packageLifecycle({dir});

  await install();
  t.true(await fs.exists(join(dir, 'build/Release/binding.node')));
  t.false(await fs.exists(join(__dirname, 'build')));
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

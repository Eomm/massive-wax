'use strict'

const { test } = require('tap')
const proxyquire = require('proxyquire')

const cmd = proxyquire('../src/commands/upgrade', {
  '../github': require('./proxy/github.proxy'),
  '../git-repo': require('./proxy/git-repo.proxy')
})

test('Mandatory params', t => {
  t.plan(2)
  cmd.run([])
    .then(() => { t.fail() })
    .catch(err => {
      t.like(err.message, 'Missing required flag')
      t.ok(err, 'should throw for mandatory params')
    })
})

test('Run', t => {
  t.plan(1)

  cmd.run([
    '-r', 'https://github.com/pkgjs/nv',
    '-t', '123-GITHUB-TOKEN-123',
    '-p', './proxy/toMit.js'
  ])
    .then(() => { t.pass() })
    .catch(err => {
      t.error(err)
      t.fail('it must not fail')
    })
})

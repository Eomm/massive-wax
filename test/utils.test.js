'use strict'

const { test } = require('tap')
const utils = require('../src/utils')

test('parse repo urls', t => {
  t.plan(1)
  const out = utils.parseRepo(['https://github.com/Eomm/massive-wax'])
  t.same(out, [{ owner: 'Eomm', repo: 'massive-wax', href: 'https://github.com/Eomm/massive-wax' }])
})

test('ignore wrong data', t => {
  t.plan(1)
  const out = utils.parseRepo(['this is not a url', 'https://oclif.io/docs/multi', null, ''])
  t.same(out, [])
})

test('read a file', t => {
  t.plan(1)
  const out = utils.parseRepo(['https://github.com/Eomm/massive-wax', './test/asset/repo-list.txt'])
  t.same(out, [
    { owner: 'Eomm', repo: 'massive-wax', href: 'https://github.com/Eomm/massive-wax' },
    { owner: 'fastify', repo: 'fastify', href: 'https://github.com/fastify/fastify' },
    { owner: 'nodejs', repo: 'package-maintenance', href: 'https://github.com/nodejs/package-maintenance' },
    { owner: 'Eomm', repo: 'kingdis', href: 'https://github.com/Eomm/kingdis' },
    { owner: 'standard', repo: 'awesome-standard', href: 'https://github.com/standard/awesome-standard' }
  ])
})

'use strict'

const path = require('path')
const { test } = require('tap')
const helper = require('./helper')
const cmd = helper.buildCommand()

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
    '-K', '123-GITHUB-TOKEN-123',
    '-p', './proxy/toMit.js'
  ])
    .then(() => { t.pass() })
    .catch(err => {
      t.error(err)
      t.fail('it must not fail')
    })
})

test('Fork Clone Commit PR', t => {
  t.plan(12)
  const cmd = helper.buildCommand({
    async onFork (ghRepo) {
      t.deepEquals(ghRepo, { owner: 'pkgjs', repo: 'support', href: 'https://github.com/pkgjs/support' })
      return {
        clone_url: 'clone_url',
        full_name: 'full_name',
        owner: { login: 'lolologin' }
      }
    },
    async onClone (ghUrl, localPath) {
      t.equals(ghUrl, 'clone_url')
      t.equals(localPath, path.join(process.cwd(), 'full_name'))
    },
    async onBranch (branchName) {
      t.equals(branchName, 'branch-name')
    },
    async onAdd (fileFilter) {
      // TODO
    },
    async onCommit ({ message }) {
      t.equals(message, 'commit-message')
    },
    async onPush ([_, remote, branchName]) {
      t.equals(remote, 'origin')
      t.equals(branchName, 'branch-name')
    },
    async onPR (repo, to, title, body) {
      t.deepEquals(repo, { owner: 'pkgjs', repo: 'support', href: 'https://github.com/pkgjs/support' })
      t.deepEquals(to, {
        head: 'lolologin:branch-name',
        base: 'master'
      })
      t.equals(title, 'PR title')
      t.equals(body, 'PR body')
      return { data: { html_url: 'https://github.com/Eomm/support/pull/2' } }
    }
  })
  cmd.run([
    '-K', '123-GITHUB-TOKEN-123',
    '-r', 'https://github.com/pkgjs/support',
    '-m', 'json$',
    '-b', 'branch-name',
    '-c', 'commit-message',
    '-t', 'PR title',
    '-B', 'PR body',
    '-F', // turn on fork
    '-p', './proxy/toMit.js'
  ])
    .then(() => { t.pass('done') })
    .catch(err => { t.error(err) })
})

test('Clone Commit PR', { skip: true }, t => {
})

test('Commit PR', { skip: true }, t => {
})

test('No PR when no commit', { skip: true }, t => {
})

test('Error on fork', { skip: true }, t => {
})

test('Error on clone', { skip: true }, t => {
})

test('Error on commit', { skip: true }, t => {
})

test('Error on PR', { skip: true }, t => {
})

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
  t.plan(13)
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
      t.equals(fileFilter, './*')
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
    .catch(t.error)
})

test('Clone Commit PR', t => {
  t.plan(1)
  const cmd = helper.buildCommand({
    async onFork (ghRepo) { t.fail('it must not fork the repo') }
  })
  cmd.run([
    '-K', '123-GITHUB-TOKEN-123',
    '-r', 'https://github.com/pkgjs/support',
    '-m', 'json$',
    '-b', 'branch-name',
    '-c', 'commit-message',
    '-t', 'PR title',
    '-B', 'PR body',
    '--no-fork',
    '-p', './proxy/toMit.js'
  ])
    .then(() => { t.pass('done') })
    .catch(t.error)
})

test('Commit PR', t => {
  t.plan(1)
  const cmd = helper.buildCommand({
    async onFork (ghRepo) { t.fail('it must not fork the repo') },
    async onClone (ghUrl, localPath) { t.fail('it must not clone the repo') }
  })
  cmd.run([
    '-K', '123-GITHUB-TOKEN-123',
    '-r', 'https://github.com/pkgjs/support',
    '-m', 'json$',
    '-b', 'branch-name',
    '-c', 'commit-message',
    '-t', 'PR title',
    '-B', 'PR body',
    '--no-clone',
    '-p', './proxy/toMit.js'
  ])
    .then(() => { t.pass('done') })
    .catch(t.error)
})

test('No PR when no commit', t => {
  t.plan(1)
  const cmd = helper.buildCommand({
    async onBranch (branchName) { t.fail('it must not branch the repo') },
    async onAdd (fileFilter) { t.fail('it must not add the repo') },
    async onCommit ({ message }) { t.fail('it must not commit the repo') },
    async onPush ([_, remote, branchName]) { t.fail('it must not push the repo') },
    async onPR (repo, to, title, body) { t.fail('it must not PR the repo') }
  })
  cmd.run([
    '-K', '123-GITHUB-TOKEN-123',
    '-r', 'https://github.com/pkgjs/support',
    '-m', 'json$',
    '--no-commit',
    '-p', './proxy/toMit.js'
  ])
    .then(() => { t.pass('done') })
    .catch(t.error)
})

test('Error on fork', t => {
  t.plan(2)
  const theError = new Error('Bad credentials')
  const cmd = helper.buildCommand({
    async onFork (ghRepo) { throw theError }
  })
  cmd.run([
    '-K', '123-GITHUB-TOKEN-123',
    '-r', 'https://github.com/pkgjs/support',
    '-m', 'json$',
    '-b', 'branch-name',
    '-c', 'commit-message',
    '-t', 'PR title',
    '-B', 'PR body',
    '-F',
    '-p', './proxy/toMit.js'
  ])
    .then(() => { t.fail('must exit with an error') })
    .catch(err => {
      t.pass('it must throw an error')
      t.equals(err.message, theError.message)
    })
})

test('Error on clone', t => {
  t.plan(2)
  const theError = new Error('Bad credentials')
  const cmd = helper.buildCommand({
    async onClone (ghUrl, localPath) { throw theError }
  })
  cmd.run([
    '-K', '123-GITHUB-TOKEN-123',
    '-r', 'https://github.com/pkgjs/support',
    '-m', 'json$',
    '-b', 'branch-name',
    '-c', 'commit-message',
    '-t', 'PR title',
    '-B', 'PR body',
    '-p', './proxy/toMit.js'
  ])
    .then(() => { t.fail('must exit with an error') })
    .catch(err => {
      t.pass('it must throw an error')
      t.equals(err.message, theError.message)
    })
})

test('Error on commit', t => {
  t.plan(2)
  const theError = new Error('Bad credentials')
  const cmd = helper.buildCommand({
    async onCommit ({ message }) { throw theError }
  })
  cmd.run([
    '-K', '123-GITHUB-TOKEN-123',
    '-r', 'https://github.com/pkgjs/support',
    '-m', 'json$',
    '-b', 'branch-name',
    '-c', 'commit-message',
    '-t', 'PR title',
    '-B', 'PR body',
    '-p', './proxy/toMit.js'
  ])
    .then(() => { t.fail('must exit with an error') })
    .catch(err => {
      t.pass('it must throw an error')
      t.equals(err.message, theError.message)
    })
})

test('Error on PR', t => {
  t.plan(2)
  const theError = new Error('Bad credentials')
  const cmd = helper.buildCommand({
    async onPR (repo, to, title, body) { throw theError }
  })
  cmd.run([
    '-K', '123-GITHUB-TOKEN-123',
    '-r', 'https://github.com/pkgjs/support',
    '-m', 'json$',
    '-b', 'branch-name',
    '-c', 'commit-message',
    '-t', 'PR title',
    '-B', 'PR body',
    '-p', './proxy/toMit.js'
  ])
    .then(() => { t.fail('must exit with an error') })
    .catch(err => {
      t.pass('it must throw an error')
      t.equals(err.message, theError.message)
    })
})

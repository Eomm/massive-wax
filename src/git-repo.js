'use strict'

const { promisify } = require('util')
const SimpleGit = require('simple-git')

module.exports = function gitDirectory (path) {
  const cwd = SimpleGit(path)

  const gitStatus = promisify(cwd.status.bind(cwd))
  const gitAdd = promisify(cwd.add.bind(cwd))
  const gitCommit = promisify(cwd.commit.bind(cwd))
  const gitPush = promisify(cwd.push.bind(cwd))
  const gitPull = promisify(cwd.pull.bind(cwd))
  const gitClone = promisify(cwd.clone.bind(cwd))
  const gitBranch = promisify(cwd.checkoutBranch.bind(cwd))

  return {
    clone,
    branch,
    status,
    add,
    commit,
    pull,
    push
  }

  function clone (gitUrl, to) {
    return gitClone(gitUrl, to)
  }

  function branch (branchName, startPoint = 'master') {
    return gitBranch(branchName, startPoint)
  }

  function status () {
    // git diff-index origin/master
    // git diff-index <arg.remote>/<arg.branch>
    // git status --short
    // git status --porcelain

    return gitStatus()
  }

  function add (files) {
    return gitAdd(files)
  }

  function commit ({ message, noVerify }) {
    const options = {}
    if (noVerify === true) {
      options['--no-verify'] = null
    }
    return gitCommit(message, options)
  }

  function push (args) {
    return gitPush(args)
  }

  function pull (remote = 'origin') {
    return gitPull(remote)
  }
}

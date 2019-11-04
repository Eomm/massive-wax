'use strict'

const { promisify } = require('util')
const SimpleGit = require('simple-git')

/* istanbul ignore file */
module.exports = function gitDirectory (path) {
  const cwd = SimpleGit(path)

  const gitAdd = promisify(cwd.add.bind(cwd))
  const gitCommit = promisify(cwd.commit.bind(cwd))
  const gitPush = promisify(cwd.push.bind(cwd))
  const gitClone = promisify(cwd.clone.bind(cwd))
  const gitBranch = promisify(cwd.checkoutBranch.bind(cwd))

  return {
    clone,
    branch,
    add,
    commit,
    push
  }

  function clone (gitUrl, to) {
    return gitClone(gitUrl, to)
  }

  function branch (branchName, startPoint = 'master') {
    return gitBranch(branchName, startPoint)
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
}

'use strict'

const proxyquire = require('proxyquire')

const defaultEvents = {
  async onFork (ghRepo) {
    return {
      clone_url: 'https://github.com/Eomm/nv.git',
      full_name: 'Eomm/nv',
      owner: {
        login: 'Eomm'
      }
    }
  },
  async onClone (ghUrl, localPath) { },
  async onBranch (branchName) { },
  async onAdd (fileFilter) { },
  async onCommit ({ message }) { },
  async onPush ([_, remote, branchName]) { },
  async onPR (repo, to, title, body) {
    return {
      data: {
        html_url: 'https://github.com/Eomm/nv/pull/2'
      }
    }
  }
}

module.exports.buildCommand = (events = {}) => {
  const use = Object.assign({}, defaultEvents, events)

  const gitHub = function build (authConfig) {
    return {
      fork: use.onFork,
      openPR: use.onPR
    }
  }

  const gitDir = function gitDirectory (path) {
    return {
      clone: use.onClone,
      branch: use.onBranch,
      add: use.onAdd,
      commit: use.onCommit,
      push: use.onPush
    }
  }

  const cmd = proxyquire('../src/commands/upgrade', {
    '../github': gitHub,
    '../git-repo': gitDir
  })
  return cmd
}

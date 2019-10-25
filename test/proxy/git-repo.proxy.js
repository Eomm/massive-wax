'use strict'

module.exports = function gitDirectory (path) {
  return {
    clone: () => Promise.resolve(),
    branch: () => Promise.resolve(),
    status: () => Promise.resolve(),
    add: () => Promise.resolve(),
    commit: () => Promise.resolve(),
    pull: () => Promise.resolve(),
    push: () => Promise.resolve()
  }
}

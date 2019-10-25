'use strict'

module.exports = function build (authConfig) {
  return {
    async fork (repo) {
    },
    async openPR (toRepo, fromFork, title, body = 'This is an automatic PR created with massive-wax!') {
    }
  }
}

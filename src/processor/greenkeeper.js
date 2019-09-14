'use strict'

const fs = require('fs')

module.exports = function factory (args) {
  const theModule = args // TODO define the args
  return function (file) {
    if (!file.endsWith('package.json')) {
      return
    }

    const packageJson = require(file)

    if (!packageJson.greenkeeper) {
      packageJson.greenkeeper = { ignore: [] }
    }

    if (packageJson.greenkeeper && packageJson.greenkeeper.ignore) {
      const isIgnored = packageJson.greenkeeper.ignore.includes(theModule)
      if (!isIgnored) {
        packageJson.greenkeeper.ignore.push(theModule)
        fs.writeFileSync(file, JSON.stringify(packageJson, null, 2))
      }
    }
  }
}

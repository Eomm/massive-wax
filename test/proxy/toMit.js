'use strict'

const fs = require('fs')

module.exports = function factory (logger, args) {
  return {
    onRepo (repo) { },
    onFile (file) {
      if (file.endsWith('LICENSE')) {
        fs.writeFileSync(file, fs.readFileSync('./LICENSE'))
        return
      }

      if (!file.endsWith('package.json')) {
        return
      }

      const packageJson = require(file)
      packageJson.license = 'MIT'
      fs.writeFileSync(file, JSON.stringify(packageJson, null, 2))
    },
    onComplete (repo) { }
  }
}

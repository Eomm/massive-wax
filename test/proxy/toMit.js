'use strict'

const fs = require('fs')

module.exports = function factory (args, logger) {
  return {
    onRepo (repo) { },
    onFile (file) {
      logger('processing file......', file)

      if (file.endsWith('LICENSE')) {
        logger('Updated licence')
        fs.writeFileSync(file, fs.readFileSync('./LICENSE'))
      }

      if (!file.endsWith('package.json')) {
        return new Promise(resolve => {
          setTimeout(resolve, 200)
        })
      }

      const packageJson = require(file)
      packageJson.license = 'MIT'
      fs.writeFileSync(file, JSON.stringify(packageJson, null, 2))
    },
    onComplete (repo) {
      logger('completed processor')
    }
  }
}

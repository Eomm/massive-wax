'use strict'

const path = require('path')
const fs = require('fs')

module.exports = function waxOn (options) {
  const opts = Object.assign({
    pattern: /\.js$|\.json$/i
  }, options)

  const fileFilter = (path) => opts.pattern.test(path)

  return {
    updateSourceCode
  }

  function updateSourceCode (directory, onFile) {
    console.log('walking', directory)
    for (const file of walkSync(directory, fileFilter)) {
      // TODO pipeline
      const out = onFile(file)
      // TODO if promise
    }
  }
}

// https://gist.github.com/luciopaiva/4ba78a124704007c702d0293e7ff58dd
function * walkSync (dir, filter) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const pathToFile = path.join(dir, file)
    const isDirectory = fs.statSync(pathToFile).isDirectory()
    if (isDirectory) {
      yield * walkSync(pathToFile, filter)
    } else {
      if (!filter || filter(pathToFile) === true) {
        yield pathToFile
      }
    }
  }
}

'use strict'

const path = require('path')
const fs = require('fs')

module.exports = function waxOn (options) {
  const opts = Object.assign({}, options)

  const pattern = new RegExp(opts.pattern)
  const fileFilter = (path) => pattern.test(path)

  return {
    updateSourceCode
  }

  function updateSourceCode (directory, onFile, onComplete) {
    console.log('walking', directory)

    const iter = walkSync(directory, fileFilter)
    const goNext = () => { next(iter.next().value) }

    if (!onComplete) {
      return new Promise((resolve, reject) => {
        onComplete = resolve
        goNext()
      })
    } else {
      goNext()
    }

    function next (value) {
      if (!value) {
        if (onComplete) {
          onComplete()
        }
        return
      }
      const out = onFile(value)
      if (out && typeof out.then === 'function') {
        out.then(goNext).catch(goNext)
        return
      }
      goNext()
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

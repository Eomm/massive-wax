'use strict'

const os = require('os')
const fs = require('fs')
const parseGitUrl = require('parse-github-url')
const flatMap = require('array.prototype.flatmap')
flatMap.shim()

function parseRepo (reposInput) {
  return reposInput.map(parseGitUrl)
    .map(_ => {
      if (_ && !_.protocol) {
        return fileToLines(_.href).map(parseGitUrl)
      }
      return _
    })
    .flatMap(_ => _)
    .filter(_ => (_ && _.protocol && _.hostname === 'github.com'))
    .map(_ => ({ owner: _.owner, repo: _.name, href: _.href }))
}

function parseProcessor (processorsInput, args, logger, searchPaths = []) {
  return processorsInput.map(processorFile => {
    try {
      const pLoadFile = require.resolve(processorFile, { paths: [...module.paths, ...searchPaths] })
      const processor = require(pLoadFile)
      if (!processor || typeof processor !== 'function') {
        return processor
      }
      return processor(args, logger)
    } catch (error) {
      // TODO log or block??
      return null
    }
  }).filter(_ => _ !== null)
}

function fileToLines (file) {
  try {
    // perdoname madre por mi vida loca
    return fs.readFileSync(file).toString().split(os.EOL)
  } catch (error) {
    return []
  }
}

module.exports = {
  parseRepo,
  parseProcessor
}

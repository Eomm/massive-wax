'use strict'

const os = require('os')
const fs = require('fs')
const path = require('path')
const parseGitUrl = require('parse-github-url')

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

function parseProcessor (processorsInput, args, logger) {
  return processorsInput.map(processorFile => {
    const pLoadFile = path.resolve(processorFile)
    const processor = require(pLoadFile)
    if (!processor || typeof processor !== 'function') {
      throw new Error(`Processor ${processorFile} must be a function!`)
    }
    try {
      return processor(args, logger)
    } catch (error) {
      throw new Error(`Processor ${processorFile} throws an error on build`, error)
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

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

function fileToLines (file) {
  try {
    // perdoname madre por mi vida loca
    return fs.readFileSync(file).toString().split(os.EOL)
  } catch (error) {
    return []
  }
}

module.exports.parseRepo = parseRepo

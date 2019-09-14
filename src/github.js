'use strict'

const Octokit = require('@octokit/rest')
const { spawn } = require('child_process')
const { promisify } = require('util')

const setTime = promisify(setTimeout)

module.exports = function build (authConfig) {
  let auth = authConfig
  if (typeof authConfig === 'string') {
    auth = authConfig
  }

  const githubClient = new Octokit({ auth })

  return {
    async fork (repo) {
      const resp = await githubClient.repos.createFork(repo)
      // TODO manage response
      return waitFork(resp.data)
    },
    async clone (gitUrl, to) {
      console.log('clone', gitUrl, to)
      return new Promise((resolve, reject) => {
        const gitCommand = spawn('git', ['clone', gitUrl, to])
        gitCommand.stdout.setEncoding('utf8')
        gitCommand.stdout.pipe(process.stdout)
        gitCommand.on('close', (code) => {
          if (code === 0) {
            resolve()
            return
          }
          // TODO
          reject(code)
        })
      })
    }
  }

  function waitFork (forkData) {
    const maxRetry = 5
    const retryAfter = 1000

    return new Promise((resolve, reject) => {
      let tentative = 0

      checkStatus()
        .then(() => resolve(forkData))
        .catch(reject)

      function checkStatus () {
        console.log(forkData.url)

        return githubClient.request(`HEAD ${forkData.url}`)
          .catch(err => {
            if (tentative < maxRetry) {
              console.log('Retry', tentative)
              tentative++
              return setTime(retryAfter)
                .then(() => checkStatus())
            }
            throw err
          })
      }
    })
  }
}

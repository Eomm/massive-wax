'use strict'

const Octokit = require('@octokit/rest')
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
    openPR (toRepo, fromFork, title, body = 'This is an automatic PR created with massive-wax!') {
      // https://developer.github.com/v3/pulls/#create-a-pull-request
      return githubClient.pulls.create({
        ...toRepo,
        ...fromFork,
        title,
        body,
        maintainer_can_modify: true,
        draft: false
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

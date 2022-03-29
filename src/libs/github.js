'use strict'

const { Octokit } = require('@octokit/rest')
const pRetry = require('p-retry')

/* istanbul ignore file */
module.exports = function build (authConfig, logger) {
  let auth = authConfig
  if (typeof authConfig === 'string') {
    auth = authConfig
  }

  const githubClient = new Octokit({ auth })

  // githubClient.rest.rateLimit.get()

  return {
    async fork (repo) {
      const resp = await githubClient.repos.createFork(repo)
      // TODO manage response
      return waitFork(resp.data)

      // todo è allineata con il repository origine nel caso sia gia forkato??
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
    return pRetry(async () => {
      await githubClient.request(`HEAD ${forkData.url}`)
      return forkData
    },
    { retries: 5 }
    )
  }
}

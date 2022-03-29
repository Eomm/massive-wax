'use strict'

const { Command } = require('@oclif/core')
const path = require('path')
const pMap = require('p-map')

const flags = require('../core/upgrade/flags')
const docs = require('../core/upgrade/docs')

const Github = require('../libs/github')
const GitDir = require('../git-repo')
const Wax = require('../wax')

const utils = require('../utils')

class UpgradeCommand extends Command {
  async run () {
    const { flags, argv } = await this.parse(this.constructor)
    console.log(flags)

    // 1. connessione a github

    const gh = Github(flags.token, this.log)

    const wax = Wax(flags, this.log)

    // eliminare simple git
    const git = GitDir(flags['work-path'])

    const repos = utils.parseRepo(flags.repo)
    const processors = utils.parseProcessor(flags.processor, argv, this.log)

    const operations = repos.map(async repo => {
      let cloneUrl = repo.href
      let clonePath = `${repo.owner}/${repo.repo}`

      let fork = {}
      if (flags.fork) {
        this.log(`Forking ${cloneUrl}`)
        const forkResponse = await gh.fork(repo)
        cloneUrl = forkResponse.clone_url
        clonePath = forkResponse.full_name
        this.log(`Forked ${cloneUrl}`)
        fork = {
          owner: forkResponse.owner.login
        }
      }

      if (flags.clone) {
        this.log(`Cloning ${cloneUrl} to ${clonePath}`)
        await git.clone(cloneUrl, clonePath)
      }
      clonePath = path.join(flags['work-path'], clonePath)

      // parallel execution
      processors.filter(_ => _.onRepo).forEach(_ => _.onRepo(repo))

      await Promise.all(processors.map(p => {
        // TODO inefficient: multiple traversal on the same dir
        return wax.updateSourceCode(clonePath, p.onFile, p.onComplete)
      }))

      if (flags.commit === false) {
        this.log('Dry run: don\'t commit the processed repo')
        return
      }

      const gitCloned = GitDir(clonePath)
      await gitCloned.branch(flags.branch)
      await gitCloned.add('./*') // ? sure all?
      await gitCloned.commit({ message: flags['commit-message'], noVerify: true })
      this.log(`Commit done for ${repo.repo}`)
      await gitCloned.push(['-u', 'origin', flags.branch])
      this.log(`Push done for ${repo.repo}`)

      if (flags.pr) {
        const prCoordinates = {
          head: `${fork.owner || repo.owner}:${flags.branch}`,
          base: flags['pr-origin']
        }
        const data = await gh.openPR(repo, prCoordinates, flags['pr-title'], flags['pr-body'])
        this.log(`Opened PR: ${data.data.html_url}`)
      }
    })
    return Promise.all(operations)
  }
}

module.exports = Object.assign(UpgradeCommand, docs, flags)

'use strict'

const { Command, flags } = require('@oclif/command')
const path = require('path')

const utils = require('../utils')
const Github = require('../github')
const GitDir = require('../git-repo')
const Wax = require('../wax')

class UpgradeCommand extends Command {
  async run () {
    const { flags, argv } = this.parse(this.constructor)
    const gh = Github(flags.token, this.log)
    const wax = Wax(flags, this.log)
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
          base: 'master' // TODO destination repo
        }
        const data = await gh.openPR(repo, prCoordinates, flags['pr-title'], flags['pr-body'])
        this.log(`Opened PR: ${data.data.html_url}`)
      }
    })
    return Promise.all(operations)
  }
}

UpgradeCommand.description = `Process the files of many GitHub repositories as you want and open PR with changes!
...
This command will:
- fork the repos in the GH account associated with the --token
- clone the repos in your local env
- process all the files of the cloned repos
- commit the changes in a dedicated branch
- open a PR to the master branch in the origin repo

All these steps are optionals.
`

UpgradeCommand.flags = {
  token: flags.string({
    char: 'K',
    description: 'the GitHub token to fork the project and push the changes. You can set it via env named GITHUB_TOKEN',
    env: 'GITHUB_TOKEN'
  }),
  repo: flags.string({
    char: 'r',
    description: 'the URL repo to upgrade. If it is a file, each line of the file must be a repo URL',
    required: true,
    multiple: true
  }),
  'work-path': flags.string({
    char: 'w',
    description: 'current working directory: where cloning the repos',
    default: process.cwd()
  }),
  match: flags.string({
    char: 'm',
    description: 'the files that match this pattern will be processed',
    default: '.js$|.json$'
  }),
  processor: flags.string({
    char: 'p',
    description: 'the processor(s) that will modify the cloned repo. It must be a node module',
    required: true,
    multiple: true
  }),
  branch: flags.string({
    char: 'b',
    description: 'the branch name where apply the changes',
    default: 'wax'
  }),
  'commit-message': flags.string({
    char: 'c',
    description: 'the commit message',
    default: 'wax in action'
  }),
  'pr-title': flags.string({
    char: 't',
    description: 'the title of the PR',
    default: 'automatic PR'
  }),
  'pr-body': flags.string({
    char: 'B',
    description: 'the body message of the PR',
    default: 'This is an automatic PR created with [massive-wax](https://github.com/Eomm/massive-wax)!'
  }),
  fork: flags.boolean({
    char: 'F',
    description: 'fork the project before cloning. Useful if you don\'t have the write grant',
    default: false,
    allowNo: true
  }),
  clone: flags.boolean({
    char: 'L',
    description: 'clone the repo before executing the processors',
    default: true,
    allowNo: true
  }),
  commit: flags.boolean({
    char: 'C',
    description: 'commit the changes',
    default: true,
    allowNo: true
  }),
  pr: flags.boolean({
    char: 'R',
    description: 'open the PR to forked repo',
    default: true,
    allowNo: true
  })
}

UpgradeCommand.examples = [
  'Change all the LICENCE file of your org',
  " $ upgrade -K GITHUB-TOKEN --fork -p='./toMit.js' -t='Changed license' -c='chore changed license' -b licensebranch -r repo-list.txt"
]

module.exports = UpgradeCommand

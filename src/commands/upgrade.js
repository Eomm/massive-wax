'use strict'

const { Command, flags } = require('@oclif/command')
const path = require('path')
const Github = require('../github')
const GitDir = require('../git-repo')
const Wax = require('../wax')

const gkProcess = require('../processor/greenkeeper')

class UpgradeCommand extends Command {
  async run () {
    const gh = Github(flags.token || process.env.GITHUB_TOKEN)
    const wax = Wax()
    let git = GitDir(process.cwd())

    const repo = {
      owner: 'fastify',
      repo: 'fastify-swagger'
    }

    // TODO array of repo
    const resp = await gh.fork(repo)
    console.log(JSON.stringify(resp, null, 2))
    const clonePath = path.join(process.cwd(), resp.full_name)
    console.log('Cloning ', resp.clone_url)
    await git.clone(resp.clone_url, clonePath)

    await wax.updateSourceCode(clonePath, gkProcess('tap'))

    git = GitDir(clonePath)
    await git.branch('wax')
    await git.add('./*')
    await git.commit({ message: 'wax in action', noVerify: true })
    await git.push(['-u', 'origin', 'wax'])

    const source = {
      head: `${resp.owner.login}:wax`,
      // head: `${resp.name}`,
      base: 'master'
    }

    try {
      await gh.openPR(repo, source, 'chore: greenkeeper ignore tap')
    } catch (error) {
      console.log({ error: error.errors })
    }
  }
}

UpgradeCommand.description = `Describe the command here
...
Extra documentation goes here
`

UpgradeCommand.flags = {
  name: flags.string({ char: 'n', description: 'name to print' })
}

module.exports = UpgradeCommand

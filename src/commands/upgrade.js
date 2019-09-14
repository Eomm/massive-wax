'use strict'

const { Command, flags } = require('@oclif/command')
const path = require('path')
const Github = require('../github')
const Wax = require('../wax')

class UpgradeCommand extends Command {
  async run () {
    const gh = Github(flags.token || process.env.GITHUB_TOKEN)
    const wax = Wax()

    const repo = {
      owner: 'fastify',
      repo: 'fastify-env'
    }

    // TODO array of repo
    const resp = await gh.fork(repo)
    console.log(JSON.stringify(resp, null, 2))
    const clonePath = path.join(process.cwd(), resp.full_name)
    await gh.clone(resp.git_url, clonePath) // TODO path

    wax.updateSourceCode(clonePath, (f) => {
      console.log(f)
    })

    // TODO on end branch, commit, push, PR
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

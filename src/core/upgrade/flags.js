'use strict'

const { Flags } = require('@oclif/core')

module.exports = {
  flags: {
    token: Flags.string({
      char: 'K',
      description: 'the GitHub token to fork the project and push the changes. You can set it via env named GITHUB_TOKEN',
      env: 'GITHUB_TOKEN'
    }),
    repo: Flags.string({
      char: 'r',
      description: 'the URL repo to upgrade. If it is a file, each line of the file must be a repo URL',
      required: true,
      multiple: true
    }),
    'work-path': Flags.string({
      char: 'w',
      description: 'current working directory: where cloning the repos',
      default: process.cwd()
    }),
    match: Flags.string({
      char: 'm',
      description: 'the files that match this pattern will be processed',
      default: '.js$|.json$'
    }),
    processor: Flags.string({
      char: 'p',
      description: 'the processor(s) that will modify the cloned repo. It must be a node module',
      required: true,
      multiple: true
    }),
    branch: Flags.string({
      char: 'b',
      description: 'the branch name where apply the changes',
      default: 'wax'
    }),
    'pr-origin': Flags.string({
      char: 'O',
      description: 'the main branch in the origin repo',
      default: 'master'
    }),
    'commit-message': Flags.string({
      char: 'c',
      description: 'the commit message',
      default: 'wax in action'
    }),
    'pr-title': Flags.string({
      char: 't',
      description: 'the title of the PR',
      default: 'automatic PR'
    }),
    'pr-body': Flags.string({
      char: 'B',
      description: 'the body message of the PR',
      default: 'This is an automatic PR created with [massive-wax](https://github.com/Eomm/massive-wax)!'
    }),
    fork: Flags.boolean({
      char: 'F',
      description: 'fork the project before cloning. Useful if you don\'t have the write grant',
      default: false,
      allowNo: true
    }),
    clone: Flags.boolean({
      char: 'L',
      description: 'clone the repo before executing the processors',
      default: true,
      allowNo: true
    }),
    commit: Flags.boolean({
      char: 'C',
      description: 'commit the changes',
      default: true,
      allowNo: true
    }),
    pr: Flags.boolean({
      char: 'R',
      description: 'open the PR to forked repo',
      default: true,
      allowNo: true
    })
  }
}

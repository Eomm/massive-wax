massive-wax
===========

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/massive-wax.svg)](https://npmjs.org/package/massive-wax)
[![Downloads/week](https://img.shields.io/npm/dw/massive-wax.svg)](https://npmjs.org/package/massive-wax)
[![License](https://img.shields.io/npm/l/massive-wax.svg)](https://github.com/Eomm/massive-wax/blob/master/package.json)

Edit every file of a list of GitHub repositories and open a PR ✨

This tool will:

- fork
- clone
- edit the files
- submit a PR

for you!

Example?

- update all the package's of your ORG with the new `greenkeeper.ignore`
- add the new `support` field in your `package.json`
- update the LICENSE of your repos
- all the things that are boring and need to be done to all your repos!!

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g massive-wax
$ massive-wax COMMAND
running command...
$ massive-wax (-v|--version|version)
massive-wax/1.0.0 win32-x64 node-v10.11.0
$ massive-wax --help [COMMAND]
USAGE
  $ massive-wax COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`massive-wax help [COMMAND]`](#massive-wax-help-command)
* [`massive-wax upgrade`](#massive-wax-upgrade)

## `massive-wax help [COMMAND]`

display help for massive-wax

```
USAGE
  $ massive-wax help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src\commands\help.ts)_

## `massive-wax upgrade`

Process the files of many GitHub repositories as you want and open PR with changes!

```
USAGE
  $ massive-wax upgrade

OPTIONS
  -B, --pr-body=pr-body                [default: This is an automatic PR created with
                                       [massive-wax](https://github.com/Eomm/massive-wax)!] the body message of the PR

  -C, --[no-]commit                    commit the changes

  -F, --[no-]fork                      fork the project before cloning. Useful if you don't have the write grant

  -K, --token=token                    the GitHub token to fork the project and push the changes. You can set it via env
                                       named GITHUB_TOKEN

  -L, --[no-]clone                     clone the repo before executing the processors

  -R, --[no-]pr                        open the PR to forked repo

  -b, --branch=branch                  [default: wax] the branch name where apply the changes

  -M, --main-branch=main-branch        [default: main] the main branch in the origin repo

  -c, --commit-message=commit-message  [default: wax in action] the commit message

  -m, --match=match                    [default: .js$|.json$] the files that match this pattern will be processed

  -p, --processor=processor            (required) the processor(s) that will modify the cloned repo. It must be a node
                                       module

  -r, --repo=repo                      (required) the URL repo to upgrade. If it is a file, each line of the file must
                                       be a repo URL

  -t, --pr-title=pr-title              [default: automatic PR] the title of the PR

  -w, --work-path=work-path            [default: C:\Users\behem\workspace\massive-wax] current working directory: where
                                       cloning the repos

DESCRIPTION
  ...
  This command will:
  - fork the repos in the GH account associated with the --token
  - clone the repos in your local env
  - process all the files of the cloned repos
  - commit the changes in a dedicated branch
  - open a PR to the main branch in the origin repo

  All these steps are optionals.

EXAMPLES
  Change all the LICENCE file of your org
    $ upgrade -K GITHUB-TOKEN --fork -p='./toMit.js' -t='Changed license' -c='chore changed license' -M main -b licensebranch -r 
  repo-list.txt
```

_See code: [src\commands\upgrade.js](https://github.com/Eomm/massive-wax/blob/v1.0.0/src\commands\upgrade.js)_
<!-- commandsstop -->

## Processor

The processor file will be loaded relative to the PWD and it must be like this scaffolding:

```js
module.exports = function factory (args, logger) {
  // DO WHAT YOU WANT IN SYNC
  // This function will be called for each REPO you are processing

  return {
    onRepo (repo) {
      // OPTIONAL, sync function called before processing the files
    },
    onFile (file) {
      // MANDATORY, do what you whant to each file of your project.
      // The files are processed sequentially and, if you return a promise
      // it will be waited.
      // If you will throw an error, it will be logged but all will continue
    },
    onComplete (repo) {
      // OPTIONAL, sync function called after all the processed files
    }
  }
}
```


## License

Copyright [Manuel Spigolon](https://github.com/Eomm), Licensed under [MIT](./LICENSE).

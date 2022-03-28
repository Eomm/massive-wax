'use strict'

module.exports = {
  description: `Process the files of many GitHub repositories as you want and open PR within the changes!
  ...
  This command will:
  - fork the repository in the GH account associated with the --token arg
  - clone the repository in your local env
  - process all the cloned repository's files
  - commit the changes in a dedicated branch
  - open a PR to the \`--pr-origin\` branch in the origin repository

  All these steps are optionals.`,

  examples: [
    'Edit all your GitHub Organization\'s LICENCE files',
    " $ upgrade -K GITHUB-TOKEN --fork -p='./toMit.js' -t='Changed license' -c='chore changed license' -O main -b licensebranch -r repo-list.txt"
  ]

}

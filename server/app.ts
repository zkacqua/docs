#!/usr/bin/env node

import * as yargs from 'yargs'
import Server from './server'

const server = new Server()

yargs
  .scriptName('docs-server')
  .usage('$0 <cmd> [args]')
  .options({
    debug: {
      alias: 'd',
      demandOption: false,
      default: false,
      describe:
        'debug argument is essential for debugging the app, with a default value of false.',
      type: 'boolean',
    },
    mode: {
      alias: 'm',
      demandOption: false,
      default: false,
      describe:
        'debug argument is essential for debugging the app, with a default value of false.',
      type: 'string',
    },
    env: {
      alias: 'env-path',
      demandOption: false,
      default: '.env.server.local',
      describe:
        'debug argument is essential for debugging the app, with a default value of false.',
      type: 'string',
    },
  })
  .command(
    '$0 [name]',
    'this is args',
    (yargs) => {
      yargs.positional('mode', {
        type: 'string',
        default: 'prod',
        describe:
          'Describes mode of env. It can be following values prod,dev,stage,uat',
      })
    },
    function (argv) {
      console.log('run', argv.name, 'this is args')
      server
        .start({ port: 4000, debug: true, env: 'prod' })
        .catch((err) => console.error(err))
    }
  )
  .help().argv

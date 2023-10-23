#!/usr/bin/env node

import chalk from 'chalk'
import dotenv from 'dotenv'
import path from 'path'
import yargs from 'yargs'
import Config from './global/config'
import Server from './server'
import { EnvMode } from './types'
import version from './version'

const server = new Server()

yargs
  .scriptName('docs-server')
  .usage('$0 <cmd> [args]')
  .version(version.gitSha)
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
      default: 'local',
      describe:
        'mode is required for app to run on which mode, this value decides on which environment app is running and what should be behavior for that. By default its value is `local`, mode value can be `prod`, `uat`, `stage`, `qa`, `dev` or `local`',
      type: 'string',
    },
    envFile: {
      alias: 'env',
      demandOption: false,
      default: '.env.server.local',
      describe:
        'envFile is file name of environment variables which is being used by app. By default app will load env variables from .env.server.local files, if incase app using deferent env variable file it needs to pass as args.',
      type: 'string',
    },
    logLevel: {
      alias: 'll',
      demandOption: false,
      default: 'info',
      describe:
        'logLevel argument is used in logger for logging upto specific levels of logs',
    },
  })
  .command(
    '$0 [action]',
    'start/stop use as action to handle server',
    (yargs) => {
      yargs.positional('action', {
        type: 'string',
        demandOption: true,
        describe: `action is required for server to start and stop. 
           i.e
            start: to start server app
            stop: to stop server app`,
      })
    },
    async function (argv) {
      try {
        const envFile = argv.envFile
        const envFilePath = path.resolve(process.cwd(), envFile)
        const { error: envError, parsed: env } = dotenv.config({
          path: envFilePath,
        })
        if (envError) {
          throw new Error('DotEnv parse failed')
        }
        const config = Config.getInstance().initConfigFromEnv(env)
        if (
          !['prod', 'uat', 'stage', 'qa', 'dev', 'local'].includes(argv.mode)
        ) {
          throw new Error('Incorrect mode value')
        }
        if (!argv.action) {
          throw new Error('No server action')
        }
        switch (argv.action as 'start' | 'stop') {
          case 'start': {
            await server.start({
              port: Number(config.getConfig('PORT') || 4000),
              debug: argv.debug,
              envMode: argv.mode as EnvMode,
            })
            break
          }
          case 'stop': {
            await server.stop({ debug: argv.debug, level: argv.logLevel })
            break
          }
        }
      } catch (e) {
        console.error(chalk.red(String(e)))
      }
    }
  )
  .help().argv

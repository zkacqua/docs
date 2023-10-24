import chalk from 'chalk'
import path from 'path'
import shell from 'shelljs'
import yargs from 'yargs'

yargs
  .scriptName('copy')
  .usage('$0 <cmd> [args]')
  .version('1.0.0')
  .options({
    inDir: {
      alias: 'in',
      demandOption: true,
      describe:
        'directory name from which files need to copy. need to pass relative path',
      type: 'string',
    },
    outDir: {
      alias: 'out',
      demandOption: true,
      describe:
        'directory name from where files need to copy. need to pass relative path',
      type: 'string',
    },
  })
  .command(
    '$0',
    'copy files from source to destination',
    () => {},
    async function (argv) {
      try {
        const inDirPath = path.resolve(process.cwd(), argv.inDir)
        const outDirPath = path.resolve(process.cwd(), argv.outDir)
        shell.cp('-R', inDirPath, outDirPath)
      } catch (e) {
        console.error(chalk.red(String(e)))
      }
    }
  )
  .help().argv

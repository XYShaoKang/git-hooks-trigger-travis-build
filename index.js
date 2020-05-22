const program = require('commander')
const { startScript } = require('./script')

program
  .version('0.0.1')
  .requiredOption('-t, --token <token>', 'Travis-CI token')
  .requiredOption('-p, --build-repo <repository>', 'build repository')
  .requiredOption('-c, --current-branch <branch>', 'current branch')
  .option(
    '-n, --app-name <name>',
    'app name in pm2',
    'git-hooks-trigger-travis-build',
  )
  .option('-b, --build-branch-name <branch>', 'build branch name', 'deploy')
  .option('-T, --trigger-branch-name <branch>', 'trigger branch name', 'master')
  .option('-l, --local-port <port>', 'local server port', 3000)
  .option('-r, --remote-host <host>', 'remote host', 'demo')
  .option('-u, --serveo-username <username>', 'serveo username', 'demo')
  .option('-w, --wait-time <time>', 'wait time,unit second', 60)
  .action(
    ({
      token,
      buildRepo,
      currentBranch,
      appName,
      buildBranchName,
      triggerBranchName,
      localPort,
      remoteHost,
      serveoUsername,
      waitTime,
    }) => {
      startScript({
        token,
        buildRepo,
        currentBranch,
        appName,
        buildBranchName,
        triggerBranchName,
        localPort,
        remoteHost,
        serveoUsername,
        waitTime,
      })
    },
  )

program.parse(process.argv)

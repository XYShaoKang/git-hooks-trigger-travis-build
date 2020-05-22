const pm2 = require('pm2')

const { restartApp, startApp, getAppList } = require('./src/pm2-manage')

function startScript({
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
}) {
  // 判断当前提交的分支是否为需要触发部署的分支
  if (currentBranch === triggerBranchName) {
    // console.log(`[pre-push]: ==== Notification pm2 start script ====`)

    // 监听 pm2 进程消息,在运行的脚本中,当服务器启动成功时,会发送一个成功标识的消息,接收到成功消息时,退出当前脚本
    // 避免当 git 提交速读过快时,本地服务还没启动,而错过接收 GitHub Webhook
    pm2.launchBus((err, bus) => {
      bus.on('process:msg', ({ process, data }) => {
        if (process.name === appName && data.success) {
          // console.log(`[pre-push]: ==== Successful startup script ====`)
          pm2.disconnect()
        }
      })
    })

    // 直接使用创建命令,如果有相同的程序,pm2 会自动先结束先前的脚本
    startApp({
      script: './src/app.js',
      name: appName,
      autorestart: false,
      args: [
        token,
        buildRepo,
        appName,
        buildBranchName,
        triggerBranchName,
        localPort,
        remoteHost,
        serveoUsername,
        waitTime,
      ],
    })

    // console.log(`[pre-push]: ==== Wait for script process message ====`)
  }
}

module.exports = { startScript }

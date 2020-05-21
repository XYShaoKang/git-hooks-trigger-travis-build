const path = require('path')
const pm2 = require('pm2')
require('dotenv').config({ path: path.resolve(__dirname, './.env') })

const { restartApp, startApp, getAppList } = require('./src/pm2-manage')

const APP_NAME = process.env.APP_NAME
const triggerBranchName =
  process.env.TRIGGER_BRANCH_NAME || 'master'

const branchName = process.argv[2]

// 判断当前提交的分支是否为需要触发部署的分支
if (branchName === triggerBranchName) {
  // console.log(`[pre-push]: ==== Notification pm2 start script ====`)

  // 监听 pm2 进程消息,在运行的脚本中,当服务器启动成功时,会发送一个成功标志的消息,接收到成功消息时,退出当前脚本
  // 避免当 git 提交速读过快时,本地服务还没启动,而错过接收 GitHub Webhook
  pm2.launchBus((err, bus) => {
    bus.on('process:msg', ({ process, data }) => {
      if (process.name === APP_NAME && data.success) {
        // console.log(`[pre-push]: ==== Successful startup script ====`)
        pm2.disconnect()
      }
    })
  })

  // 获取 pm2 中的脚本列表,判断之前是否已经配置过脚本,如果已经存在,使用 restart 命令,否则使用 start 命令
  // getAppList().then(async (list) => {
  //   const app = list.filter(({ name }) => name === APP_NAME)[0]
  //   if (!app) {
  //     await startApp({
  //       script: './src/app.js',
  //       name: APP_NAME,
  //       autorestart: false,
  //     })
  //   } else {
  //     await restartApp(app.name)
  //   }
  // })

  // 直接使用创建命令,如果有相同的程序,pm2 会自动先结束先前的脚本
  startApp({
    script: './src/app.js',
    name: APP_NAME,
    autorestart: false,
  })

  // console.log(`[pre-push]: ==== Wait for script process message ====`)
}

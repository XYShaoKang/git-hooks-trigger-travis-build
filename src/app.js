const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const getPort = require('get-port')
require('dotenv').config()

const { stopApp } = require('./pm2-manage')
const { triggerBuild } = require('./travis-ci')
const { createConnToServeo } = require('./serveo')

const {
  APP_NAME: appName,
  BUILD_REPO: buildRepo,
  BUILD_BRANCH_NAME: buildBranchName = 'deploy',
  TRIGGER_BRANCH_NAME: triggerBranchName = 'master',
  LOCAL_PORT: LOCAL_PORT = 3000,
  REMOTE_HOST: remoteHost = 'demo',
  SERVEO_USERNAME: serveoUsername = 'demo',
  WAIT_TIME: waitTime = 60,
} = process.env

async function start() {
  console.log(`==== start app ====`)

  const app = new Koa()
  app.use(bodyParser())

  app.use(async (ctx) => {
    const {
      request: { method, body },
    } = ctx
    if (method === 'POST' && body.ref === `refs/heads/${triggerBranchName}`) {
      console.log(`==== trigger travis-ci deploy ====`)
      await triggerBuild({
        repo: buildRepo,
        branch: buildBranchName,
      })
      stopApp(appName)
      console.log(`==== trigger travis-ci success,stop App ====`)
    }
    ctx.body = 'Hello World'
  })

  // 当配置的端口杯占用时,获取一个可用的端口
  const localPort = await getPort({ port: parseInt(LOCAL_PORT) })

  app.listen(localPort, () => {
    createConnToServeo({
      remoteHost: `${remoteHost}.serveo.net`,
      remotePort: 80,
      localPort,
      username: serveoUsername,
    }).then(({ remoteHost, remotePort }) => {
      const url = [80, 443].includes(remotePort)
        ? `https://${remoteHost}`
        : `http://${remoteHost}:${remotePort}`

      console.log(
        `local  url: http://localhost:${localPort}\nremote url: ${url}`,
      )

      // 服务启动成功,发送成功标志给启动脚本,让启动脚本退出,好继续执行 push
      process.send({
        type: 'process:msg',
        data: {
          success: true,
        },
      })

      console.log(`==== start app success ====`)

      // 设置一个超时时间(默认为 60s),如果超过时间还没有接收到 Github Webhook 就结束脚本,避免占用资源
      setTimeout(() => {
        stopApp(appName)
        console.log(`==== Wait timeout,stop App ====`)
      }, parseInt(waitTime) * 1000)
    })
  })
}

start()

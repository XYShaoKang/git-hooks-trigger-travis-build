const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const getPort = require('get-port')

const { stopApp } = require('./pm2-manage')
const { triggerBuild } = require('./travis-ci')
const { createConnToServeo } = require('./serveo')

const [
  ,
  ,
  token,
  buildRepo,
  appName,
  buildBranchName,
  triggerBranchName,
  localPort,
  remoteHost,
  serveoUsername,
  waitTime,
] = process.argv

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
        token,
        branch: buildBranchName,
      })
      stopApp(appName)
      console.log(`==== trigger travis-ci success,stop App ====`)
    }
    ctx.body = 'Hello World'
  })

  // 当配置的端口被占用时,获取一个可用的端口
  const usableLocalPort = await getPort({ port: parseInt(localPort) })

  app.listen(usableLocalPort, () => {
    createConnToServeo({
      remoteHost: `${remoteHost}.serveo.net`,
      remotePort: 80,
      localPort: usableLocalPort,
      username: serveoUsername,
    }).then(({ remoteHost, remotePort }) => {
      const url = [80, 443].includes(remotePort)
        ? `https://${remoteHost}`
        : `http://${remoteHost}:${remotePort}`

      console.log(
        `local  url: http://localhost:${usableLocalPort}\nremote url: ${url}`,
      )

      // 服务启动成功,发送成功标识给启动脚本,让启动脚本退出,好继续执行 push
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

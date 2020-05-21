const Client = require('ssh2').Client // To communicate with Serveo
const Socket = require('net').Socket // To accept forwarded connections (native module)

// connect to serveo.net see: https://stackoverflow.com/questions/55547703
function connToServeo(param, cb) {
  const { remoteHost, localHost, localPort, remotePort, username } = param
  // Create an SSH client
  const conn = new Client()
  // Config, just like the second example in my question
  const config = {
    remoteHost: remoteHost || `demo-${new Date().getTime()}.serveo.net`,
    remotePort: remotePort || 80,
    localHost: localHost || 'localhost',
    localPort: localPort || 3000,
  }
  // console.log(config)
  function log(str) {
    // console.log(str)
    cb(str, config)
  }

  conn
    .on('ready', () => {
      // When the connection is ready
      log('Connection ready')
      // Start an interactive shell session
      conn.shell((err, stream) => {
        if (err) throw err
        // And display the shell output (so I can see how Serveo responds)
        stream.on('data', (data) => {
          log('SHELL OUTPUT: ' + data)
        })
      })
      // Request port forwarding from the remote server
      conn.forwardIn(config.remoteHost, config.remotePort, (err, port) => {
        if (err) throw err
        conn.emit('forward-in', port)
      })
    })
    // ===== Note: this part is irrelevant to my problem, but here for the demo to work
    .on('tcp connection', (info, accept, reject) => {
      log('Incoming TCP connection', JSON.stringify(info))
      let remote
      const srcSocket = new Socket()
      srcSocket
        .on('error', (err) => {
          if (remote === undefined) reject()
          else remote.end()
        })
        .connect(config.localPort, config.localPort, () => {
          remote = accept()
            .on('close', () => {
              log('TCP :: CLOSED')
            })
            .on('data', (data) => {
              log(
                'TCP :: DATA: ' +
                  data.toString().split(/\n/g).slice(0, 2).join('\n'),
              )
            })
          log('Accept remote connection')
          srcSocket.pipe(remote).pipe(srcSocket)
        })
    })
    // ===== End Note
    // Connect to Serveo
    .connect({
      host: 'serveo.net',
      username: username || '',
      tryKeyboard: true,
    })
}

function createConnToServeo(param = {}) {
  return new Promise(function (resolve, reject) {
    function cb(str, config) {
      // console.log(str)
      const strs = str
        .replace(/\u001b\[.*?m/g, '')
        .trim()
        .split(' ')

      // 判断是否成功连接到 serveo
      // 原始消息:
      //    SHELL OUTPUT: Forwarding HTTP traffic from https://xxxxx.serveo.net
      //    SHELL OUTPUT: Forwarding TCP connections from serveo.net:8112
      if (strs[2] === 'Forwarding' && strs[5] === 'from') {
        resolve(config)
      }
    }
    connToServeo(param, cb)
  })
}

module.exports = { createConnToServeo }

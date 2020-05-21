const pm2 = require('pm2')

const errbackFn = (resolve, reject) => (err, proc) => {
  if (err) {
    reject(err)
  }
  resolve(proc)
}

/**
 * 用 pm2 启动一个脚本
 * @param {pm2.StartOptions} option
 */
function startApp(option) {
  return new Promise(function (resolve, reject) {
    pm2.start(option, errbackFn(resolve, reject))
  })
}
function restartApp(appName) {
  return new Promise(function (resolve, reject) {
    pm2.restart(appName, errbackFn(resolve, reject))
  })
}
// 停止一个脚本
function stopApp(appName) {
  return new Promise(function (resolve, reject) {
    pm2.stop(appName, errbackFn(resolve, reject))
  })
}

/**
 * @return {pm2.ProcessDescription[]}
 */
function getAppList() {
  return new Promise(function (resolve, reject) {
    pm2.list((err, list) => {
      if (err) {
        reject(err)
      } else {
        resolve(list)
      }
    })
  })
}

module.exports = { restartApp, stopApp, startApp, getAppList }

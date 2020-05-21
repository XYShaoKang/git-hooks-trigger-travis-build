# 自动触发 Travis-CI 构建

## env 文件说明

```sh
APP_NAME= # 在 pm2 中显示的名称
TRAVIS_CI_TOKEN= # Travis-CI 自定义触发,需要的 token,详情查看:https://docs.travis-ci.com/user/triggering-builds
BUILD_REPO= # 触发构建的仓库名
BUILD_BRANCH_NAME=deploy # 触发构建的分支名
TRIGGER_BRANCH_NAME=master # 需要在 push 时触发构建的分支名
LOCAL_PORT=3000 # 接收 Webhook 的本地服务器的端口
REMOTE_HOST=demo # 配置 serveo 自定义域名
SERVEO_USERNAME=demo # 可以提供一个用户名给 serveo 识别
WAIT_TIME=60 # 设置等待 Webhook 的超时时间,超时会结束脚本
```

# 自动触发 Travis-CI 构建

> 通过 git hook,触发 Travis-CI 的自定义构建

![git-hooks-trigger-travis-build](https://github.com/XYShaoKang/git-hooks-trigger-travis-build/raw/resources/images/git-hooks-trigger-travis-build.png)

## 安装

运行需要 node

```sh
yarn global add https://github.com/XYShaoKang/git-hooks-trigger-travis-build
# or
npm install -g https://github.com/XYShaoKang/git-hooks-trigger-travis-build
```

## 使用

在需要触发构建的仓库中,编辑`.git/hooks/pre-push`,添加以下内容

```sh
#!/bin/sh

branch=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')
token='xxx' # 替换成自己的 token
repo='xxx/yyy' # 替换成需要部署的仓库
remote_host='xxx' # 自定义域名,最后会变成 xxx.serveo.net

git-hooks-trigger-travis-build -t $token -p $repo -r $remote_host -c $branch
```

在对应仓库的 GitHub 点击 `Settings` -> `Webhooks` -> `Add webhooks`,在`Payload URL`填入上面的自定义地址`https://xxx.serveo.net`,`Content type`选择`application/json`,然后点击`Add webhook`

在仓库中提交代码,`git push`查看结果

## 命令选项

## env 文件说明

- `-V, --version` 查看版本
- `-t, --token <token>` 设置 Travis-CI token
- `-p, --build-repo <repository>` 触发构建的仓库
- `-c, --current-branch <branch>` 当前所在分支,如果跟 build-branch-name 一样,则触发构建
- `-n, --app-name <name>` 在 pm2 中显示的名称,通过名称管理脚本启动停止,以及查看对应的日志 (default: "git-hooks-trigger-travis-build")
- `-b, --build-branch-name <branch>` 需要触发编译的分支 (default: "deploy")
- `-T, --trigger-branch-name <branch>` 被触发的目标分支,既执行编译部署的分支 (default: "master")
- `-l, --local-port <port>` 本地服务器的端口 (default: 3000)
- `-r, --remote-host <host>` 用来自定义 serveo 域名,这样可以保证有一个统一的地址来接收 Github webhook 的通知 (default: "demo")
- `-u, --serveo-username <username>` 提供给 serveo 的用户名,可以为空 (default: "demo")
- `-w, --wait-time <time>` 等待 Webhook 的超时时间 (default: 60)
- -h, --help display help for command

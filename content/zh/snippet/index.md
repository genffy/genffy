---
title: "代码片段"
date: 2023-01-16T18:05:16+08:00
draft: false
---
- git
	- 为不同仓库地址设置不同的 pubkey 以及对应的 user
		- 对不同的邮箱生成不同的 ssh key
			-
			  ``` shell
			  # 设置公司的
			  ssh-keygen -t rsa -C "zhengfei.li@orgname.com" -f ~/.ssh/gitlab_rsa
			  # 设置默认的，一般都是给 gitlab 用的
			  ssh-keygen -t rsa -C "genffyl@gmail.com"
			  # 查看生成的密钥对
			  ls -la ~/.ssh
			  # -rw-------    1 genffy  staff  2610 Feb 15 17:48 gitlab_rsa
			  # -rw-r--r--    1 genffy  staff   578 Feb 15 17:48 gitlab_rsa.pub
			  # -rw-------    1 genffy  staff  2602 Feb 15 17:51 id_rsa
			  # -rw-r--r--    1 genffy  staff   571 Feb 15 17:51 id_rsa.pub
			  # 创建配置文件
			  vim .ssh/config
			  # gitlab.orgname.com
			  Host gitlab.orgname.com
			    AddKeysToAgent yes
			    UseKeychain yes
			    IdentityFile ~/.ssh/gitlab_rsa
			    User zhengfei.li@orgname.com
			  
			  # github.com
			  #Host github.com
			  #  AddKeysToAgent yes
			  #  UseKeychain yes
			  #  IdentityFile ~/.ssh/github_rsa
			  #  User genffyl@gmail.com
			  # 测试
			  ssh -T git@github.com
			  # Hi genffy! You've successfully authenticated, but GitHub does not provide shell access.
			  ssh -T git@gitlab.orgname.com
			  # Welcome to GitLab, @zhengfei.li!
			  ```
		- 配置不同的 git 目录使用不同的 ssh key
			-
			  ``` shell
			  cp .gitconfig .gitconfig-gitlab
			  cp .gitconfig .gitconfig-id
			  
			  vim .gitconfig-gitlab
			  # 下面是配置文件内容
			  [user]
			  	name = zhengfei.li
			  	email = zhengfei.li@orgname.com
			  	signingkey = /Users/genffy/.ssh/gitlab_rsa.pub
			  [pull]
			  	rebase = false
			  [filter "lfs"]
			  	process = git-lfs filter-process
			  	required = true
			  	clean = git-lfs clean -- %f
			  	smudge = git-lfs smudge -- %f
			  [init]
			  	defaultBranch = main
			  [commit]
			  	gpgsign = true
			  [gpg]
			  	format = ssh
			  
			  vim .gitconfig-id
			  # 下面是配置文件内容
			  [user]
			  	name = genffy
			  	email = genffyl@gmail.com
			  	signingkey = /Users/genffy/.ssh/id_rsa.pub
			  [pull]
			  	rebase = false
			  [filter "lfs"]
			  	process = git-lfs filter-process
			  	required = true
			  	clean = git-lfs clean -- %f
			  	smudge = git-lfs smudge -- %f
			  [init]
			  	defaultBranch = main
			  [commit]
			  	gpgsign = true
			  [gpg]
			  	format = ssh
			  
			  vim .gitconfig
			  # 下面是配置文件内容
			  [includeIf "gitdir:~/workspace/"]
			    path = .gitconfig-id
			  [includeIf "gitdir:~/Documents/workspace/"]
			    path = .gitconfig-gitlab
			  ```
		- 最后可以在不同的目录下，修改下代码提交测试效果
	- `git branch | grep -v -E 'master' | xargs git branch -D`
	- git 撤销 commit
		- `git reset --soft HEAD^`
		- 拓展
			- `--mixed `
				- 意思是：不删除工作空间改动代码，撤销 commit，并且撤销 `git add .` 操作这个为默认参数， `git reset --mixed HEAD^`  和  `git reset HEAD^`  效果是一样的。
			- `--soft`
				- 不删除工作空间改动代码，**撤销commit**，**不撤销 `git add .`  **
			- `--hard`
				- **删除工作空间改动代码**，**撤销commit，撤销 `git add .`  ** **注意完成这个操作后，会删除工作空间代码 ！！！恢复到上一次的commit状态。**慎重！！！
	- 修改 commit msg
		- `git commit --amend`
	- git blame -L <range> <file>
		- file 对应是文件路径，也就是解析出来的原始堆栈的文件路径信息
		- range 对应的是查找的范围，也就是解析出来的原始堆栈的行号范围
- shell
	- 列出文件下大小 #shell #lsdir
		- `du -d 1 -h`
	- #awk
		-
		  ``` shell
		  // 查找日志中的域名
		  awk '{print $11}' ./access.log | awk -F/ '{print $3}' | sort | uniq
		  ```
	- 查找 #shell #find #grep
		-
		  ``` shell
		  # 查看目录下文件夹大小
		  find . -name "node_modules" -type d -prune -print | xargs du -chs
		  # 查找并删除
		  find . -name 'node_modules' -type d -prune -print -exec rm -rf '{}' \;
		  find . -name "node_modules" -exec rm -rf '{}' \;
		  find ./ -name 'master-stderr.log.202008*' | xargs rm -fr
		  ```
		-
		  ``` shell
		  grep -rnw '/etc/nginx/site/' -e '/market-coupon-app'
		  grep -nr "get_spg2lsf" ./
		  grep -R --exclude-dir=node_modules --exclude-dir=nginxconf 'open-ng.zmlearn.com' ./
		  find . -type d -wholename '*bench*/image' | xargs tar cf -\n
		  ```
	- create symbolic link
		-
		  ```
		  ┌── ln(1) link, ln -- make links
		  │   ┌── Create a symbolic link.
		  │   │                         ┌── the optional path to the intended symlink
		  │   │                         │   if omitted, symlink is in . named as destination
		  │   │                         │   can use . or ~ or other relative paths
		  │   │                   ┌─────┴────────┐
		  ln -s /path/to/original /path/to/symlink
		        └───────┬───────┘
		                └── the path to the original file/folder
		                    can use . or ~ or other relative paths
		  ```
	- 网络相关的 shell 命令 #shell #network
		-
		  ``` shell
		  # Linux netstat command find out which process is listing upon a port
		  netstat -tulpn
		  # ls -l /proc/<pid>/exe
		  netstat -an | grep :80
		  lsof -n -P | grep :80
		  lsof -i tcp:8080
		  ```
- vscode
	- 删除重复行
		- `cmd+shift+p` 然后输入 `lines`
			- ![image.png](../assets/image_1663929113614_0.png)
		- `shell` 操作
			- `cat data.txt|sort|uniq > data_uniq.txt`
	- 替换空白行
		- `\s*(?=\r?$)\n`
	- 正则查找 api 并提取
		- ![image.png](../assets/image_1647501680653_0.png)
		- `/api/(\w-?\/?)+`
		- 点击 [Open in editor] 后，复制出来到新窗口
		- 然后再执行查询，然后按住[Alt/Option+Enter] 键，选中查找出来的字符串
		- 然后 Ctrl + c, Ctrl +v 即可完成
	- 本地调试算法代码
		- 直接参考官方指南即可 [typescript-debugging](https://code.visualstudio.com/docs/typescript/typescript-debugging)
- 运维
	- 安装 `sz` `rz` 的机器上快速下载/上传 #jumpserver
	- 获取本机出口 `ip`
		- `curl cip.cc`
		- 查看当前出口 ip `https://en.ipip.net/`
- docker
	- basic
		-
		  ``` shell
		  # remove old version
		  docker image ls
		  docker image rm <image_id>
		  #stop & remove old container
		  docker container ls -a
		  docker stop <container_id>
		  docker container prune
		  # rerun
		  docker run -d -p 1337:1337 <image_id>
		  docker logs <container_id>
		  ```
	- login
		-
		  ``` shell
		  docker login <REPOSITORY_URL> --username=zhengfei.li
		  # type password
		  ```
	- build & push
		-
		  ``` shell
		  docker build --build-arg <ARG_KEY>=<AGR_VALUE> -t <TAG_NAME> -f ./<DOCKERFILE_NAME> .
		  # tag name with repo url
		  docker tag <image_id> ${{ REPOSITORY_URL }}/${{ REPOSITORY_NAMESPACE }}/${{ github.event.repository.name }}:latest
		  # push 
		  docker push ${{ REPOSITORY_URL }}/${{ REPOSITORY_NAMESPACE }}/${{ github.event.repository.name }}
		  # pull
		  docker pull ${{ REPOSITORY_URL }}/${{ REPOSITORY_NAMESPACE }}/${{ github.event.repository.name }}:latest
		  
		  ```
	- build new image base biz image
		- `Dockerfile.node`
			-
			  ``` dockerfile
			  FROM <BASE_IMAGE>
			  ARG NODE_VERSION_DEFINE=12.20.0
			  
			  LABEL io.k8s.display-name="biz_base_node" \
			        name="biz_node/node:${NODE_VERSION_DEFINE}" \
			        version="${NODE_VERSION_DEFINE}" \
			        maintainer="owner <zhengfei.li@orgname.com>"
			  
			  ENV NODE_VERSION ${NODE_VERSION_DEFINE}
			  ENV ARCH x64
			  WORKDIR /opt/biz-cloud
			  
			  # RUN curl -O "https://nodejs.org/download/release/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${ARCH}.tar.gz" \
			  # RUN wget "https://nodejs.org/download/release/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${ARCH}.tar.gz" \
			  # use local file
			  COPY node-v$NODE_VERSION-linux-$ARCH.tar.gz /opt/biz-cloud/
			  RUN tar -zxvf "node-v$NODE_VERSION-linux-$ARCH.tar.gz" -C /opt\
			    && cp "/opt/node-v$NODE_VERSION-linux-${ARCH}/bin/node" /usr/local/bin/ \
			    && ln -s "/opt/node-v$NODE_VERSION-linux-${ARCH}/bin/npm" /usr/local/bin/npm \
			    && rm -f "node-v$NODE_VERSION-linux-$ARCH.tar.gz" \
			    && node --version \
			    && npm --version \
			    && npm config set registry https://registry.npmmirror.com \
			    && npm install pm2 -g
			  
			  COPY npmrc /root/npmrc
			  RUN mv /root/npmrc /root/.npmrc 
			  ```
		- `npmrc`
			-
			  ``` shell
			  # .npmrc file content
			  registry=https://registry.npmmirror.com/
			  user=0
			  unsafe-perm=true
			  TARGET=null
			  # add as needed
			  ```
		- Usage
			-
			  ``` shell
			  docker build --build-arg NODE_VERSION_DEFINE=<NODE_VERSION> -f ./Dockerfile.node .
			  ```
	- docker-compose
		-
		  ``` shell
		  # <version_id> 替换成你想要安装的版本，可以在 https://github.com/docker/compose/releases 找到
		  sudo curl -L "https://github.com/docker/compose/releases/download/<version_id>/docker-compose-$(uname -s)-$(uname -m)" -o /usr/bin/docker-compose
		  sudo chmod +x /usr/bin/docker-compose
		  docker-compose --version
		  ```

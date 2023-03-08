---
title: "为不同的 git repo 配置 ssh key、gitconfig"
date: 2023-03-08T16:02:23+08:00
draft: false
author: "genffy"
description: ""
tags: ["git", "ssh", "gitconfig"]
categories: ["front-end"]
series: ["Web-Develop"]
ShowToc: true
TocOpen: false
---

## 对不同的邮箱生成不同的 ssh key

### 生成密钥对

```shell
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
```

### 创建配置文件

```shell
vim .ssh/config
```

填入以下内容

```bash
# gitlab.orgname.com
Host gitlab.orgname.com
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/gitlab_rsa
  User zhengfei.li@orgname.com

# github.com
# Host github.com
#  AddKeysToAgent yes
#  UseKeychain yes
#  IdentityFile ~/.ssh/github_rsa
#  User genffyl@gmail.com
```

### 测试设置效果

```shell
ssh -T git@github.com
# Hi genffy! You've successfully authenticated, but GitHub does not provide shell access.
ssh -T git@gitlab.orgname.com
# Welcome to GitLab, @zhengfei.li!
```

## 配置不同的 git 目录使用不同的密钥

### 复制默认的 `.gitconfig`

```shell
cp .gitconfig .gitconfig-gitlab
cp .gitconfig .gitconfig-id
```

### 编辑不同的配置文件的 `user` 信息

```shell
vim .gitconfig-gitlab
```

```toml
[user]
	name = zhengfei.li
	email = zhengfei.li@orgname.com
	signingkey = ~/.ssh/gitlab_rsa.pub
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
```

```shell
vim .gitconfig-id
```

```toml
[user]
	name = genffy
	email = genffyl@gmail.com
	signingkey = ~/.ssh/id_rsa.pub
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
```

### 设置不同仓库目录使用不同 `.gitconfig`

```shell
vim .gitconfig
```

```toml
[includeIf "gitdir:~/workspace/"]
	path = .gitconfig-id
[includeIf "gitdir:~/Documents/workspace/"]
	path = .gitconfig-gitlab
```         
最后可以在不同的目录下，修改下代码提交测试效果

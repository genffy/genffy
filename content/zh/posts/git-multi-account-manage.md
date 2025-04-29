---
title: "Git Multi Account Manage"
date: 2025-04-29T19:22:56+08:00
draft: false
author: "genffy"
description: "详解如何通过 SSH 和 Git 配置高效管理多个 Git 账号，涵盖 SSH key 管理、基于工作区的 Git 身份切换，以及自动化脚本实践，助力个人与工作仓库无缝协作。"
tags: ["git", "ssh", "多账号", "git 配置", "ssh 配置", "开发者工具", "github", "gitlab", "工作流", "shell 脚本"]
categories: ["Git", "开发工具", "版本控制", "自动化"]
series: ["git"]
ShowToc: true
TocOpen: false
cover:
  image: "/images/2025-04-29/git-multi-account-manage.png"
  alt: "git multi account manage"
  caption: ""
  relative: false # To use relative path for cover image, used in hugo Page-bundles
---
> 本文主要针对的是 ssh 场景

网上有很多关于 git 多账号管理的文章，很多写的比较零碎，或者只解决了某一方面的问题，这里整理一下，方便自己使用

对于该问题可设想的场景可以分为以下几种：
- 不同域名使用不同的 sshkey 文件
- 同一域名使用不同的 sshkey 文件
- 同一域名使用 git 账号

对于上述场景，其实核心就两个问题：
- ssh 客户端如何切换不同 sshkey
- git 客户端如何切换不同账号

ssh 的场景中，大多数 90% 的情况都是只需要不同 sshkey 文件就行了，至于 git 的账号 `username <username@domain>` 其实可以忽略，并没有那么重要。

## 配置 ssh 账号
关于 ssh 的基础配置，可以参考 [github 官方的文档](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/about-ssh)

这个处理最简单，也是网上能搜到最多的方案，通过 [`~/.ssh/config`](https://www.ssh.com/academy/ssh/config) 配置文件中的 Host 来区分不同的 sshkey 文件

```bash
Host github.dev
  HostName github.com # 必须要
  IdentityFile ~/.ssh/github_rsa
  IdentitiesOnly yes

Host gitlab.yourdomain.com
  IdentityFile ~/.ssh/gitlab_rsa
  IdentitiesOnly yes
```
这样，你同一个 git 账号，就可以对不同仓库使用不同的 sshkey 文件了。

## 配置 git 账号

这种场景主要是因为

- 大多数公司会私有化部署 git server，然后账号基本都是公司域账号
- 如果是 github，将个人账号和公司账号隔离

所以，需要 git 客户端根据不同的 workspace，使用不同的 git 账号。

这里就要搬出 git config 中的 [Includes](https://git-scm.com/docs/git-config#_includes) 配置了

```bash
[includeIf "gitdir:~/workspace_github/"]
	path = ~/.gitconfig-github
[includeIf "gitdir:~/workspace_gitlab/"]
	path = ~/.gitconfig-gitlab
[includeIf "gitdir:~/workspace_work/"]
	path = ~/.gitconfig-work
[filter "lfs"]
	required = true
	clean = git-lfs clean -- %f
	smudge = git-lfs smudge -- %f
	process = git-lfs filter-process
[init]
	defaultBranch = main
[core]
	symlinks = true
	ignorecase = false
[pull]
	rebase = true
```
然后 `~/.gitconfig-xxx` 内容都差不多，主要定义 name email，如果有 sign comments 的需求，可以定义 signingkey
```bash
[user]
	name = github_username
	email = github_username@github.com
	signingkey = <YOUR_GPG_KEY_ID>
[init]
	defaultBranch = main
[commit]
	gpgsign = true
```
按照上述配置，你就可以在不同的 workspace 中使用不同的 git 账号了。

不过实际真正的操作中，还是需要配合 ssh 的配置来使用的，最终可以通过 `ssh -T git@github.dev` 来测试连通情况。

比如需要在 github 上开两个账号，然后使用不同的 git 和 sshkey 登陆时，结合上面两个配置完后，具体使用的时候只需要在 `git clone` 的时候将 github.com 替换为 github.dev（你自己定义的 host ） 即可。

## 扩展：自定义 `git` 命令

我自己是为了方便，不需要每次手动改，所以写了一个 `git` 的 wrapper 脚本，通过 `git clone` 的执行目录来判断是否需要替换域名。
```bash
#!/bin/bash

# 你的 Git 安装实际路径
REAL_GIT="/usr/local/bin/git"

# 如果是 git clone 命令
if [[ "$1" == "clone" ]]; then
  current_dir=$(pwd)

  # 如果当前目录是在 /Users/<your_username>/workspace_github 路径下
  if [[ "$current_dir" == /Users/<your_username>/workspace_github* ]]; then
    shift  # 移除 clone 命令本身，处理其余参数

    # 查找 URL 参数
    for arg in "$@"; do
      if [[ "$arg" =~ ^git@github\.com: ]]; then
        new_url="${arg/git@github.com:/git@github.dev:}"
        echo "[git wrapper] 替换 clone URL 为: $new_url"
        exec "$REAL_GIT" clone "$new_url"
      fi
    done
  fi
fi

# 否则，直接执行原始 git 命令
exec "$REAL_GIT" "$@"
```

至此，你就可以在约定好的 workspace 目录中自由的使用 git 命令了。大家有更好的方案或者问题，欢迎留言讨论。

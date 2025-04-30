---
title: "Git Multi Account Manage"
date: 2025-04-29T19:22:56+08:00
draft: false
author: "genffy"
description: "Manage multiple Git accounts efficiently using SSH and Git config includes. Covers SSH key management, workspace-based Git identities, and a wrapper script for seamless workflow."
tags: ["git", "ssh", "multiple accounts", "git config", "ssh config", "developer workflow", "github", "gitlab", "shell script"]
categories: ["Git", "Developer Tools", "Version Control", "Workflow Automation"]
series: ["git"]
ShowToc: true
TocOpen: false
cover:
  image: "/images/2025-04-29/git-multi-account-manage.png"
  alt: "git multi account manage"
  caption: ""
  relative: false # To use relative path for cover image, used in hugo Page-bundles
---
> This article focuses on managing multiple Git accounts with SSH.

There are plenty of guides on handling multiple Git accounts, but many are fragmented or only solve part of the problem. Here's a streamlined summary for practical use.

Common scenarios include:
- Using different SSH keys for different domains
- Using different SSH keys for the same domain
- Using different Git accounts for the same domain

Ultimately, there are two main challenges:
- Switching SSH keys with the SSH client
- Switching Git accounts with the Git client

In most cases (about 90%), simply using different SSH keys is enough. The Git account identity (`username <username@domain>`) is usually less critical.

## SSH Account Configuration
For SSH basics, see [GitHub's official docs](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/about-ssh).

The most common approach is to use the Host directive in your [`~/.ssh/config`](https://www.ssh.com/academy/ssh/config) to specify different keys:

```bash
Host github.dev
  HostName github.com
  IdentityFile ~/.ssh/github_rsa
  IdentitiesOnly yes

Host gitlab.yourdomain.com
  IdentityFile ~/.ssh/gitlab_rsa
  IdentitiesOnly yes
```
This lets you use different SSH keys for different repos, even with the same Git account.

## Git Account Configuration

Why do this?
- Companies often use private Git servers with domain accounts
- You may want to separate personal and work accounts on GitHub

You can have Git use different accounts per workspace using [git config includes](https://git-scm.com/docs/git-config#_includes):

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
Each `~/.gitconfig-xxx` just sets your name, email, and optionally a signing key:

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
With this, you'll use the right Git identity in each workspace.

Combine this with your SSH config. Test with `ssh -T git@github.dev`.

For example, to use two GitHub accounts with different SSH keys, just replace `github.com` with your custom host (e.g., `github.dev`) when cloning:

`git clone git@github.dev:user/repo.git`

## Bonus: Custom `git` Wrapper

To automate domain switching, here's a simple wrapper script. It checks your current directory and rewrites the clone URL if needed:

```bash
#!/bin/bash

REAL_GIT="/usr/local/bin/git"

if [[ "$1" == "clone" ]]; then
  current_dir=$(pwd)
  if [[ "$current_dir" == /Users/<your_username>/workspace_github* ]]; then
    shift
    for arg in "$@"; do
      if [[ "$arg" =~ ^git@github\.com: ]]; then
        new_url="${arg/git@github.com:/git@github.dev:}"
        echo "[git wrapper] Replacing clone URL with: $new_url"
        exec "$REAL_GIT" clone "$new_url"
      fi
    done
  fi
fi

exec "$REAL_GIT" "$@"
```
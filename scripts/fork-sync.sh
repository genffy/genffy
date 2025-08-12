#!/bin/bash
set -e

# 获取你账号下所有 fork 仓库列表
gh repo list genffy --fork --limit 100 --json nameWithOwner | jq -r '.[].nameWithOwner' > forks.txt

while read repo; do
  echo "🔄 同步 $repo ..."
  gh repo sync $repo
done < forks.txt

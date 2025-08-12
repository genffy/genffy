#!/bin/bash
set -euo pipefail

USERNAME="genffy"

echo "📦 获取 $USERNAME 的 fork 列表..."
gh repo list "$USERNAME" --fork --limit 200 --json nameWithOwner | jq -r '.[].nameWithOwner' > forks.txt

while read repo; do
  echo "🔍 检查 $repo ..."

  # 获取仓库状态
  repo_info=$(gh repo view "$repo" --json isArchived,isDisabled --jq '{archived: .isArchived, disabled: .isDisabled}')
  is_archived=$(echo "$repo_info" | jq -r '.archived')
  is_disabled=$(echo "$repo_info" | jq -r '.disabled')

  # 跳过只读/失效仓库
  if [[ "$is_archived" == "true" || "$is_disabled" == "true" ]]; then
    echo "⏩ 跳过（archived 或 disabled）: $repo"
    continue
  fi

  echo "🔄 同步 $repo ..."
  if gh repo sync "$repo" 2>/dev/null; then
    echo "✅ 同步完成: $repo"
  else
    echo "⚠️ 同步失败，跳过: $repo"
  fi
done < forks.txt

---
title: "代码片段"
date: 2023-01-16T18:05:16+08:00
draft: false
---
## git
### delete all local branch except master
`git branch | grep -v -E 'master' | xargs git branch -D`
### git revert commit
`git reset --soft HEAD^`
maore options
- `--mixed `
意思是：不删除工作空间改动代码，撤销 commit，并且撤销 `git add .` 操作这个为默认参数， `git reset --mixed HEAD^`  和  `git reset HEAD^`  效果是一样的。
- `--soft`
不删除工作空间改动代码，**撤销commit**，**不撤销 `git add .`  **
- `--hard`
**删除工作空间改动代码**，**撤销commit，撤销 `git add .`  ** **注意完成这个操作后，会删除工作空间代码 ！！！恢复到上一次的commit状态。**慎重！！！
### modify commit msg
`git commit --amend`
### git blame -L <range> <file>
- file 对应是文件路径，也就是解析出来的原始堆栈的文件路径信息
- range 对应的是查找的范围，也就是解析出来的原始堆栈的行号范围

## shell
### 列出文件下大小
`du -d 1 -h`
### 查找日志中的域名
``` shell
// 
awk '{print $11}' ./access.log | awk -F/ '{print $3}' | sort | uniq
```
### 查找 #shell #find #grep
``` shell
# 查看目录下文件夹大小
find . -name "node_modules" -type d -prune -print | xargs du -chs
# 查找并删除
find . -name 'node_modules' -type d -prune -print -exec rm -rf '{}' \;
find . -name "node_modules" -exec rm -rf '{}' \;
find ./ -name 'master-stderr.log.202008*' | xargs rm -fr
```
``` shell
grep -rnw '/etc/nginx/site/' -e '/market-coupon-app'
grep -nr "get_spg2lsf" ./
grep -R --exclude-dir=node_modules --exclude-dir=nginxconf 'open-ng.zmlearn.com' ./
find . -type d -wholename '*bench*/image' | xargs tar cf -\n
```
### create symbolic link
``` shell
#┌── ln(1) link, ln -- make links
#│   ┌── Create a symbolic link.
#│   │                         ┌── the optional path to the intended symlink
#│   │                         │   if omitted, symlink is in . named as destination
#│   │                         │   can use . or ~ or other relative paths
#│   │                   ┌─────┴────────┐
ln -s /path/to/original /path/to/symlink
#	└───────┬───────┘
#			└── the path to the original file/folder
#				can use . or ~ or other relative paths
```
## 网络相关的 shell 命令
``` shell
# Linux netstat command find out which process is listing upon a port
netstat -tulpn
# ls -l /proc/<pid>/exe
netstat -an | grep :80
lsof -n -P | grep :80
lsof -i tcp:8080
```
## sre
### jumpserver
- 安装 `sz` `rz` 的机器上快速下载/上传
### 获取本机出口 `ip`
- `curl cip.cc`
- 查看当前出口 ip `https://en.ipip.net/`
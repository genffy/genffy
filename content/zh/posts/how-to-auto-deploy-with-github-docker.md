---
title: "如何使用 GitHub 和 Docker 进行自动部署"
date: 2023-06-08T17:50:33+08:00
draft: false
author: "genffy"
description: ""
tags: ["docker", "github", "docker-composer", "vercel", "watchtower"]
categories: ["themes"]
series: ["Themes Guide"]
ShowToc: true
TocOpen: false
cover:
  image: "/images/how-to-auto-deploy-with-github-docker-banner.png"
  alt: "SSE What Why How"
  caption: ""
  relative: false # To use relative path for cover image, used in hugo Page-bundles
---
## 前置知识
> - 会简单用一下 [docker](https://docs.docker.com/get-started/) 以及 [docker-compose](https://docs.docker.com/compose/)
> - 知道 [github actions](https://docs.github.com/en/actions/learn-github-actions) 以及会用
> - 以及一点点 linux 操作的基础，可以 [这里](https://logseq.genffy.com/#/page/code-snippet) 了解下

## 背景
作为一个前端er，大多数场景下交付的都是纯静态的东西（html, js, css），可能对于服务部署自动化这块不是特别敏感，随便找个环境 build 下，拿到 dist 文件夹丢到服务器上就完事了。再高级一点的，可能有用到各种 SSX 的，或者还有点 serverless 的，还有个 [vercel](https://vercel.com/docs) 这个特别好用的平台供我们使用，简直太强大，纯前端的常规操作，或者配合一些调用第三方数据接口的操作，vercel 一把梭，最多加个 serverless 函数转发下避免跨域之类的问题。比如 ChatGPT 的各种套壳，部署在 vercel 上占大多数。

但是，如果你是一个后端er，或者是一个全栈，那么你可能会有一些服务端的东西需要部署，比如一些数据库，中间件等，这些似乎在 vercel 上就不能直接搞定了，虽然他们目前也有在计划 Storage 这个东西，尤其对于版本帝的 nodejs 应用来说，可能不用项目需要的基础环境不一样，按照常规的做法可能需要不同的服务器去做这种环境隔离的事情了。其实对于预算充足的来说，这都不是问题，那么现在要介绍的一种就是如何在极限环境下，去做这种多应用部署，方便自己实验。
## 介绍
对于文中实验场景，唯一可能需要付钱的部份是一台低配的服务器，毕竟 github 的 action 不能和本地通信？（如果你有固定 ip 其实也可以）比如本文中使用的是一台腾讯云上的【标准型SA2 - 2核 2G】的服务器，买了三年千把块，算是很便宜了，装的系统是【	TencentOS Server 3.1 (TK4)】，默认自带了 docker，还做了一些镜像源上的配置，其实自己去[安装](https://docs.docker.com/get-docker/)个也很方便，记得改下镜像源。

需要准备的所有东西包括：
- 一台云服务器
- 一个镜像仓库
- 一个 github 仓库

为什么需要一个镜像仓库，目前很多基础仓库其实都在公开的镜像仓库上，比如 [dockerhub](https://hub.docker.com/search?q=)，但是对于自己应用的镜像制品，不适合放到公开仓库里。网上也有很多搭建的教程比如 [How To Set Up a Private Docker Registry on Ubuntu 22.04](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-private-docker-registry-on-ubuntu-22-04)。然后各个云商也提供此类服务，文中例子依旧选择的是腾讯云的 [容器镜像服务](https://cloud.tencent.com/product/tcr)。

综上，整体的工作流程大概是这样的
<img src="/images/how-to-auto-deploy-with-github-docker.svg" alt="how-to-auto-deploy-with-github-docker" style="background: white;" >

## 配置 github action
这里很简单，配置下 [publishing-docker-images](https://docs.github.com/en/actions/publishing-packages/publishing-docker-images)，然后填上自己的 docker 镜像仓库的账号密码，然后就可以了。
用户名密码以及仓库地址这些变量可以通过 [Actions secrets and variables](https://docs.github.com/en/actions/learn-github-actions/variables) 设置
下面是使用的 `docker.yml` 配置
```yaml
# .github/workflows/docker.yml
name: docker-ci

on:
#   schedule:
#     - cron: "0 10 * * *"
  push:
    branches:
      - "**"
    tags:
      - "v*.*.*"
  pull_request:
    branches:
      - "main"

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v4
        with:
          # list of Docker images to use as base name for tags
          images: |
            ${{ vars.TCR_REPOSITORY_URL }}/${{ vars.TCR_REPOSITORY_NAMESPACE }}/${{ github.event.repository.name }}
          # generate Docker tags based on the following events/attributes
          tags: |
            type=schedule
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=semver,pattern={{major}}
            type=sha

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v2

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to GitHub Container Registry
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v2
        with:
          # 私有仓库的地址和用户名密码，这里使用的是 github 的 secrets
          registry: ${{ vars.TCR_REPOSITORY_URL }}
          username: ${{ secrets.TCR_REPOSITORY_USERNAME }}
          password: ${{ secrets.TCR_REPOSITORY_USERPWD }}

      - name: Build and push
        uses: docker/build-push-action@v3
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

## 安装 watchtower
关于 watchtower 的详细使用可以直接去看 [watchtower](https://github.com/containrrr/watchtower) 的文档，有兴趣可以研究下它是怎么实现的，这里只是简单的介绍下如何安装和使用。
```yaml
# apps/watchtower/docker-compose.yml
version: "3.9"

services:
  watchtower:
    image: containrrr/watchtower
    restart: always
    environment:
      WATCHTOWER_CLEANUP: true
      TZ: Asia/Shanghai
      # WATCHTOWER_SCHEDULE: 0 0 1 * * *
      WATCHTOWER_POLL_INTERVAL: 7200
      WATCHTOWER_LABEL_ENABLE: true
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      # 这里主要是用户私有仓库的鉴权配置，如果是公开仓库可以不用配置
      - $HOME/.docker/config.json:/config.json
```
然后在服务器上 `docker-compose up -d` 就可以了，这里需要注意的是，如果是私有仓库，需要在服务器上配置好鉴权，否则 watchtower 会报错，这里的鉴权配置可以参考 [docker login](https://docs.docker.com/engine/reference/commandline/login/)。

成功运行之后可以查看日志，看看是否有报错，如果没有报错，就可以去看看仓库里的镜像了，是不是已经更新了。
```log
[root@VM-0-12-centos ~]# docker logs -f <containrrr/watchtower CONTAINER_ID>
time="2023-06-07T17:24:21+08:00" level=info msg="Watchtower 1.5.3"
time="2023-06-07T17:24:21+08:00" level=info msg="Using no notifications"
time="2023-06-07T17:24:21+08:00" level=info msg="Only checking containers using enable label"
time="2023-06-07T17:24:21+08:00" level=info msg="Scheduling first run: 2023-06-07 19:24:21 +0800 CST"
time="2023-06-07T17:24:21+08:00" level=info msg="Note that the first check will be performed in 1 hour, 59 minutes, 59 seconds"
time="2023-06-07T19:24:34+08:00" level=info msg="Found new ${{ vars.TCR_REPOSITORY_URL }}/${{ vars.TCR_REPOSITORY_NAMESPACE }}/${{ github.event.repository.name }} image (<IMAGE_ID>)"
time="2023-06-07T19:24:34+08:00" level=info msg="Stopping /CONTAINER_NAME (CONTAINER_ID) with SIGTERM"
time="2023-06-07T19:24:36+08:00" level=info msg="Creating /CONTAINER_NAME"
time="2023-06-07T19:24:36+08:00" level=info msg="Removing image IMAGE_ID"
time="2023-06-07T19:24:43+08:00" level=info msg="Session done" Failed=0 Scanned=1 Updated=1 notify=no
time="2023-06-07T21:24:36+08:00" level=info msg="Found new ${{ vars.TCR_REPOSITORY_URL }}/${{ vars.TCR_REPOSITORY_NAMESPACE }}/${{ github.event.repository.name }} image (IMAGE_ID)"
time="2023-06-07T21:24:36+08:00" level=info msg="Stopping /CONTAINER_NAME (CONTAINER_ID) with SIGTERM"
time="2023-06-07T21:24:37+08:00" level=info msg="Creating /CONTAINER_NAME"
time="2023-06-07T21:24:37+08:00" level=info msg="Removing image <IMAGE_ID>"
time="2023-06-07T21:24:43+08:00" level=info msg="Session done" Failed=0 Scanned=1 Updated=1 notify=no
time="2023-06-07T23:24:22+08:00" level=info msg="Session done" Failed=0 Scanned=1 Updated=0 notify=no
time="2023-06-08T01:24:35+08:00" level=info msg="Found new ${{ vars.TCR_REPOSITORY_URL }}/${{ vars.TCR_REPOSITORY_NAMESPACE }}/${{ github.event.repository.name }} image (IMAGE_ID)"
time="2023-06-08T01:24:35+08:00" level=info msg="Stopping /CONTAINER_NAME (CONTAINER_ID) with SIGTERM"
time="2023-06-08T01:24:36+08:00" level=info msg="Creating /CONTAINER_NAME"
time="2023-06-08T01:24:36+08:00" level=info msg="Removing image IMAGE_ID"
time="2023-06-08T01:24:42+08:00" level=info msg="Session done" Failed=0 Scanned=1 Updated=1 notify=no
time="2023-06-08T03:24:22+08:00" level=info msg="Session done" Failed=0 Scanned=1 Updated=0 notify=no
time="2023-06-08T05:24:22+08:00" level=info msg="Session done" Failed=0 Scanned=1 Updated=0 notify=no
```

## 总结
至此，我们通过 github actions 和 watchtower ，以及基于腾讯云的 TCR （换成其他云操作一致）实现了自动化构建和更新，当然，这里只是简单的介绍了下如何使用，如果你有更好的方法，欢迎留言讨论。

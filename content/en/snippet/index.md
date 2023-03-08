---
title: "Snippets"
date: 2023-01-16T18:05:16+08:00
draft: false
---
## docker
### basic usage
```shell
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
### login
``` shell
docker login <REPOSITORY_URL> --username=zhengfei.li
# type password
```
### build & push
``` shell
docker build --build-arg <ARG_KEY>=<AGR_VALUE> -t <TAG_NAME> -f ./<DOCKERFILE_NAME> .
# tag name with repo url
docker tag <image_id> ${{ REPOSITORY_URL }}/${{ REPOSITORY_NAMESPACE }}/${{ github.event.repository.name }}:latest
# push 
docker push ${{ REPOSITORY_URL }}/${{ REPOSITORY_NAMESPACE }}/${{ github.event.repository.name }}
# pull
docker pull ${{ REPOSITORY_URL }}/${{ REPOSITORY_NAMESPACE }}/${{ github.event.repository.name }}:latest

```
### build new image base biz image
#### config files
`Dockerfile.node`
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
`npmrc`
``` shell
# .npmrc file content
registry=https://registry.npmmirror.com/
user=0
unsafe-perm=true
TARGET=null
# add as needed
```
#### usage
``` shell
docker build --build-arg NODE_VERSION_DEFINE=<NODE_VERSION> -f ./Dockerfile.node .
```
### docker-compose
``` shell
# replace <version_id> with you want to build, can pick one on https://github.com/docker/compose/releases
sudo curl -L "https://github.com/docker/compose/releases/download/<version_id>/docker-compose-$(uname -s)-$(uname -m)" -o /usr/bin/docker-compose
sudo chmod +x /usr/bin/docker-compose
docker-compose --version
```

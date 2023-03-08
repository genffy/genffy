---
title: "Mac Failed to Install Playwright Chromium"
date: 2023-03-08T15:50:27+08:00
draft: false
author: "genffy"
description: "how to fix failed install playwright on mac"
tags: ["playwright", "chromium", "ffmpeg"]
categories: ["front-end"]
series: ["Web-Develop"]
ShowToc: true
TocOpen: false
---
> Why note this? PR's CI checked failed as i skipped install dependency and update pnpm-lock file, so i must to install it and update pnpm-lock file to pass CI. 
> PR's details: https://github.com/originjs/vite-plugin-federation/pull/127

When install `pnpm install playwright-chromium` always pending like this:
```bash
node_modules/.pnpm/playwright-chromium@1.16.3/node_modules/playwright-chromium: Running install script...
```
The solution is try to manual install `chromium` and `ffmpeg`, the deitails: details：https://github.com/microsoft/playwright/blob/main/packages/playwright-chromium/install.js
The version's info and install details pls check this file: https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/utils/registry.ts
# Manual Install
## chromium
[download it](https://download-chromium.appspot.com/) directly
## ffmpeg
`brew install ffmpeg`

FYI: If you encounter such an error
```bash
tar: Error opening archive: Failed to open '/path/to/xxxx.tar.gz'
# tar --extract --no-same-owner --file /path/to/xxxx.tar.gz --directory /private/tmp/yyyyy
```
can try `export HOMEBREW_BOTTLE_DOMAIN=''` and rerun 
# Last
Rerun `pnpm install playwright-chromium` will be smoothly and worked.
# Reference
- https://zhuanlan.zhihu.com/p/383707713

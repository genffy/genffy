---
title: "SSE What Why How"
date: 2023-03-13T10:13:45+08:00
draft: false
author: "genffy"
description: ""
tags: ["Server-Sent Event", "nodejs", "SSE", "Readable Stream", "http"]
categories: ["themes"]
series: ["front-end"]
ShowToc: true
TocOpen: false
---

## Server-Sent Event 是什么

`Server-Sent Event (SSE)` 是一种用于在 Web 应用程序中向客户端发送实时事件的技术，它允许服务器向客户端推送数据，而无需客户端不断地轮询服务器。

### 为了解决什么问题

SSE 是为了解决传统的轮询技术所面临的问题而引入的。在传统的轮询中，客户端不断地向服务器发送请求以检查数据是否可用。这种方式会占用大量带宽和服务器资源，同时也会导致响应延迟。SSE 则完全颠覆了这种方式，客户端只需要向服务器发送一个请求并保持长连接，服务器在有数据更新时即可通过这个连接向客户端推送数据。这种方式减少了不必要的请求和响应，从而提高了性能和效率。SSE 通常用于实时数据更新、通知和聊天应用程序等场景。 -- from @chatGPT

## 数据流规范以及注意事项

### 数据流规范如下

- 数据流以 `data:` 开头，表示接下来是数据内容。
- 数据内容可以是任意文本格式的数据，通常是 `JSON` 或纯文本。
- 数据内容必须以 `\n\n` 结尾，表示这是一个完整的数据块。
- 可以包含一个或多个事件标识符 `(event ID)`，以 `event:` 开头。事件标识符可以用于标识服务器发送的数据类型。
- 可以包含一个或多个注释，以 : 开头。
- 可以包含一个可选的重试时间 `(retry time)`，以 `retry:` 开头，表示客户端在连接断开后应该等待多长时间后重试连接。重试时间必须是以毫秒为单位的整数。

-- from @chatGPT

### 注意事项

- 当不使用 `HTTP/2` 时，SSE 存在打开连接数的限制，这个限制对于打开多个选项卡的情况尤其痛苦，因为每个浏览器都有一个非常低的限制数量 (6)。在 Chrome 和 Firefox 中，这个问题被标记为 “不会修复”。这个限制是针对每个浏览器 + 域名的，这意味着您可以在所有选项卡中打开 6 个 SSE 连接到 www.example1.com，以及另外 6 个 SSE 连接到 www.example2.com（[根据 Stackoverflow 的说法](https://stackoverflow.com/questions/5195452/websockets-vs-server-sent-events-eventsource/5326159)）。在使用 HTTP/2 时，最大并发 HTTP 流的数量是服务器和客户端协商的（默认为 100）。 -- from [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#sect1)

- 响应头的设置：在服务器发送 SSE 数据流时，需要设置一些特定的响应头。其中最重要的是 `Content-Type`，它必须设置为 `text/event-stream`。此外，可以设置一些其他的响应头，例如 `Cache-Control`、`Access-Control-Allow-Origin`、`Access-Control-Allow-Credentials` 等，以提高 SSE 的性能和可靠性。

## 与 WebSocket 有什么区别

`Server-Sent Event (SSE)` 和 WebSocket 都是在 Web 应用程序中实现实时通信的技术，但它们有一些区别。

- SSE 是基于 HTTP 协议的一种技术，而 WebSocket 是一种独立的协议。因此，SSE 可以在任何支持 HTTP 的环境中使用，而 WebSocket 需要在客户端和服务器之间建立一个新的连接。

- SSE 只能从服务器向客户端发送数据，而 WebSocket 可以在客户端和服务器之间进行双向通信。

- SSE 通常用于单向的实时数据更新和通知场景，而 WebSocket 通常用于双向通信和交互式应用程序，如在线游戏和实时聊天等。

- SSE 使用简单，客户端只需要一个普通的 HTTP 请求即可建立连接，而 WebSocket 则需要在客户端和服务器之间进行协议协商。

- SSE 不能发送二进制数据，只能发送纯文本数据，而 WebSocket 可以发送任何类型的数据，包括二进制数据。

综上所述，SSE 和 WebSocket 都有自己的优点和应用场景，具体使用哪种技术取决于具体的需求。

-- from @chatGPT

## `nodejs` 实现一个 demo

在 Node.js 中，可以使用内置的 http 模块来实现 SSE，这个例子演示了如何通过 Node.js 创建一个 SSE 服务器，并通过浏览器的 `EventSource` API 来接收服务器发送的事件流。

以下是一个简单的 SSE 服务器实现示例：

```javascript
const http = require("http");

http
  .createServer((req, res) => {
    // 设置响应头
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // 发送初始数据
    res.write("data: Connected\n\n");

    // 定时发送数据
    const intervalId = setInterval(() => {
      res.write(`data: ${new Date().toISOString()}\n\n`);
      // fix net::ERR_INCOMPLETE_CHUNKED_ENCODING 200 (OK)
      res.flushHeaders();
    }, 1000);

    // 当客户端断开连接时停止发送数据
    req.connection.on("close", () => {
      clearInterval(intervalId);
    });
  })
  .listen(3000);

console.log("SSE server listening on port 3000");
```

该服务器会每秒钟向客户端发送当前时间戳。客户端可以通过以下方式连接到该服务器：

```javascript
const eventSource = new EventSource("http://localhost:3000");
eventSource.addEventListener("message", (event) => {
  console.log(event.data);
});
```

还可以通过将 `Readable Stream` 与 SSE 结合，实现服务器向客户端推送数据的功能

```javascript
const http = require("http");
const { Readable } = require("stream");

// 创建 SSE 服务器
http
  .createServer((req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // 创建一个可读流，每秒钟向流中推送一条数据
    const readable = new Readable({
      read() {},
    });
    const intervalId = setInterval(() => {
      const message = `Current time is: ${new Date().toISOString()}\n\n`;
      readable.push(`data: ${message}`);
    }, 1000);

    // 将可读流中的数据发送到 SSE 事件流中
    readable.pipe(res);

    // 当客户端断开连接时停止向事件流发送数据
    req.connection.on("close", () => {
      readable.unpipe(res);
      clearInterval(intervalId);
    });
  })
  .listen(3000);

console.log("SSE server listening on port 3000");
```

该服务器每秒钟向客户端发送一个包含当前时间戳的 SSE 事件。可读流的数据通过 `pipe()` 方法发送到 SSE 事件流中。

完整 demo 代码参考 
<iframe src="https://stackblitz.com/edit/node-uazjw6?embed=1&view=editor" width="100%" height="800px" style="border: none" />
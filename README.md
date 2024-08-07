# WebSockets

## Agenda 1: WebSocket establishes a handshake between server and client

```sh
yarn add uuid websocket
```

`server/index.js`

```js
const { WebSocketServer } = require("ws");
const http = require("http");

// Spinning the http server and the WebSocket server.
const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 8000;
server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
});
// I'm maintaining all active connections in this object
const clients = {};

// A new client connection request received
wsServer.on("connection", function (connection) {
  // Generate a unique code for every user
  const userId = uuidv4();
  console.log(`Recieved a new connection.`);

  // Store the new connection and handle messages
  clients[userId] = connection;
  console.log(`${userId} connected.`);
});
```

```sh
wget --server-response --header="Connection: Upgrade" --header="Upgrade: websocket" --header="Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" --header="Sec-WebSocket-Version: 13" http://127.0.0.1:8000/
```

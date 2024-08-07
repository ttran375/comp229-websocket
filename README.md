# WebSockets

## Agenda 1: WebSocket establishes a handshake between server and client

### Creating a handshake at the server

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

<!-- Successful WebSocket server handshake

```sh
wget --server-response --header="Connection: Upgrade" --header="Upgrade: websocket" --header="Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" --header="Sec-WebSocket-Version: 13" http://127.0.0.1:8000/
```

- `--server-response`: Prints the HTTP server response headers.
- `--header="Connection: Upgrade"`: Adds the `Connection: Upgrade` header to the request.
- `--header="Upgrade: websocket"`: Adds the `Upgrade: websocket` header to the request.
- `--header="Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw=="`: Adds the `Sec-WebSocket-Key` header to the request (you can use any base64-encoded string).
- `--header="Sec-WebSocket-Version: 13"`: Adds the `Sec-WebSocket-Version: 13` header to the request. -->

### Creating a handshake at the client

Open a new Terminal at root directory:

```sh
yarn create vite client --template react
cd client
```

`client/src/App.jsx`

```js
import useWebSocket from "react-use-websocket";

import "./App.css";

const WS_URL = "ws://127.0.0.1:8000";

function App() {
  useWebSocket(WS_URL, {
    onOpen: () => {
      console.log("WebSocket connection established.");
    },
  });

  return <div>Hello WebSockets!</div>;
}

export default App;
```

```sh
yarn add websocket react-use-websocket 
yarn
yarn dev
```

## Agenda 2: Real-time message transmission

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

```sh
yarn add reactstrap react-avatar react-simple-wysiwyg core-js-pure
```


`client/src/App.jsx`

```js
import { useEffect, useState } from "react";
import { Navbar, NavbarBrand, UncontrolledTooltip } from "reactstrap";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { DefaultEditor } from "react-simple-wysiwyg";
import Avatar from "react-avatar";

import "./App.css";

const WS_URL = "ws://127.0.0.1:8000";

function isUserEvent(message) {
  let evt = JSON.parse(message.data);
  return evt.type === "userevent";
}

function isDocumentEvent(message) {
  let evt = JSON.parse(message.data);
  return evt.type === "contentchange";
}

function App() {
  const [username, setUsername] = useState("");
  const { sendJsonMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log("WebSocket connection established.");
    },
    share: true,
    filter: () => false,
    retryOnError: true,
    shouldReconnect: () => true,
  });

  useEffect(() => {
    if (username && readyState === ReadyState.OPEN) {
      sendJsonMessage({
        username,
        type: "userevent",
      });
    }
  }, [username, sendJsonMessage, readyState]);

  return (
    <>
      <Navbar color="light" light>
        <NavbarBrand href="/">Real-time document editor</NavbarBrand>
      </Navbar>
      <div className="container-fluid">
        {username ? <EditorSection /> : <LoginSection onLogin={setUsername} />}
      </div>
    </>
  );
}

function LoginSection({ onLogin }) {
  const [username, setUsername] = useState("");
  useWebSocket(WS_URL, {
    share: true,
    filter: () => false,
  });
  function logInUser() {
    if (!username.trim()) {
      return;
    }
    onLogin && onLogin(username);
  }

  return (
    <div className="account">
      <div className="account__wrapper">
        <div className="account__card">
          <div className="account__profile">
            <p className="account__name">Hello, user!</p>
            <p className="account__sub">Join to edit the document</p>
          </div>
          <input
            name="username"
            onInput={(e) => setUsername(e.target.value)}
            className="form-control"
          />
          <button
            type="button"
            onClick={() => logInUser()}
            className="btn btn-primary account__btn"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}

function History() {
  console.log("history");
  const { lastJsonMessage } = useWebSocket(WS_URL, {
    share: true,
    filter: isUserEvent,
  });
  const activities = lastJsonMessage?.data.userActivity || [];
  return (
    <ul>
      {activities.map((activity, index) => (
        <li key={`activity-${index}`}>{activity}</li>
      ))}
    </ul>
  );
}

function Users() {
  const { lastJsonMessage } = useWebSocket(WS_URL, {
    share: true,
    filter: isUserEvent,
  });
  const users = Object.values(lastJsonMessage?.data.users || {});
  return users.map((user) => (
    <div key={user.username}>
      <span id={user.username} className="userInfo" key={user.username}>
        <Avatar name={user.username} size={40} round="20px" />
      </span>
      <UncontrolledTooltip placement="top" target={user.username}>
        {user.username}
      </UncontrolledTooltip>
    </div>
  ));
}

function EditorSection() {
  return (
    <div className="main-content">
      <div className="document-holder">
        <div className="currentusers">
          <Users />
        </div>
        <Document />
      </div>
      <div className="history-holder">
        <History />
      </div>
    </div>
  );
}

function Document() {
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(WS_URL, {
    share: true,
    filter: isDocumentEvent,
  });

  let html = lastJsonMessage?.data.editorContent || "";

  function handleHtmlChange(e) {
    sendJsonMessage({
      type: "contentchange",
      content: e.target.value,
    });
  }

  return <DefaultEditor value={html} onChange={handleHtmlChange} />;
}

export default App;
```

### Sending and listening to messages on the Node.js WebSocket server

`server/index.js`

```js
const { WebSocket, WebSocketServer } = require("ws");
const http = require("http");
const uuidv4 = require("uuid").v4;
// Spinning the http server and the WebSocket server.
const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 8000;
server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
});
// I'm maintaining all active connections in this object
const clients = {};
// I'm maintaining all active users in this object
const users = {};
// The current editor content is maintained here.
let editorContent = null;
// User activity history.
let userActivity = [];
// Event types
const typesDef = {
  USER_EVENT: "userevent",
  CONTENT_CHANGE: "contentchange",
};
function broadcastMessage(json) {
  // We are sending the current data to all connected clients
  const data = JSON.stringify(json);
  for (let userId in clients) {
    let client = clients[userId];
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}
function handleMessage(message, userId) {
  const dataFromClient = JSON.parse(message.toString());
  const json = { type: dataFromClient.type };
  if (dataFromClient.type === typesDef.USER_EVENT) {
    users[userId] = dataFromClient;
    userActivity.push(`${dataFromClient.username} joined to edit the document`);
    json.data = { users, userActivity };
  } else if (dataFromClient.type === typesDef.CONTENT_CHANGE) {
    editorContent = dataFromClient.content;
    json.data = { editorContent, userActivity };
  }
  broadcastMessage(json);
}
function handleDisconnect(userId) {
  console.log(`${userId} disconnected.`);
  const json = { type: typesDef.USER_EVENT };
  const username = users[userId]?.username || userId;
  userActivity.push(`${username} left the document`);
  json.data = { users, userActivity };
  delete clients[userId];
  delete users[userId];
  broadcastMessage(json);
}
// A new client connection request received
wsServer.on("connection", function (connection) {
  // Generate a unique code for every user
  const userId = uuidv4();
  console.log("Recieved a new connection");
  // Store the new connection and handle messages
  clients[userId] = connection;
  console.log(`${userId} connected.`);
  connection.on("message", (message) => handleMessage(message, userId));
  // User disconnected
  connection.on("close", () => handleDisconnect(userId));
});
```

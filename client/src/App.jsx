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

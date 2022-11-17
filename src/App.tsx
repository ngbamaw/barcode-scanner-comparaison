import { useState } from "react";
import "./App.css";

import Scanner from "./components/scanner";

function App() {
  const [camera, setCamera] = useState<boolean>(false);
  return (
    <>
      <label id="camera">
        <input
          type="checkbox"
          name="camera"
          checked={camera}
          onChange={() => setCamera(!camera)}
        />
        {camera ? "Camera ON" : "Camera OFF"}
      </label>
      <Scanner enableCamera={camera} width="100%" height="100vh" />
    </>
  );
}

export default App;

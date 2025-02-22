import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { getUsersFromLocationHash } from "./utils";

const initialUsers = getUsersFromLocationHash();

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App initialUsers={initialUsers} />
  </React.StrictMode>
);

serviceWorker.register();

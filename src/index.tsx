import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { getUsersFromLocationHash } from "./users";

const initialUsers = getUsersFromLocationHash();

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App initialUsers={initialUsers} />
  </React.StrictMode>
);

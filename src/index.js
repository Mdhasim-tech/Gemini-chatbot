import React from "react";
import ReactDOM from "react-dom/client"; // Note the change here
import App from "./App";

// Get the root DOM element
const rootElement = document.getElementById("root");

// Create a root of the DOM TREE and render the App
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
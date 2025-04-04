import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../node_modules/react-bootstrap/dist/react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import store from "./redux/store";
import { Provider } from "react-redux";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

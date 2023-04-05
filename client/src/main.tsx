import React from "react";
import ReactDOM from "react-dom/client";
import Modal from "react-modal";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { AuthProvider } from "./context/authContext";
import NotFound from "./routes/notFound";
import Login from "./routes/login";
import Timers from "./routes/timers";
import ProtectedRoute from "./routes/protected";

import "chota";
import "./styles/index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Timers />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

Modal.setAppElement("#root");

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);

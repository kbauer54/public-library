import { createBrowserRouter, Navigate } from "react-router";
import StaffLayout from "./layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Patron Components
import Root from "./components/Root";
import Home from "./components/Home";
import Catalog from "./components/Catalog";
import BookDetails from "./components/BookDetails";
import Events from "./components/Events";
import MyAccount from "./components/MyAccount";
import Login from "./components/Login";

// Staff Components
import Dashboard from "./components/staff_Dashboard";
import CheckOut from "./components/staff_CheckOut";
import CheckIn from "./components/staff_CheckIn";
import ManageCatalog from "./components/staff_ManageCatalog";
import ManageCopies from "./components/staff_ManageCopies";
import PatronLookup from "./components/staff_PatronLookup";
import EventManagement from "./components/staff_EventManagement";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },

  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "catalog", Component: Catalog },
      { path: "catalog/:id", Component: BookDetails },
      { path: "events", Component: Events },
      { path: "my-account", Component: MyAccount },
    ],
  },

  {
    path: "/staff",
    element: (
      <ProtectedRoute>
        <StaffLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/staff/dashboard" replace /> },
      { path: "dashboard", Component: Dashboard },
      { path: "check-out", Component: CheckOut },
      { path: "check-in", Component: CheckIn },
      { path: "catalog", Component: ManageCatalog },
      { path: "copies", Component: ManageCopies },
      { path: "patrons", Component: PatronLookup },
      { path: "events", Component: EventManagement },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

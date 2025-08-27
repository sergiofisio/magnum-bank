import { createBrowserRouter, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import App from "../App";
import LoginPage from "../pages/Login";
import HomePage from "../pages/Home";
import TransactionHistoryPage from "../pages/TransactionHistoryPage";
import NewTransactionPage from "../pages/NewTransactionPage";

import type { RootState } from "../store";
import AuthLayout from "./AuthLayout";
import { IdleTimerProvider } from "../context/IdleTimerContext";
import MainLayout from "../layout/MainLayout";

const ProtectedRoutes = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <IdleTimerProvider>
      <MainLayout />
    </IdleTimerProvider>
  );
};

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: "/login",
            element: <LoginPage />,
          },
          {
            path: "/",
            element: <ProtectedRoutes />,
            children: [
              {
                index: true,
                element: <HomePage />,
              },
              {
                path: "overview",
                element: <HomePage />,
              },
              {
                path: "history",
                element: <TransactionHistoryPage />,
              },
              {
                path: "transactions/new",
                element: <NewTransactionPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

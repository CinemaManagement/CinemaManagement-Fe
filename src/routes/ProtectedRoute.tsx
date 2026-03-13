import URL from "@/constants/url";
import type { JSX } from "react";
import { Navigate } from "react-router-dom";

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;

    const decoded = JSON.parse(atob(payload));
    const exp = decoded.exp;

    if (!exp) return true;

    return Date.now() / 1000 > exp;
  } catch (e) {
    console.error(e);
    return true;
  }
}

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const token = localStorage.getItem("token");

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    return <Navigate to={URL.Login} replace />;
  }

  return children;
}

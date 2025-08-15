import { Outlet, ScrollRestoration, useLocation } from "react-router";
import Navbar from "../commons/navbar";
import Header from "../commons/header";

export default function RootLayout() {
  const { pathname } = useLocation();

  const hasToken = !!localStorage.getItem("accessToken");

  const HIDE_NAV_ROUTES = ["/my/points-daily", "/my/points-daily/result"];
  const hideNav = (!hasToken && pathname === "/") || HIDE_NAV_ROUTES.includes(pathname);

  return (
    <>
      <Header />
      <Outlet />
      <ScrollRestoration />
      {!hideNav && <Navbar />}
    </>
  );
}

import { Outlet, ScrollRestoration, useLocation } from "react-router";
import Navbar from "../commons/navbar";
import Header from "../commons/header";
import useConvertHelpSheetStore from "../../routes/my/stores/useConvertHelpSheetStore";

export default function RootLayout() {
  const { pathname } = useLocation();
  const helpSheetOpen = useConvertHelpSheetStore((s) => s.isOpen);

  const hasToken = !!localStorage.getItem("accessToken");

  const HIDE_NAV_ROUTES = [
    "/my/points-daily",
    "/my/points-daily/result",
    "/my/points-daily/closed",
    "/my/points-daily/ad",
    "/chat/new-chat",
  ];

  const hideNav =
    (!hasToken && pathname === "/") ||
    HIDE_NAV_ROUTES.includes(pathname) ||
    /^\/chat\/[^/]+$/.test(pathname) ||
    helpSheetOpen;

  return (
    <>
      <Header />
      <Outlet />
      <ScrollRestoration />
      {!hideNav && <Navbar />}
    </>
  );
}

import { Outlet, ScrollRestoration } from "react-router";
import Navbar from "../commons/navbar";

export default function RootLayout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
      <Navbar />
    </>
  );
}

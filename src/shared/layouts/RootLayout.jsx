import { Outlet, ScrollRestoration } from "react-router";
import Navbar from "../commons/navbar";
import Header from "../commons/header";

export default function RootLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <ScrollRestoration />
      <Navbar />
    </>
  );
}

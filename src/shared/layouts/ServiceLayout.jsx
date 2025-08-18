import { Outlet, ScrollRestoration, useLocation } from "react-router";
import styled from "styled-components";

export default function ServiceLayout() {
  const { pathname } = useLocation();
  const noPad =
    pathname === "/my/points-daily/result" ||
    pathname === "/my/points-daily/closed" ||
    pathname === "/my/points-daily/ad";

  return (
    <>
      <Container $noPad={noPad}>
        <Outlet />
      </Container>
      <ScrollRestoration />
    </>
  );
}

const Container = styled.div`
  box-sizing: border-box;
  padding: ${({ $noPad }) => ($noPad ? "0" : "0 20px")};
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
`;

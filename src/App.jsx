import { createBrowserRouter, RouterProvider } from "react-router";
import RootLayout from "./shared/layouts/RootLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ServiceLayout from "./shared/layouts/ServiceLayout";

import Home from "./routes/home";
import Map from "./routes/map";
import Search from "./routes/search";
import Chat from "./routes/chat";
import My from "./routes/my";
import MapSearchPage from "./routes/map/MapSearchPage";
import EditLocationPage from "./routes/map/EditLocationPage";
import CheckLocationPage from "./routes/map/CheckLocationPage";
import SearchLocationPage from "./routes/map/SearchLocationPage";

const router = createBrowserRouter([
  {
    // RootLayout은 좌우 패딩값이 필요없는 페이지에 적용한다. (가장 기본이 되는 레이아웃)
    Component: RootLayout,
    children: [
      { path: "/", index: true, Component: Home },
      {
        path: "map",
        children: [
          { index: true, Component: Map },
          { path: "search-map", Component: MapSearchPage },
          { path: "edit-location", Component: EditLocationPage },
          { path: "check-location", Component: CheckLocationPage },
          { path: "search-location", Component: SearchLocationPage },
        ],
      },
      // ServiceLayout은 좌우 패딩값이 20px로 되어있다.
      {
        Component: ServiceLayout,
        children: [
          { path: "search", Component: Search },
          { path: "chat", Component: Chat },
          { path: "my", Component: My },
        ],
      },
    ],
  },
]);

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;

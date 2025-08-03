import { createBrowserRouter, RouterProvider } from "react-router";
import RootLayout from "./shared/layouts/RootLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ServiceLayout from "./shared/layouts/ServiceLayout";

import Home from "./routes/home";
import Map from "./routes/map";
import Search from "./routes/search";
import Chat from "./routes/chat";
import My from "./routes/my";

const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      { path: "/", index: true, Component: Home },
      {
        Component: ServiceLayout,
        children: [
          { path: "map", Component: Map },
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

import { createBrowserRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RootLayout from "./shared/layouts/RootLayout";
import ServiceLayout from "./shared/layouts/ServiceLayout";
import ProtectedRoute from "./shared/layouts/ProtectedRoute";
import Loading from "./shared/commons/loading";

import RootPage from "./routes/home";
import Map from "./routes/map";
import Search from "./routes/search";
import Chat from "./routes/chat";
import My from "./routes/my";

// Map 페이지
import MapSearchPage from "./routes/map/MapSearchPage";
import EditLocationPage from "./routes/map/EditLocationPage";
import CheckLocationPage from "./routes/map/CheckLocationPage";
import SearchLocationPage from "./routes/map/SearchLocationPage";
import MyIngredientsPage from "./routes/my/MyIngredientsPage";
import MyRecipesPage from "./routes/my/MyRecipesPage";
import MyHistoryPage from "./routes/my/MyHistoryPage";
import DailyPointsPage from "./routes/my/DailyPointsPage";
import ConvertPointsPage from "./routes/my/ConvertPointsPage";
import DailyPointsResultPage from "./routes/my/DailyPointsResultPage";

// Home 페이지
import MonthlyPickPage from "./routes/home/seasonal-tab/MonthlyPickPage";
import SeasonalDetailPage from "./routes/home/seasonal-tab/SeasonalDetailPage";
import SeasonalRecipePage from "./routes/home/seasonal-tab/SeasonalRecipePage";
import CategoryDetailPage from "./routes/home/stock-tab/CategoryDetailPage";

// Chat 페이지
import ChatbotPage from "./routes/chat/ChatbotPage";

// Search 페이지
import ItemDetailPage from "./routes/search/ItemDetailPage";

const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      { index: true, Component: RootPage },

      /*  토큰이 필요한 페이지를 ProtectedRoute로 감싼다.
          url로 접근 불가 */
      {
        Component: ProtectedRoute,
        children: [
          {
            path: "/",
            children: [
              { path: "monthly-pick", Component: MonthlyPickPage },
              { path: "seasonal/:id", Component: SeasonalDetailPage },
              { path: "seasonal/:id/:recipeId", Component: SeasonalRecipePage },
              { path: "category/:title", Component: CategoryDetailPage },
            ],
          },
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
          {
            path: "chat",
            children: [
              { index: true, Component: Chat },
              { path: "new-chat", Component: ChatbotPage },
            ],
          },
          {
            Component: ServiceLayout,
            children: [
              {
                path: "search",
                children: [
                  { index: true, Component: Search },
                  { path: "ingredients/:id", Component: ItemDetailPage },
                ],
              },
              {
                path: "my",
                children: [
                  { index: true, Component: My },
                  { path: "list-ingredients", Component: MyIngredientsPage },
                  { path: "list-recipes", Component: MyRecipesPage },
                  { path: "history", Component: MyHistoryPage },
                  { path: "points-daily", Component: DailyPointsPage },
                  { path: "points-convert", Component: ConvertPointsPage },
                  { path: "points-daily/result", Component: DailyPointsResultPage },
                ],
              },
            ],
          },
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
      <Loading />
    </QueryClientProvider>
  );
}

export default App;

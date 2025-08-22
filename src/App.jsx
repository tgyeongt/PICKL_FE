import { createBrowserRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RootLayout from "./shared/layouts/RootLayout";
import ServiceLayout from "./shared/layouts/ServiceLayout";
import ProtectedRoute from "./shared/layouts/ProtectedRoute";

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

// My 페이지
import MyIngredientsPage from "./routes/my/MyIngredientsPage";
import MyRecipesPage from "./routes/my/MyRecipesPage";
import MyHistoryPage from "./routes/my/MyHistoryPage";
import ConversationDetailPage from "./routes/my/ConversationDetailPage";
import DailyPointsPage from "./routes/my/DailyPointsPage";
import ConvertPointsPage from "./routes/my/ConvertPointsPage";
import DailyPointsResultPage from "./routes/my/DailyPointsResultPage";
import DailyPointsClosedPage from "./routes/my/DailyPointsClosedPage";
import DailyAdPage from "./routes/my/DailyAdPage";

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

      // 토큰이 필요한 페이지들
      {
        Component: ProtectedRoute,
        children: [
          // 홈 하위
          {
            path: "/",
            children: [
              { path: "monthly-pick", Component: MonthlyPickPage },
              { path: "seasonal/:id", Component: SeasonalDetailPage },
              { path: "seasonal/:id/:recipeId", Component: SeasonalRecipePage },
              { path: "category/:market/:categoryCode", Component: CategoryDetailPage },
            ],
          },

          // 맵 하위
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

          // 채팅 하위
          {
            path: "chat",
            children: [
              { index: true, Component: Chat },
              { path: "new-chat", Component: ChatbotPage },
              { path: ":id", Component: ChatbotPage },
            ],
          },

          // 패딩 포함 섹션들
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
                  { path: "history/:conversationId", Component: ConversationDetailPage },
                  { path: "points-daily", Component: DailyPointsPage },
                  { path: "points-convert", Component: ConvertPointsPage },
                  { path: "points-daily/result", Component: DailyPointsResultPage },
                  { path: "points-daily/closed", Component: DailyPointsClosedPage },
                  { path: "points-daily/ad", Component: DailyAdPage },
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
      queries: { retry: 1 },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;

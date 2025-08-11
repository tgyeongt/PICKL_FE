import { useLocation, useNavigate } from "react-router-dom";

import MiniNav from "./MiniNav";
import CheaperView from "./CheaperView";
import SeasonalView from "./SeasonalView";
import MarketView from "./MarketView";

export default function Content() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab") || "알뜰소비";

  const setActiveTab = (tab) => {
    navigate(`?tab=${encodeURIComponent(tab)}`, { replace: false });
  };

  return (
    <>
      <MiniNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ backgroundColor: "#F5F5F7", padding: "0 20px" }}>
        {activeTab === "알뜰소비" && <CheaperView />}
        {activeTab === "제철식재료" && <SeasonalView />}
        {activeTab === "시세 평균" && <MarketView />}
      </div>
    </>
  );
}

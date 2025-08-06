import { useState } from "react";

import MiniNav from "./MiniNav";
import CheaperView from "./CheaperView";
import SeasonalView from "./SeasonalView";
import MarketView from "./MarketView";

export default function Content() {
  const [activeTab, setActiveTab] = useState("알뜰소비");

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

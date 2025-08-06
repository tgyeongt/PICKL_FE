import styled from "styled-components";

const tabs = ["알뜰소비", "제철식재료", "시세 평균"];

export default function MiniNav({ activeTab, setActiveTab }) {
  return (
    <NavBar>
      {tabs.map((tab) => (
        <TabButton key={tab} onClick={() => setActiveTab(tab)} $active={activeTab === tab}>
          {tab}
        </TabButton>
      ))}
    </NavBar>
  );
}

const NavBar = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 10px 0 0 0;
  background-color: #fbfbfb;
`;

const TabButton = styled.button`
  width: 120px;
  height: 25px;
  display: flex;
  justify-content: center;
  font-size: 14px;
  font-weight: ${(props) => (props.$active ? "700" : "500")};
  color: ${(props) => (props.$active ? "#1C1B1A" : "#787885")};
  border-bottom: ${(props) => (props.$active ? "2px solid #1C1B1A" : "none")};
  padding: 5px 10px;
  cursor: pointer;
`;

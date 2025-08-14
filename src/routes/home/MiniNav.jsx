import styled from "styled-components";
import { motion } from "framer-motion";

const tabs = ["알뜰소비", "제철식재료", "시세 평균"];

export default function MiniNav({ activeTab, setActiveTab }) {
  return (
    <NavBar>
      {tabs.map((tab) => (
        <TabWrapper key={tab} onClick={() => setActiveTab(tab)}>
          <TabButton $active={activeTab === tab}>{tab}</TabButton>
          {activeTab === tab && (
            <ActiveBar
              layoutId="activeTab"
              transition={{ type: "spring", stiffness: 400, damping: 50 }}
            />
          )}
        </TabWrapper>
      ))}
    </NavBar>
  );
}

const NavBar = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 10px 0 0 0;
  background-color: #fbfbfb;
  position: relative;
`;

const TabWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
`;

const TabButton = styled.div`
  width: 120px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: ${(props) => (props.$active ? "700" : "500")};
  color: ${(props) => (props.$active ? "#1C1B1A" : "#787885")};
`;

const ActiveBar = styled(motion.div)`
  position: absolute;
  bottom: 0;
  height: 2px;
  width: 100%;
  background-color: #1c1b1a;
  border-radius: 1px;
`;

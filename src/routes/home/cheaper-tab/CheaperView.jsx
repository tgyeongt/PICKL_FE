import { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import TraditionalMarket from "./TraditionalMarket";
import SuperMarket from "./SuperMarket";

const tabs = ["전통시장", "대형마트"];

export default function CheaperView() {
  const [selected, setSelected] = useState("전통시장");

  return (
    <Wrapper>
      <Header>
        <p className="title">피클로 알뜰하게 소비하세요</p>
        <ToggleContainer>
          {tabs.map((tab) => (
            <TabButton key={tab} onClick={() => setSelected(tab)} $isActive={selected === tab}>
              {selected === tab && (
                <Highlight
                  layoutId="highlight"
                  transition={{ type: "spring", stiffness: 500, damping: 50 }}
                />
              )}
              <span>{tab}</span>
            </TabButton>
          ))}
        </ToggleContainer>
      </Header>{" "}
      <div>
        {selected === "전통시장" && <TraditionalMarket selected={selected} />}
        {selected === "대형마트" && <SuperMarket selected={selected} />}
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px 10px;

  .title {
    font-size: 14px;
    font-weight: 700;
    color: #1c1b1a;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  height: 26px;
  align-items: center;
  background-color: #fff;
  border-radius: 30px;
  overflow: hidden;
  position: relative;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 4px 10px;
  border: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;

  span {
    position: relative;
    z-index: 1;
    color: ${({ $isActive }) => ($isActive ? "#fff" : "#1c1b1a")};
  }
`;

const Highlight = styled(motion.div)`
  position: absolute;
  inset: 0;
  background-color: #1c1b1a;
  border-radius: 30px;
  z-index: 0;
`;

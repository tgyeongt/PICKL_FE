import useHeaderStore from "../../stores/useHeaderStore";
import styled from "styled-components";
import back from "@icon/common/back.svg";
import heart_on from "@icon/common/heart_on.svg";
import heart_off from "@icon/common/heart_off.svg";
import helpIcon from "@icon/my/QIcon.svg";
import { useLayoutEffect, useRef, useState } from "react";
import Toast from "./Toast";

export default function Header() {
  const { title, showBack, showHeart, isVisible, isHeartActive, toggleHeart, showHelp, onHelp } =
    useHeaderStore();

  const titleRef = useRef(null);
  const [titleW, setTitleW] = useState(0);

  useLayoutEffect(() => {
    if (titleRef.current) setTitleW(titleRef.current.clientWidth);
  }, [title]);

  if (!isVisible) return null;

  return (
    <>
      <Wrapper>
        {showBack ? (
          <IconButton aria-label="뒤로가기" onClick={() => window.history.back()}>
            <img src={back} alt="" />
          </IconButton>
        ) : (
          <IconSpacer />
        )}

        <TitleOnly ref={titleRef}>{title}</TitleOnly>

        {/* 도움말 아이콘: 제목 우측에 살짝 붙여 배치 */}
        {showHelp && (
          <HelpButton
            aria-label="도움말"
            onClick={onHelp}
            style={{ left: `calc(50% + ${titleW / 2.3}px)` }}
          >
            <img src={helpIcon} alt="" />
          </HelpButton>
        )}

        <RightSlot>
          {showHeart ? (
            <IconButton aria-label="찜하기" onClick={toggleHeart}>
              <img src={isHeartActive ? heart_on : heart_off} alt="" />
            </IconButton>
          ) : (
            <IconSpacer />
          )}
        </RightSlot>
      </Wrapper>
      <Toast />
    </>
  );
}

const Wrapper = styled.header`
  position: fixed;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  height: 50px;
  padding: 0 20px;
  background-color: white;
`;

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  img {
    width: 20px;
    height: 20px;
    display: block;
  }
`;

const IconSpacer = styled.div`
  width: 32px;
  height: 32px;
`;

const RightSlot = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
`;

const TitleOnly = styled.p`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  white-space: nowrap;
`;

const HelpButton = styled(IconButton)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.85;
  img {
    width: 14px;
    height: 14px;
  }
`;

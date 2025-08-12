import useHeaderStore from "../../stores/useHeaderStore";
import styled from "styled-components";
import back from "@icon/common/back.svg";
import heart_on from "@icon/common/heart_on.svg";
import heart_off from "@icon/common/heart_off.svg";
import helpIcon from "@icon/my/QIcon.svg";

export default function Header() {
  const { title, showBack, showHeart, isVisible, isHeartActive, toggleHeart, showHelp, onHelp } =
    useHeaderStore();

  if (!isVisible) return null;

  return (
    <Wrapper>
      {/* 왼쪽: 뒤로가기 */}
      {showBack ? (
        <IconButton aria-label="뒤로가기" onClick={() => window.history.back()}>
          <img src={back} alt="" />
        </IconButton>
      ) : (
        <IconSpacer />
      )}

      {/* 중앙: 제목 + 물음표 (항상 중앙 고정) */}
      <TitleWrapper>
        <Title>{title}</Title>
        {showHelp && (
          <HelpButton aria-label="도움말" onClick={onHelp}>
            <img src={helpIcon} alt="" />
          </HelpButton>
        )}
      </TitleWrapper>

      {/* 오른쪽: 찜 (오른쪽 끝으로 밀기) */}
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
  );
}

const Wrapper = styled.header`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 50px;
  min-width: 390px;
  padding: 0 20px;
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
    display: block;
    width: 20px;
    height: 20px;
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

const TitleWrapper = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0px;
`;

const Title = styled.p`
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
`;

const HelpButton = styled(IconButton)`
  opacity: 0.85;
  img {
    width: 14px;
    height: 14px;
  }
`;

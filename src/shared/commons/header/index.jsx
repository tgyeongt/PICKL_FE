import useHeaderStore from "../../stores/useHeaderStore";
import styled from "styled-components";
import back from "@icon/common/back.svg";
import heart_on from "@icon/common/heart_on.svg";
import heart_off from "@icon/common/heart_off.svg";

export default function Header() {
  const { title, showBack, showHeart, isVisible, isHeartActive, toggleHeart } = useHeaderStore();

  if (!isVisible) return null;

  return (
    <Wrapper>
      {showBack && (
        <button onClick={() => window.history.back()}>
          <img src={back} alt="뒤로가기" />
        </button>
      )}

      <Title>{title}</Title>

      {showHeart && (
        <button onClick={toggleHeart}>
          <img src={isHeartActive ? heart_on : heart_off} />
        </button>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 50px;
  background-color: white;
  min-width: 390px;
  padding: 0 20px;
`;

const Title = styled.p`
  font-size: 16px;
  font-weight: 700;
  flex: 1;
  text-align: center;
`;

import useHeaderStore from "../../stores/useHeaderStore";
import styled from "styled-components";

export default function Header() {
  const { title, showBack, showHeart, onHeartClick } = useHeaderStore();

  return (
    <Wrapper>
      {showBack && (
        <button
          onClick={() => window.history.back()}
          style={{ marginLeft: "16px", fontSize: "18px", cursor: "pointer" }}
          aria-label="뒤로가기"
        >
          ←
        </button>
      )}

      <Title>{title}</Title>

      {showHeart && (
        <button
          onClick={() => onHeartClick?.()}
          style={{
            marginRight: "16px",
            fontSize: "20px",
            cursor: "pointer",
            background: "black",
            border: "none",
            color: "white",
          }}
          aria-label="찜하기"
        >
          ❤️
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
`;

const Title = styled.p`
  font-size: 16px;
  font-weight: 700;
  flex: 1;
  text-align: center;
`;

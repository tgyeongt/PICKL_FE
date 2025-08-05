import useHeaderStore from "../../stores/useHeaderStore";
import styled from "styled-components";

export default function Header() {
  const { title, showBack, showHeart } = useHeaderStore;

  return (
    <Wrapper>
      {showBack && (
        <button
          onClick={() => window.history.back()}
          style={{ marginRight: "16px", fontSize: "18px", cursor: "pointer" }}
          aria-label="뒤로가기"
        >
          ←
        </button>
      )}

      <h1 style={{ flexGrow: 1, fontSize: "20px", margin: 0 }}>{title}</h1>

      {showHeart && (
        <button
          onClick={() => alert("찜하기 버튼 클릭!")}
          style={{ fontSize: "20px", cursor: "pointer", background: "none", border: "none" }}
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
  background-color: black;
`;

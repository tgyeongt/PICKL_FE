import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import styled from "styled-components";
import useHeader from "../../shared/hooks/useHeader";
import Arrow from "@icon/chat/arrow.svg";

export default function ChatbotPage() {
  useHeader({
    title: "피클이와 대화중",
    showBack: true,
  });

  const location = useLocation();
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (location.state?.question) {
      setSearchText(location.state.question);
      handleSearch(location.state.question);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleSearch = (text) => {
    alert(text || searchText); // 추후 통신 연결
  };

  return (
    <Wrapper>
      <SearchBox>
        <input
          type="text"
          placeholder="피클이에게 궁금한 걸 물어보세요!"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={() => handleSearch()}>
          <img src={Arrow} alt="" />
        </button>
      </SearchBox>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SearchBox = styled.div`
  position: fixed;
  bottom: 20px;
  display: flex;
  gap: 8px;
  width: 90%;
  height: 50px;
  max-width: 400px;
  border: 1px solid #ccc;
  border-radius: 30px;
  padding: 5px;
  background: white;
  transition: bottom 0.3s ease;

  input {
    flex: 1;
    padding: 10px 15px;
    font-size: 14px;
  }

  button {
    height: 40px;
    width: 40px;
    cursor: pointer;
  }
`;

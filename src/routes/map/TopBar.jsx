import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import BackButtonIcon from "@icon/backButtonIcon.png";

export default function TopBar({ title }) {
  const navigate = useNavigate();

  return (
    <TopBarWrapper>
      <BackButton onClick={() => navigate(-1)}>
        <BackIcon src={BackButtonIcon} alt="뒤로가기" />
      </BackButton>
      <TopTitle>{title}</TopTitle>
    </TopBarWrapper>
  );
}

const TopBarWrapper = styled.div`
  background-color: aliceblue;
  width: 100%;
  display: flex;
  align-items: center;
  padding-top: 13px;
  padding-bottom: 35px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 0;
  display: flex;
  align-items: center;
  width: 24px;
  height: 24px;
`;

const BackIcon = styled.img``;

const TopTitle = styled.p`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: #1a1a1a;
  font-family: Pretendard;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
`;

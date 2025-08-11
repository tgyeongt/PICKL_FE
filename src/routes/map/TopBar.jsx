import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import BackButtonIcon from "@icon/map/backButtonIcon.svg";

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
  background-color: #fbfbfb;
  width: 100%;
  display: flex;
  align-items: center;
  padding-top: 13px;
  padding-bottom: 0px;
  position: relative;
  padding-left: 20px;
  padding-right: 20px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 0;
  display: flex;
  align-items: center;
  width: 35px;
  height: 35px;
`;

const BackIcon = styled.img`
  width: 24px;
  height: 24px;
`;

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

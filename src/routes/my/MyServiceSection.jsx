import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { APIService } from "../../shared/lib/api";
import chevronRight from "@icon/my/chevron-right.svg";
import todayPointIcon from "@icon/my/faceIcon.svg";
import convertPointIcon from "@icon/my/beadIcon.svg";

export default function MyServiceSection() {
  const navigate = useNavigate();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await APIService.private.get("/me");
      const raw = res?.data ?? res ?? {};
      return {
        displayName: raw?.displayName || raw?.nickname || raw?.name || "정시태근희망러",
      };
    },
    staleTime: 60 * 1000,
    retry: 1,
  });

  const displayName = me?.displayName || "정시태근희망러";

  return (
    <MyServiceSectionWrapper>
      <SectionTitle>{displayName}님을 위한 맞춤형 서비스</SectionTitle>

      <List>
        <ListButton onClick={() => navigate("/my/points-daily")}>
          <Left>
            <Icon src={todayPointIcon} alt="" />
            <LabelBox>
              <MainLabel>오늘의 포인트 받기</MainLabel>
            </LabelBox>
          </Left>
          <RightIcon src={chevronRight} alt="" />
        </ListButton>

        <ListButton onClick={() => navigate("/my/points-convert")}>
          <Left>
            <Icon src={convertPointIcon} alt="" />
            <LabelBox>
              <MainLabel>포인트 전환하러 가기</MainLabel>
            </LabelBox>
          </Left>
          <RightIcon src={chevronRight} alt="" />
        </ListButton>
      </List>
    </MyServiceSectionWrapper>
  );
}

const MyServiceSectionWrapper = styled.section`
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  background: #fbfbfb;
  padding: 14px 10px 104px 10px;
`;

const SectionTitle = styled.p`
  color: #0f1c0d;
  font-family: Pretendard;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
  padding-bottom: 10px;
  padding-top: 10px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ListButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 10px 8px;
  background: #fbfbfb;
  border: none;
  border-radius: 12px;
  cursor: pointer;

  transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.18s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: scale(0.99);
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Icon = styled.img`
  width: 40px;
  height: 40px;
  aspect-ratio: 1/1;
  object-fit: contain;
`;

const LabelBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const MainLabel = styled.p`
  color: #0f1c0d;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
`;

const RightIcon = styled.img`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  aspect-ratio: 1/1;
`;

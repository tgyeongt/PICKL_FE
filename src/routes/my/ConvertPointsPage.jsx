import styled from "styled-components";
import useHeader from "../../shared/hooks/useHeader";
import PointStateSection from "./PointStateSection";
import ConvertPointSection from "./ConvertPointSection";
import ConvertTicketSection from "./ConvertTicketSection";
import ConvertButtonSection from "./ConvertButtonSection";

export default function ConvertPointsPage() {
  useHeader({
    title: "전환하기",
    showBack: true,
  });

  return (
    <ConvertPointsPageWrapper>
      <PointStateSection />
      <ConvertPointSection />
      <ConvertTicketSection />
      <ConvertButtonSection />
    </ConvertPointsPageWrapper>
  );
}

const ConvertPointsPageWrapper = styled.div``;

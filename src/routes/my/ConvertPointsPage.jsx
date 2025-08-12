import styled from "styled-components";
import useHeader from "../../shared/hooks/useHeader";
import PointStateSection from "./PointStateSection";
import ConvertPointSection from "./ConvertPointSection";
import ConvertTicketSection from "./ConvertTicketSection";
import ConvertButtonSection from "./ConvertButtonSection";
import { ConvertPointsProvider } from "./convert/ConvertPointsContext";

export default function ConvertPointsPage() {
  useHeader({
    title: "전환하기",
    showBack: true,
  });

  return (
    <ConvertPointsProvider>
      <ConvertPointsPageWrapper>
        <PointStateSection />
        <ConvertPointSection />
        <ConvertTicketSection />
        <ConvertButtonSection />
      </ConvertPointsPageWrapper>
    </ConvertPointsProvider>
  );
}

const ConvertPointsPageWrapper = styled.div`
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  background: #fbfbfb;
  padding: 0 10px;
`;

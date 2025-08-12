import styled from "styled-components";
import useHeader from "../../shared/hooks/useHeader";
import PointStateSection from "./PointStateSection";
import ConvertPointSection from "./ConvertPointSection";
import ConvertTicketSection from "./ConvertTicketSection";
import ConvertButtonSection from "./ConvertButtonSection";
import { ConvertPointsProvider } from "./convert/ConvertPointsContext";
import { useState } from "react";
import FirstModal from "./modal/FirstModal";
import TwoModal from "./modal/TwoModal";

export default function ConvertPointsPage() {
  const [modalStep, setModalStep] = useState(0); // 0: none, 1: first, 2: two

  const openFirstModal = () => setModalStep(1);
  const closeModal = () => setModalStep(0);
  const goSecondModal = () => setModalStep(2);

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
        <ConvertButtonSection onRequestConvert={openFirstModal} />
        {modalStep === 1 && <FirstModal onClose={closeModal} onNext={goSecondModal} />}
        {modalStep === 2 && <TwoModal onClose={closeModal} />}
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

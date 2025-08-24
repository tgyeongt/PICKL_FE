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
import ConvertHelpSheet from "./modal/ConvertHelpSheet";

export default function ConvertPointsPage() {
  const [modalStep, setModalStep] = useState(0);
  const [snapshot, setSnapshot] = useState({ points: 0, won: 0 });
  const [helpOpen, setHelpOpen] = useState(false);

  const openFirstModal = (snap) => {
    if (snap) setSnapshot(snap);
    setModalStep(1);
  };
  const closeModal = () => setModalStep(0);
  const goSecondModal = () => setModalStep(2);

  const openHelp = () => setHelpOpen(true);
  const closeHelp = () => setHelpOpen(false);

  useHeader({
    title: "전환하기",
    showBack: true,
    showHelp: true,
    onHelp: openHelp,
  });

  return (
    <ConvertPointsProvider>
      <ConvertPointsPageWrapper>
        <PointStateSection />
        <ConvertPointSection />
        <ConvertTicketSection />
        <ConvertButtonSection onRequestConvert={openFirstModal} />
        {modalStep === 1 && <FirstModal onClose={closeModal} onNext={goSecondModal} />}
        {modalStep === 2 && <TwoModal onClose={closeModal} snapshot={snapshot} />}
        <ConvertHelpSheet open={helpOpen} onClose={closeHelp} />
      </ConvertPointsPageWrapper>
    </ConvertPointsProvider>
  );
}

const ConvertPointsPageWrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  background: #fbfbfb;
  padding: 50px 10px 0;
  overflow-x: hidden;
`;

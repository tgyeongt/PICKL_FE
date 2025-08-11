import { useState, useEffect } from "react";
import {
  OverlayBox,
  IconSectionWrapper,
  CheckIcon,
  NoteSectionWrapper,
  NoteText,
} from "./SetModalBar.styles";
import SetCheckIcon from "@icon/map/greenCheck.svg";

export default function SetModalBar({ children }) {
  return <>{children}</>;
}

function Overlay({ children, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <OverlayBox onClick={onClose} $visible={visible}>
      {children}
    </OverlayBox>
  );
}

function IconSection() {
  return (
    <IconSectionWrapper>
      <CheckIcon src={SetCheckIcon} alt="그린체크" />
    </IconSectionWrapper>
  );
}

function NoteSection() {
  return (
    <NoteSectionWrapper>
      <NoteText>위치 설정 완료!</NoteText>
    </NoteSectionWrapper>
  );
}

SetModalBar.Overlay = Overlay;
SetModalBar.IconSection = IconSection;
SetModalBar.NoteSection = NoteSection;

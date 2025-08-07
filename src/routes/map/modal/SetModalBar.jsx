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
  return <OverlayBox onClick={onClose}>{children}</OverlayBox>;
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

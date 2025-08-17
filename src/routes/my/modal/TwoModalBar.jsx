import { useEffect, useState } from "react";
import {
  OverlayBox,
  IconSectionWrapper,
  GreenCheck,
  TextSectionWrapper,
  Text,
} from "./TwoModalBar.styles";
import CheckIcon from "@icon/map/greenCheck.svg";

export default function TwoModalBar({ children }) {
  return <>{children}</>;
}

function Overlay({ children, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, [onClose]);

  return (
    <OverlayBox onClick={onClose} $visible={visible}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </OverlayBox>
  );
}

function IconSection() {
  return (
    <IconSectionWrapper>
      <GreenCheck src={CheckIcon} alt="" />
    </IconSectionWrapper>
  );
}

function TextSection({ snapshot }) {
  const wonAmount = Number(snapshot?.won || 0);

  const text =
    wonAmount > 0
      ? `${wonAmount.toLocaleString()}원 지역화폐로 전환 완료!🎉`
      : "전환이 완료되었어요!🎉";

  return (
    <TextSectionWrapper>
      <Text>{text}</Text>
    </TextSectionWrapper>
  );
}

TwoModalBar.Overlay = Overlay;
TwoModalBar.IconSection = IconSection;
TwoModalBar.TextSection = TextSection;

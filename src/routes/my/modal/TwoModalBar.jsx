import { useEffect, useState } from "react";
import {
  OverlayBox,
  IconSectionWrapper,
  GreenCheck,
  TextSectionWrapper,
  Text,
} from "./TwoModalBar.styles";
import CheckIcon from "@icon/map/greenCheck.svg";
import { useConvertPoints } from "../convert/ConvertPointsContext";

export default function TwoModalBar({ children }) {
  return <>{children}</>;
}

function Overlay({ children, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(onClose, 1500);
    return () => clearTimeout(t);
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

function TextSection() {
  const { state, derived } = useConvertPoints();

  const pointToWon = Number(derived?.rules?.pointToWon ?? 0);
  const pointsNum = Number(state?.pointAmount ?? 0);
  const wonAmount = Number(pointsNum * pointToWon) || 0;

  return (
    <TextSectionWrapper>
      <Text>{wonAmount.toLocaleString()}원 지역화폐로 전환 완료!🎉</Text>
    </TextSectionWrapper>
  );
}

TwoModalBar.Overlay = Overlay;
TwoModalBar.IconSection = IconSection;
TwoModalBar.TextSection = TextSection;

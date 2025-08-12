import { useState, useEffect } from "react";
import {
  OverlayBox,
  IconSectionWrapper,
  GreenCheck,
  TextSectionWrapper,
  FirstModalText,
  ButtonSectionWrapper,
  Button,
} from "./FirstModalBar.styles";
import { useConvertPoints } from "../convert/ConvertPointsContext";
import CheckIcon from "@icon/map/greenCheck.svg";

export default function FirstModalBar({ children }) {
  return <>{children}</>;
}

function Overlay({ children, onClose }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => setVisible(true), []);
  return (
    <OverlayBox onClick={onClose} $visible={visible}>
      {children}
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

  const voucherLabelMap = {
    seoul: "서울사랑상품권",
    seongbuk: "성북사랑상품권",
  };
  const label = voucherLabelMap[state?.selectedVoucher] ?? "서울사랑상품권";

  const pointToWon = derived?.rules?.pointToWon ?? 0;
  const pointsNum = Number(state?.pointAmount || 0);
  const wonAmount = pointsNum * pointToWon;

  return (
    <TextSectionWrapper>
      <FirstModalText>
        {label}으로 {wonAmount.toLocaleString()}원
      </FirstModalText>
      <FirstModalText>전환하시겠습니까?</FirstModalText>
    </TextSectionWrapper>
  );
}

function ButtonSection({ onClose, onNext }) {
  return (
    <ButtonSectionWrapper>
      <Button $value="false" onClick={onClose}>
        취소
      </Button>
      <Button $value="true" onClick={onNext}>
        전환하기
      </Button>
    </ButtonSectionWrapper>
  );
}

FirstModalBar.Overlay = Overlay;
FirstModalBar.IconSection = IconSection;
FirstModalBar.TextSection = TextSection;
FirstModalBar.ButtonSection = ButtonSection;

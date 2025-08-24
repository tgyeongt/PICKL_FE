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
import { useAtomValue } from "jotai";
import { selectedAddressAtom } from "../../map/state/addressAtom";
import useCurrentAddress from "../../map/hooks/useCurrentAddress";
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
  const selectedAddress = useAtomValue(selectedAddressAtom);
  const { address: fallbackAddr } = useCurrentAddress(
    !selectedAddress?.jibunAddress && !selectedAddress?.roadAddress
  );

  const deriveGuDong = (addr = "") => {
    const m1 = addr.match(/([\w가-힣]+구)\s+([\w가-힣]+동)/);
    if (m1) return `${m1[1]} ${m1[2]}`;
    const m2 = addr.match(/([\w가-힣]+구)/);
    if (m2) return m2[1];
    return addr.split(/\s+/).slice(0, 2).join(" ");
  };

  const getCurrentDistrict = () => {
    const rawAddr =
      selectedAddress?.jibunAddress || selectedAddress?.roadAddress || fallbackAddr || "";
    const shortAddr = deriveGuDong(rawAddr);

    const districtMatch = shortAddr.match(/([\w가-힣]+구)/);
    if (districtMatch) {
      return districtMatch[0];
    }

    const cityMatch = shortAddr.match(/([\w가-힣]+시)/);
    if (cityMatch) {
      return cityMatch[0];
    }

    return "서초";
  };

  const currentDistrict = getCurrentDistrict();

  const voucherLabelMap = {
    seoul: "서울사랑상품권",
    seocho: `${currentDistrict}사랑상품권`,
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
  const { convert, converting, derived, state } = useConvertPoints();

  const handleConfirm = async () => {
    if (!derived?.canSubmit) {
      alert(derived?.reasons?.[0] || "입력 값을 확인해줘");
      return;
    }

    await convert(Number(state?.pointAmount || 0));
    onNext?.();
  };

  return (
    <ButtonSectionWrapper>
      <Button $value="false" onClick={onClose} disabled={converting}>
        취소
      </Button>
      <Button $value="true" onClick={handleConfirm} disabled={converting}>
        {converting ? "전환 중..." : "전환하기"}
      </Button>
    </ButtonSectionWrapper>
  );
}

FirstModalBar.Overlay = Overlay;
FirstModalBar.IconSection = IconSection;
FirstModalBar.TextSection = TextSection;
FirstModalBar.ButtonSection = ButtonSection;

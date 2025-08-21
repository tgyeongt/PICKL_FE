import styled from "styled-components";
import { useState } from "react";
import { useConvertPoints } from "./convert/ConvertPointsContext";
import pPointBlack from "@icon/my/pPointBlackIcon.svg";

export default function ConvertPointSection() {
  const { stats, state, setPointAmount, derived } = useConvertPoints();
  const [editing, setEditing] = useState(false);

  const toDigits = (s) => (s || "").replace(/\D/g, "");
  const toComma = (s) => (s || "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const snapStep = (n) => Math.floor(n / derived.rules.pointStep) * derived.rules.pointStep;

  const handleChange = (e) => {
    const digits = toDigits(e.target.value);
    setPointAmount(Number(digits || 0));
  };

  const handleBlur = () => {
    setEditing(false);
    setPointAmount(snapStep(Number(state.pointAmount || 0)));
  };

  const handleFocus = () => setEditing(true);

  const handleAllConvert = () => {
    const max = Number(stats?.points ?? 0);
    setEditing(false);
    setPointAmount(max <= 0 ? 0 : max);
  };

  const pointsNum = Number(state.pointAmount || 0);
  const displayValue = editing || pointsNum > 0 ? String(pointsNum) : "";

  const handleConvert = () => {
    if (!derived.canSubmit) {
      alert(derived.reasons?.[0] || "입력 값을 확인해주세요");
      return;
    }
    alert(`${toComma(String(pointsNum))}P 전환 진행하겠습니다`);
  };

  return (
    <ConvertPointSectionWrapper>
      <RateText>전환 비율: 1P = {derived.rules.pointToWon}원</RateText>
      <LabelRow>
        <Label>포인트 전환</Label>
        <ConvertedText>
          1,000P = {(1000 * derived.rules.pointToWon).toLocaleString()}원
        </ConvertedText>
      </LabelRow>
      <InputRow>
        <InputWrap>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={`1000P 단위 / 최소 ${derived.rules.minPointConvert}P`}
            onKeyDown={(e) => e.key === "Enter" && handleConvert()}
          />
          <Icon src={pPointBlack} alt="" />
        </InputWrap>
        <AllButton type="button" onClick={handleAllConvert}>
          전부 전환
        </AllButton>
      </InputRow>
    </ConvertPointSectionWrapper>
  );
}

const ConvertPointSectionWrapper = styled.div`
  width: 100%;
  max-width: 390px;
  border-radius: 12px;
  padding: 0;
  margin-bottom: 30px;
`;

const RateText = styled.p`
  display: flex;
  justify-content: flex-end;
  color: #8b98a6;
  font-family: Pretendard;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  margin: 0 11px 28px 0;
`;

const LabelRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const Label = styled.span`
  color: #000;
  font-family: Pretendard;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
`;

const ConvertedText = styled.span`
  color: #58d748;
  font-family: Pretendard;
  font-size: 12px;
  font-weight: 400;
  line-height: 24px;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 10px;
  width: 100%;
  padding-bottom: 17px;
`;

const InputWrap = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  z-index: 1;
`;

const Input = styled.input`
  width: 100%;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 0 36px 0 12px;
  font-family: Pretendard;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  outline: none;
  color: #1a1a1a;
  box-sizing: border-box;

  &::placeholder {
    font-size: 14px;
  }
`;

const Icon = styled.img`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 13.836px;
  height: 13.836px;
  pointer-events: none;
`;

const AllButton = styled.button`
  width: 72px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 5px;
  background-color: #1a1a1a;
  color: #fff;
  font-family: Pretendard;
  font-size: 13px;
  font-weight: 400;
  line-height: 24px;
  text-align: center;
  cursor: pointer;

  &:hover {
    background-color: #373737;
  }
`;

import styled from "styled-components";
import { useConvertPoints } from "./convert/ConvertPointsContext";
import { useState } from "react";
import FirstModal from "./modal/FirstModal";

export default function ConvertButtonSection() {
  const { stats, state, derived } = useConvertPoints();
  const [isOpen, setIsOpen] = useState(false);

  const pointsNum = Number(state.pointAmount || 0);
  const wonAmount = pointsNum * (derived.rules?.pointToWon || 0);

  const { minPointConvert, pointStep } = derived.rules || {};
  const maxPoints = Number(stats?.points || 0);

  const canSubmit =
    pointsNum > 0 &&
    pointsNum >= (minPointConvert || 0) &&
    pointsNum % (pointStep || 1) === 0 &&
    pointsNum <= maxPoints;

  const handleClick = () => {
    if (!pointsNum) return alert("전환 포인트를 입력해주세요");
    if (pointsNum < minPointConvert)
      return alert(`${minPointConvert.toLocaleString()}P 이상부터 전환할 수 있습니다`);
    if (pointsNum % pointStep !== 0) return alert(`${pointStep}P 단위로 입력해주세요`);
    if (pointsNum > maxPoints)
      return alert(`보유 포인트(${maxPoints.toLocaleString()}P)보다 많이 전환할 수 없습니다`);

    setIsOpen(true);
  };

  return (
    <ConvertButtonSectionWrapper>
      <ConvertButton
        type="button"
        onClick={handleClick}
        disabled={!canSubmit}
        aria-disabled={!canSubmit}
      >
        {wonAmount.toLocaleString()}원으로 전환하기
      </ConvertButton>
      {isOpen && <FirstModal onClose={() => setIsOpen(false)} />}
    </ConvertButtonSectionWrapper>
  );
}

const ConvertButtonSectionWrapper = styled.div`
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  padding: 0 0 100px;
`;

const ConvertButton = styled.button`
  width: 100%;
  height: 56px;
  border: none;
  border-radius: 10px;
  background: #58d748;
  color: #fff;
  font-family: Pretendard;
  font-size: 14.152px;
  font-weight: 700;
  line-height: 21.227px;
  text-align: center;
  cursor: pointer;

  &:hover {
    background: #46b93a;
  }

  &:disabled {
    background: #cfd8dc;
    cursor: not-allowed;
  }
`;

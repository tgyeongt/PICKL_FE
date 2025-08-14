import styled from "styled-components";
import { useConvertPoints } from "./convert/ConvertPointsContext";

export default function ConvertButtonSection({ onRequestConvert }) {
  const { derived, converting, state } = useConvertPoints();
  const wonAmount = derived.wonAmount || 0;

  const handleClick = () => {
    if (!derived.canSubmit) {
      alert(derived.reasons?.[0] || "입력 값을 확인해주세요");
      return;
    }
    onRequestConvert?.({
      points: Number(state.pointAmount || 0),
      won: Number(derived.wonAmount || 0),
    });
  };

  return (
    <ConvertButtonSectionWrapper>
      <ConvertButton
        type="button"
        onClick={handleClick}
        disabled={!derived.canSubmit || converting}
        aria-disabled={!derived.canSubmit || converting}
      >
        {converting ? "전환 중" : `${wonAmount.toLocaleString()}원으로 전환하기`}
      </ConvertButton>
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

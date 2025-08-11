import styled from "styled-components";
import leftArrow from "@icon/home/arrow_left_solid.svg";
import rightArrow from "@icon/home/arrow_right_solid.svg";
import rightArrowLight from "@icon/home/arrow_right_solid_light.svg"; // 미래 달용 아이콘

export default function MonthNavigator({ currentMonth, onPrev, onNext }) {
  const todayMonth = new Date().getMonth() + 1;

  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

  const isNextFuture = nextMonth > todayMonth;

  return (
    <NavWrapper>
      <NavButton onClick={onPrev}>
        <img src={leftArrow} alt="이전 달" />
        <span>{prevMonth}월</span>
      </NavButton>

      <CurrentMonth>{currentMonth}월</CurrentMonth>

      <NavButton
        onClick={!isNextFuture ? onNext : undefined}
        $isFuture={isNextFuture}
        disabled={isNextFuture}
      >
        <span>{nextMonth}월</span>
        <img src={isNextFuture ? rightArrowLight : rightArrow} alt="다음 달" />
      </NavButton>
    </NavWrapper>
  );
}

const NavWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 70px;
  padding: 20px 0 30px 0;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  color: ${({ $isFuture }) => ($isFuture ? "#D2D2D6" : "#ADADAF")};

  img {
    width: 20px;
    height: 20px;
  }
`;

const CurrentMonth = styled.span`
  font-size: 32px;
  font-weight: 700;
`;

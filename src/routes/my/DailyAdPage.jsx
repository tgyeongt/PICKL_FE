import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import DailyAdImg from "@icon/my/Advertisement.svg";
import { APIService } from "../../shared/lib/api";
import { testLoginIfNeeded } from "../../shared/lib/auth";

export default function DailyAdPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const returnTo = state?.returnTo || "/my/points-daily";
  const DURATION = 5;
  const [left, setLeft] = useState(DURATION);
  const [canClose, setCanClose] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timerRef.current);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (left === 0) setCanClose(true);
  }, [left]);

  const handleClose = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await testLoginIfNeeded();
      const res = await APIService.private.post("/quiz/attempts/extra");
      const box = res && res.data !== undefined ? res.data : res;
      const remaining = box?.remaining ?? null;
      console.log("[attempts/extra] ok, remaining =", remaining, "raw =", box);

      const adNonce = crypto.randomUUID();
      navigate(returnTo, { replace: true, state: { adWatched: true, adNonce } });
    } catch (error) {
      console.error("추가 시도 요청 실패:", error);
      alert("추가 시도권을 발급받지 못했어. 잠시 후 다시 시도해줘!");
      // 실패 시 현재 화면에 그대로 머묾
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DailyAdPageWrapper>
      <TimeBox>
        {!canClose ? (
          <Circle aria-live="polite" aria-atomic="true">
            {left}
          </Circle>
        ) : (
          <CloseBtn onClick={handleClose} aria-label="닫기" disabled={isLoading}>
            {isLoading ? "처리중..." : "닫기 ×"}
          </CloseBtn>
        )}
      </TimeBox>
      <AdBox>
        <AdImg src={DailyAdImg} alt="" />
      </AdBox>
    </DailyAdPageWrapper>
  );
}

const DailyAdPageWrapper = styled.div`
  position: relative;
  min-height: 100dvh;
  width: 100%;
  overflow: hidden;
  background-image: url(${DailyAdImg});
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
`;

const TimeBox = styled.div`
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 12px);
  right: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Circle = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-weight: 800;
  font-size: 16px;
  display: grid;
  place-items: center;
  user-select: none;
`;

const CloseBtn = styled.button`
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  border: 0;
  cursor: pointer;

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AdBox = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AdImg = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

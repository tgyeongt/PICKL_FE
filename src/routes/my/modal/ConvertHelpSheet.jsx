import { useEffect, useMemo, useRef, useState } from "react";
import useConvertHelpSheetStore from "../stores/useConvertHelpSheetStore";
import {
  Backdrop,
  Sheet,
  Grabber,
  Panel,
  Title,
  Scrollable,
  Section,
  H,
  P,
  Ul,
  Li,
  SubNote,
  Warn,
  ConfirmBar,
  Confirm,
} from "./ConvertHelpSheet.styles";

export default function ConvertHelpSheet({ open, onClose }) {
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const setOpenFlag = useConvertHelpSheetStore((s) => s.setOpen);

  const SNAP = useMemo(() => {
    const topSafe = 12;
    const full = topSafe;
    const peekHeight = Math.min(420, Math.round(vh * 0.55));
    const peek = vh - peekHeight;
    return { full, peek };
  }, [vh]);

  const [visible, setVisible] = useState(open);
  const [top, setTop] = useState(SNAP.peek);
  const startYRef = useRef(0);
  const startTopRef = useRef(0);
  const draggingRef = useRef(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (open) {
      setOpenFlag(true);
      setVisible(true);
      requestAnimationFrame(() => setTop(SNAP.peek));
      document.body.style.overflow = "hidden";
    } else {
      setOpenFlag(false);
      setTop(vh);
      const t = setTimeout(() => setVisible(false), 220);
      document.body.style.overflow = "";
      return () => clearTimeout(t);
    }
  }, [open, SNAP.peek, vh, setOpenFlag]);

  const onStart = (y) => {
    draggingRef.current = true;
    startYRef.current = y;
    startTopRef.current = top;
  };

  const onMove = (y) => {
    if (!draggingRef.current) return;

    const sc = contentRef.current;
    const dy = y - startYRef.current;

    if (dy < 0 && sc && sc.scrollTop > 0) return;

    if (dy > 0 && sc && sc.scrollTop > 0) {
      sc.scrollTop = 0;
      return;
    }

    const nextTop = Math.min(Math.max(startTopRef.current + dy, SNAP.full), vh);
    setTop(nextTop);
  };

  const onEnd = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    const mid = (SNAP.peek + SNAP.full) / 2;
    if (top <= mid) setTop(SNAP.full);
    else if (top < vh - 80) setTop(SNAP.peek);
    else handleClose();
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleClose = () => {
    setTop(vh);
    setTimeout(() => onClose?.(), 200);
  };

  if (!visible) return null;

  return (
    <Backdrop onMouseDown={handleBackdrop} onTouchStart={handleBackdrop}>
      <Sheet
        style={{ top, "--sheet-top": `${top}px` }}
        onMouseDown={(e) => onStart(e.clientY)}
        onMouseMove={(e) => onMove(e.clientY)}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchStart={(e) => onStart(e.touches[0].clientY)}
        onTouchMove={(e) => onMove(e.touches[0].clientY)}
        onTouchEnd={onEnd}
        role="dialog"
        aria-modal="true"
        aria-labelledby="convert-help-title"
      >
        <Grabber aria-hidden="true" />
        <Panel>
          <Title id="convert-help-title">포인트 전환하기 안내</Title>

          <Scrollable ref={contentRef}>
            <Section>
              <H>1. 전환 비율</H>
              <Ul>
                <Li>
                  <strong>10,000P = 10,000원</strong>
                </Li>
                <Li>
                  전환 가능 단위: <strong>10,000P 이상, 10,000P 단위</strong>
                </Li>
              </Ul>
            </Section>

            <Section>
              <H>2. 전환 가능 상품권</H>
              <P>서울사랑상품권, 지역사랑상품권 중 선택 가능</P>
              <Ul>
                <Li>
                  현재 위치를 기준으로 <strong>해당 지역의 상품권이 자동 표시됨</strong>
                </Li>
              </Ul>
              <SubNote>예시</SubNote>
              <Ul>
                <Li>서울시 성북구에서 접속 시 → 성북사랑상품권 자동 표시</Li>
                <Li>서울시 종로구에서 접속 시 → 종로사랑상품권 자동 표시</Li>
              </Ul>
              <Warn>상품권 종류에 따라 사용처가 다르니 전환 전 확인하세요.</Warn>
            </Section>

            <Section>
              <H>3. 전환 처리</H>
              <Ul>
                <Li>신청 후 즉시 발급</Li>
              </Ul>
            </Section>

            <Section>
              <H>4. 유의사항</H>
              <Ul>
                <Li>전환된 포인트는 취소/환불 불가</Li>
                <Li>상품권 사용 기준과 조건은 발급사(서울페이) 정책을 따릅니다.</Li>
                <Li>
                  <em>⚠ 현재 버전은 데모/시연용으로, 실제 전환은 이루어지지 않습니다.</em>
                </Li>
                <Li>전환 정책과 UI는 실제 서비스 구현 시 변경될 수 있습니다.</Li>
              </Ul>
            </Section>
          </Scrollable>

          <ConfirmBar>
            <Confirm type="button" onClick={handleClose}>
              확인
            </Confirm>
          </ConfirmBar>
        </Panel>
      </Sheet>
    </Backdrop>
  );
}

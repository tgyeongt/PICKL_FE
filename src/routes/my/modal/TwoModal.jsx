import TwoModalBar from "./TwoModalBar";
import { TwoModalContainer } from "./TwoModalBar.styles";
import { useEffect, useRef } from "react";

export default function TwoModal({ onClose, snapshot }) {
  const firedRef = useRef(false);
  useEffect(() => {
    const t = setTimeout(() => {
      if (firedRef.current) return;
      firedRef.current = true;
      onClose?.();
    }, 1200);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <TwoModalBar>
      <TwoModalBar.Overlay onClose={onClose}>
        <TwoModalContainer>
          <TwoModalBar.IconSection />
          <TwoModalBar.TextSection snapshot={snapshot} />
        </TwoModalContainer>
      </TwoModalBar.Overlay>
    </TwoModalBar>
  );
}

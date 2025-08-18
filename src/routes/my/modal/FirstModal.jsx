import FirstModalBar from "./FirstModalBar";
import { FirstModalContainer } from "./FirstModalBar.styles";

export default function FirstModal({ onClose, onNext }) {
  return (
    <FirstModalBar>
      <FirstModalBar.Overlay onClose={onClose}>
        <FirstModalContainer onClick={(e) => e.stopPropagation()}>
          <FirstModalBar.IconSection />
          <FirstModalBar.TextSection />
          <FirstModalBar.ButtonSection onClose={onClose} onNext={onNext} />
        </FirstModalContainer>
      </FirstModalBar.Overlay>
    </FirstModalBar>
  );
}

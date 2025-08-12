import FirstModalBar from "./FirstModalBar";
import { FirstModalContainer } from "./FirstModalBar.styles";

export default function FirstModal({ onClose }) {
  return (
    <FirstModalBar>
      <FirstModalBar.Overlay onClose={onClose}>
        <FirstModalContainer>
          <FirstModalBar.IconSection />
          <FirstModalBar.TextSection />
          <FirstModalBar.ButtonSection />
        </FirstModalContainer>
      </FirstModalBar.Overlay>
    </FirstModalBar>
  );
}

import TwoModalBar from "./TwoModalBar";
import { TwoModalContainer } from "./TwoModalBar.styles";

export default function TwoModal({ onClose }) {
  return (
    <TwoModalBar>
      <TwoModalBar.Overlay onClose={onClose}>
        <TwoModalContainer>
          <TwoModalBar.IconSection />
          <TwoModalBar.TextSection />
        </TwoModalContainer>
      </TwoModalBar.Overlay>
    </TwoModalBar>
  );
}

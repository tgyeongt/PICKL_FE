import SetModalBar from "./SetModalBar";
import { SetModalContainer } from "./SetModalBar.styles";

export default function SetModal({ onClose }) {
  return (
    <SetModalBar>
      <SetModalBar.Overlay onClose={onClose}>
        <SetModalContainer>
          <SetModalBar.IconSection />
          <SetModalBar.NoteSection />
        </SetModalContainer>
      </SetModalBar.Overlay>
    </SetModalBar>
  );
}

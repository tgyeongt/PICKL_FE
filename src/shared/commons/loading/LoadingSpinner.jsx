import { motion } from "framer-motion";
import styled from "styled-components";

export default function LoadingSpinner() {
  return (
    <SpinnerWrapper>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{
          border: "3px solid #f3f3f3",
          borderTop: "3px solid #1C1B1A",
          borderRadius: "50%",
          width: "48px",
          height: "48px",
        }}
      />
    </SpinnerWrapper>
  );
}

const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 120px 0;
`;

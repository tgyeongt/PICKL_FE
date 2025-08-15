import styled, { keyframes } from "styled-components";
import useLoadingStore from "../../stores/useLoadingStore";

export default function Loading() {
  const { isLoading, loadingText } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <LoadingWrapper>
      <Spinner />
      <LoadingText>{loadingText}</LoadingText>
    </LoadingWrapper>
  );
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 20px;
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: #333;
  font-weight: 500;
`; 
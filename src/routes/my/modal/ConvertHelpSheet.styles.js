import styled from "styled-components";

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(18, 18, 18, 0.45);
  z-index: 999;
`;

export const Sheet = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 420px;
  border-radius: 18px 18px 0 0;
  background: #fff;
  transition: top 0.2s ease;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.16);
  touch-action: none;
  height: calc(100dvh - var(--sheet-top, 0px));
`;

export const Grabber = styled.div`
  width: 40px;
  height: 5px;
  border-radius: 100px;
  background: #d9d9de;
  margin: 8px auto 6px;
`;

export const Panel = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px 14px 0;
`;

export const Title = styled.h2`
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.2px;
  margin: 4px 6px 8px;
`;

export const Scrollable = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 6px 6px 0 6px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e1e1e6;
    border-radius: 4px;
  }
`;

export const Section = styled.section`
  margin: 10px 6px 12px;
`;

export const H = styled.p`
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 6px;
`;

export const P = styled.p`
  font-size: 13px;
  color: #444;
  line-height: 1.6;
  margin: 2px 0 6px;
`;

export const Ul = styled.ul`
  padding-left: 18px;
  margin: 4px 0 6px;
  li + li {
    margin-top: 4px;
  }
`;

export const Li = styled.li`
  font-size: 13px;
  color: #333;
  line-height: 1.6;
  strong {
    font-weight: 800;
  }
  em {
    font-style: normal;
    color: #555;
  }
`;

export const SubNote = styled.p`
  font-size: 12px;
  color: #7a7a7d;
  margin: 8px 0 4px 2px;
`;

export const Warn = styled.p`
  font-size: 12px;
  color: #6a6a6f;
  margin-top: 6px;
`;

export const ConfirmBar = styled.div`
  padding: 12px 0 calc(env(safe-area-inset-bottom, 0px) + 12px);
  background: #fff;
  border-top: 1px solid #eceff1;
  box-shadow: 0 -6px 12px rgba(0, 0, 0, 0.04);
`;

export const Confirm = styled.button`
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 10px;
  background: #3a3a3e;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  text-align: center;
  cursor: pointer;
`;

import { useEffect } from "react";
import useToastStore from "../../stores/useToastStore";
import { useNavigate } from "react-router";
import styled from "styled-components";
import check from "@icon/common/check.svg";
import { motion, AnimatePresence } from "framer-motion";

export default function Toast() {
  const { isOpen, message, type, url, hideToast } = useToastStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        hideToast();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hideToast]);

  return (
    <AnimatePresence>
      {isOpen && (
        <ToastBox
          as={motion.div}
          $type={type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
          style={{ x: "-50%" }}
        >
          <motion.img
            src={check}
            alt="체크"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          />
          {message}
          {url && (
            <button className="btn" onClick={() => navigate(url)}>
              이동하기
            </button>
          )}
        </ToastBox>
      )}
    </AnimatePresence>
  );
}

const ToastBox = styled.div`
  position: fixed;
  bottom: 80px;
  left: 50%;
  background: ${(props) => (props.$type === "success" ? "#9A9AA4" : "#f44336")};
  color: white;
  padding: 12px 20px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 400;
  z-index: 1000;
  display: flex;
  align-items: center;
  width: auto;
  min-width: 310px;

  img {
    margin-right: 10px;
    width: 20px;
    height: 20px;
  }

  .btn {
    background-color: #5a5b6a;
    color: white;
    padding: 5px 8px;
    font-size: 14px;
    border-radius: 10px;
    margin-left: 8px;
  }
`;

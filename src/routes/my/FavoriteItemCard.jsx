import styled from "styled-components";
import heartOn from "@icon/common/heart_on.svg";
import heartOff from "@icon/common/heart_off.svg";
import { useLocation } from "react-router-dom";
import { forwardRef } from "react";

function FavoriteItemCardBase(
  { img, title, description, liked = true, onClick, onClickHeart },
  ref
) {
  const { pathname } = useLocation();
  const hideDesc = pathname === "/my/list-recipes";

  const handleHeart = (e) => {
    e.stopPropagation();
    onClickHeart?.();
  };

  return (
    <CardWrapper ref={ref} role="button" onClick={onClick}>
      <ThumbWrapper>
        <Thumb src={img} alt={title} />
        <RightTopIcon src={liked ? heartOn : heartOff} alt="heart" onClick={handleHeart} />
      </ThumbWrapper>
      <TextBox>
        <Title>{title}</Title>
        {!hideDesc && (
          <>
            <Divider />
            <Desc>{description}</Desc>
          </>
        )}
      </TextBox>
    </CardWrapper>
  );
}

export default forwardRef(FavoriteItemCardBase);

const CardWrapper = styled.div`
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  cursor: pointer;
`;
const ThumbWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 150px;
  overflow: hidden;
`;
const Thumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;
const RightTopIcon = styled.img`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 18px;
  height: 18px;
`;
const TextBox = styled.div`
  padding: 12px 16px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Title = styled.p`
  color: #1a1a1a;
  text-align: center;
  font-family: Pretendard;
  font-size: 18.6px;
  font-weight: 700;
`;
const Divider = styled.div`
  width: 58px;
  height: 1px;
  background: #e1e1e3;
  margin: 6px 0;
`;
const Desc = styled.p`
  color: #787885;
  text-align: center;
  font-family: Pretendard;
  font-size: 7.75px;
  font-weight: 400;
  line-height: 10.85px;
`;

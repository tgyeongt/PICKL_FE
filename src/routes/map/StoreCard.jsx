import styled from "styled-components";

export default function StoreCard({ store }) {
  if (!store) return null;

  return (
    <CardWrapper>
      <Image src={store.imageUrl || "https://via.placeholder.com/100"} alt="상점 사진" />
      <Info>
        <Name>{store.name}</Name>
        <Address>{store.address || "서울시 성북구"}</Address>
        <Distance>431m • 도보 6분</Distance>
      </Info>
    </CardWrapper>
  );
}

const CardWrapper = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  max-width: 768px;
  background-color: white;
  padding: 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 12px;
  align-items: center;
  z-index: 200;
`;

const Image = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Name = styled.h3`
  font-size: 16px;
  font-weight: bold;
`;

const Address = styled.p`
  font-size: 14px;
  color: #555;
`;

const Distance = styled.p`
  font-size: 13px;
  color: #999;
`;

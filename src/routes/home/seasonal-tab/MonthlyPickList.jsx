import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function MonthlyPickList({ items, isLoading }) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <ListWrapper>
        {Array(4)
          .fill(0)
          .map((_, index) => (
            <PickCard key={index}>
              <Skeleton height={130} borderRadius="15px 15px 0 0" />
              <TextBox>
                <Skeleton width={80} height={20} />
                <Line />
                <Skeleton width={120} height={14} />
              </TextBox>
            </PickCard>
          ))}
      </ListWrapper>
    );
  }

  return (
    <ListWrapper>
      {items.map((item) => (
        <PickCard key={item.id} onClick={() => navigate(`/seasonal/${item.id}`)}>
          <Image src={item.imageUrl} alt={item.itemname} />
          <TextBox>
            <Title>{item.itemname}</Title>
            <Line />
            <Desc>{item.shortDescription}</Desc>
          </TextBox>
        </PickCard>
      ))}
    </ListWrapper>
  );
}

const ListWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  padding: 0 20px;
`;

const PickCard = styled.div`
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  background-color: #fff;
`;

const Image = styled.img`
  width: 100%;
  height: 130px;
  object-fit: cover;
  border-radius: 15px 15px 0 0;
`;

const TextBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px 23px;
  align-items: center;
`;

const Title = styled.p`
  font-size: 20px;
  font-weight: 700;
`;

const Line = styled.div`
  width: 58px;
  height: 1px;
  background-color: #e1e1e3;
`;

const Desc = styled.p`
  font-size: 12px;
  font-weight: 400;
  line-height: 140%;
  color: #787885;
  margin-top: 5px;
`;

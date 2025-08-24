import { useNavigate } from "react-router-dom";
import styled from "styled-components";

export default function SeasonalCard({ id, title, img, description }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/seasonal/${id}`);
  };

  return (
    <Card onClick={handleClick}>
      <Image src={img} alt={title} />
      <TextBox>
        <Title>{title}</Title>
        <Line />
        <Desc>{description}</Desc>
      </TextBox>
    </Card>
  );
}

const Card = styled.div`
  flex-shrink: 0;
  width: 220px;
  height: 280px;
  border-radius: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  overflow: hidden;
  cursor: pointer;
`;

const Image = styled.img`
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
`;

const TextBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 15px 30px;
  align-items: center;
`;

const Title = styled.p`
  font-size: 24px;
  font-weight: 700;
  line-height: 140%;
`;

const Line = styled.div`
  width: 75px;
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

import { useNavigate } from "react-router";
import styled from "styled-components";

export default function ItemCard({ id, title, unit, img, price }) {
  const navigate = useNavigate();

  return (
    <Card onClick={() => navigate(`ingredients/${id}`)}>
      <ImgWrapper>
        <img className="img" src={img} alt={title} />
      </ImgWrapper>

      <TextBox>
        <div>
          <Title>{title}</Title>
          <Unit> / {unit}</Unit>
        </div>
        <Price>{Number(price).toLocaleString()}원</Price>
      </TextBox>
    </Card>
  );
}

const Card = styled.div`
  display: flex;
  background-color: white;
  height: 110px;
  margin-bottom: 15px;
`;

const ImgWrapper = styled.div`
  height: 100%;
  aspect-ratio: 1 / 1;
  flex-shrink: 0;

  .img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const TextBox = styled.div`
  padding: 15px 20px;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Title = styled.span`
  font-size: 24px;
  font-weight: 700;
`;

const Unit = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: #787885;
`;

const Price = styled.p`
  font-size: 32px;
  font-weight: 700;
  color: #ec5f5f;
  line-height: normal;
  margin: 0;
`;

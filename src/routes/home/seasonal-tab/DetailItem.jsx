import styled from "styled-components";

export default function DetailItem({ icon, title, content, isOpen, onToggle }) {
  return (
    <Item>
      <Header onClick={onToggle}>
        <IconBox>
          <img src={icon} alt="" />
        </IconBox>
        <span className="title">{title}</span>
        <span className="toggle">{isOpen ? "▲" : "▼"}</span>
      </Header>
      {isOpen && <Content>{content}</Content>}
    </Item>
  );
}

const Item = styled.div`
  background: #fff;
  border-radius: 10px;
  margin-bottom: 15px;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 12px 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .title {
    flex: 1;
    margin-left: 8px;
  }
  .toggle {
    margin-right: 3px;
    font-size: 12px;
  }
`;

const IconBox = styled.div`
  display: flex;
  align-items: center;
  font-size: 18px;
  color: #27801c;

  img {
    display: block;
    width: 18px;
    height: 18px;
  }
`;

const Content = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  color: #787885;
  background: #fff;
`;

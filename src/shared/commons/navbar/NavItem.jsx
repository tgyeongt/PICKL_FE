import styled from "styled-components";
import { useLocation, useNavigate } from "react-router";

export default function NavItem({ icon, activeIcon, to, label }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname === to;

  return (
    <ItemWrapper onClick={() => navigate(to)}>
      <Icon src={isActive ? activeIcon : icon} alt={`${label} icon`} />
      <Label isActive={isActive}>{label}</Label>
    </ItemWrapper>
  );
}

const ItemWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 0;
  cursor: pointer;
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
`;

const Label = styled.span`
  font-size: 11px;
  margin-top: 4px;
  color: ${({ isActive }) => (isActive ? "#58D748" : "#ADADAF")};
  font-weight: 400;
`;

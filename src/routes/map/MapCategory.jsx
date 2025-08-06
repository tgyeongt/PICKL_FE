import { APIService } from "../../shared/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import CategoryList from "./CategoryList";
import DropdownIcon from "@icon/map/dropdown.svg";

export default function MapCategory() {
  const navigate = useNavigate();

  const { data: addressData, isLoading } = useQuery({
    queryKey: ["userLocation"],
    queryFn: async () => {
      try {
        const res = await APIService.public.get("/user/location");
        return res.data ?? { address: "주소 없음" };
      } catch (err) {
        console.error("위치 요청 실패", err);
        return { address: "주소 없음" };
      }
    },
  });

  return (
    <MapCategoryWrapper>
      <LocationBox onClick={() => navigate("/map/edit-location")}>
        {isLoading ? (
          <AddressText>위치 불러오는 중</AddressText>
        ) : (
          <AddressTextWrapper>
            <AddressText>{addressData?.address ?? "주소 없음"}</AddressText>
            <DropdownImg src={DropdownIcon} alt="드롭다운" />
          </AddressTextWrapper>
        )}
      </LocationBox>
      <CategoryList />
    </MapCategoryWrapper>
  );
}

const MapCategoryWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 151px;
  padding-left: 16px;
  padding-top: 16px;
`;

const LocationBox = styled.div`
  margin-bottom: 29px;
  cursor: pointer;
`;

const AddressTextWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const AddressText = styled.span`
  color: #000;
  font-family: Pretendard;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px;
`;

const DropdownImg = styled.img`
  width: 8px;
  height: 7px;
`;

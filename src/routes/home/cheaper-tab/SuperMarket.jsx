import CheaperCard from "./CheaperCard";

export default function SuperMarket({ selected }) {
  const dummyData = [
    {
      name: "포도(샤인머스캣)",
      weight: "2kg",
      marketPrice: "36,037 원",
      martPrice: "27,164 원",
    },
    {
      name: "사과(부사)",
      weight: "5개",
      marketPrice: "10,200 원",
      martPrice: "8,500 원",
    },
    {
      name: "감자(수미)",
      weight: "1kg",
      marketPrice: "4,500 원",
      martPrice: "3,200 원",
    },
    {
      name: "대파",
      weight: "300g",
      marketPrice: "1,800 원",
      martPrice: "1,200 원",
    },
  ];

  return (
    <>
      {dummyData.map((item, idx) => (
        <CheaperCard key={idx} selected={selected} {...item} />
      ))}
    </>
  );
}

import { useState, useEffect } from "react";
import StartPage from "./StartPage";
import HomePage from "./HomePage";

export default function RootPage() {
  const [hasToken, setHasToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setHasToken(!!token);
  }, []);

  const handleTokenSet = () => {
    setHasToken(true);
  };

  if (hasToken === null) {
    return <div>Loading...</div>;
  }

  return hasToken ? <HomePage /> : <StartPage onTokenSet={handleTokenSet} />;
}

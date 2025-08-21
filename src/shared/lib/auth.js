import { APIService } from "./api";

export function isJwtExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? Date.now() > payload.exp * 1000 : true;
  } catch {
    return true;
  }
}

/**
 * 백엔드의 /auths/test-login으로 액세스/리프레시 토큰 확보
 * - 이미 accessToken이 있고, 만료되지 않았으면 그대로 사용
 * - 없거나 만료되었으면 test-login 호출
 * - VITE_SERVER_BASE_URL이 https://picklocal.site/api 인 경우, 경로는 '/auths/test-login' 사용
 */
export async function testLoginIfNeeded() {
  const existing = localStorage.getItem("accessToken");
  if (existing && !isJwtExpired(existing)) return;

  const res = await APIService.public.post("/auths/test-login");
  const box = res?.data ?? res;
  const tokens = box?.data ?? box;
  const { accessToken, refreshToken } = tokens || {};

  if (!accessToken) {
    throw new Error("test-login 실패: accessToken 없음");
  }

  localStorage.setItem("accessToken", accessToken);
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
}

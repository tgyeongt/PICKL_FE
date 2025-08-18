import { APIService } from "./api";

/** URL-safe base64 디코더 (패딩/치환 보정) */
function base64UrlDecode(str = "") {
  try {
    const pad = "=".repeat((4 - (str.length % 4)) % 4);
    const b64 = (str + pad).replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(b64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return json;
  } catch {
    return "";
  }
}

function parseJwt(token) {
  try {
    const parts = String(token).split(".");
    if (parts.length < 2) return null;
    const payloadJson = base64UrlDecode(parts[1]);
    return payloadJson ? JSON.parse(payloadJson) : null;
  } catch {
    return null;
  }
}

/** 시계 오차 대비 여유(sec) */
const LEEWAY_SEC = 30;

export function isJwtExpired(token) {
  const payload = parseJwt(token);
  if (!payload) return true;
  const expSec = Number(payload.exp);
  if (!Number.isFinite(expSec)) return true;
  const nowSec = Math.floor(Date.now() / 1000);
  // exp <= now + leeway 이면 만료로 간주
  return expSec <= nowSec + LEEWAY_SEC;
}

/** 중복 요청 방지용 in-flight promise */
let inFlightTestLogin = null;

/**
 * /auths/test-login으로 액세스/리프레시 토큰 확보
 * - 이미 accessToken 있고 유효하면 그대로 리턴
 * - 없거나 만료면 test-login 1회만 호출(동시요청 병합)
 * - 성공 시 localStorage 저장, 실패 시 저장된 토큰 삭제
 */
export async function testLoginIfNeeded() {
  try {
    const existing = localStorage.getItem("accessToken");
    if (existing && !isJwtExpired(existing)) return existing;

    // 이미 다른 곳에서 호출 중이면 그거 기다림
    if (inFlightTestLogin) return await inFlightTestLogin;

    inFlightTestLogin = APIService.public
      .post("/auths/test-login")
      .then((res) => {
        // APIService.public.post는 response.data를 반환함
        const box = res?.data ?? res ?? {};
        const tokens = box?.data ?? box ?? {};
        const accessToken = tokens.accessToken || tokens.token || "";
        const refreshToken = tokens.refreshToken || "";

        if (!accessToken) {
          throw new Error("test-login 실패: accessToken 없음");
        }

        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

        return accessToken;
      })
      .catch((err) => {
        // 실패하면 저장된 토큰 정리(루프/오염 방지)
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        throw err;
      })
      .finally(() => {
        inFlightTestLogin = null;
      });

    return await inFlightTestLogin;
  } catch (e) {
    // 마지막 안전장치: 파싱 단계에서 오류 등
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    throw e;
  }
}

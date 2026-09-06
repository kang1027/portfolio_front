/**
 * 빌드 시점에 주입되는 환경변수를 읽는다.
 *
 * `.env` 파일로 넘길 때는 Vite 가 감싼 따옴표를 벗겨 주지만,
 * Docker 의 build-arg → ENV 경로로 넘기면 따옴표가 값의 일부로 남는다.
 * 그러면 `"https://api.example.com"` 같은 값이 그대로 코드에 들어와
 * startsWith("https://") 나 URL 파싱이 조용히 어긋난다.
 *
 * 어느 경로로 들어오든 같은 값이 되도록 여기서 한 번 정리한다.
 */
export const readEnv = (value: unknown, fallback = ""): string => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim().replace(/^(['"])(.*)\1$/s, "$2");
  return trimmed || fallback;
};

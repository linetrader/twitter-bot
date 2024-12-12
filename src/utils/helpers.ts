export async function retryWithRateLimit<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3 // 최대 재시도 횟수 설정
): Promise<T> {
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      // Rate Limit 오류 처리
      if (error.code === 429) {
        const rateLimit = error.rateLimit || {};
        const resetTime = rateLimit.reset || Math.floor(Date.now() / 1000) + 15;
        const waitTime = Math.max(resetTime * 1000 - Date.now(), 1000); // 최소 1초 대기

        // 최대 대기 시간 제한 (예: 15분 = 900초)
        const maxWaitTime = 1 * 60 * 1000;
        const boundedWaitTime = Math.min(waitTime, maxWaitTime);

        console.log(
          `Rate limit 초과. ${Math.ceil(
            boundedWaitTime / 1000
          )}초 후 재시도합니다...`
        );
        console.log("Rate Limit Info:", rateLimit);

        await delay(boundedWaitTime);
        retryCount++;
      } else {
        console.error("재시도 실패. 예기치 않은 오류:", error);
        throw error; // 다른 오류는 호출자로 전달
      }
    }
  }

  throw new Error(
    `Rate limit 초과로 최대 재시도 횟수 (${maxRetries})를 초과했습니다.`
  );
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryWithRateLimit<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3 // 최대 재시도 횟수 설정
): Promise<T | null> {
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      return await fn(); // 요청 성공 시 결과 반환
    } catch (error: any) {
      // Rate Limit 오류 처리
      if (error.code === 429) {
        const rateLimit = error.rateLimit || {};
        const remaining = rateLimit.remaining || 0;

        // 남은 호출 가능 횟수가 0이거나 최대 재시도 횟수에 도달한 경우 루프 탈출
        if (remaining === 0 || retryCount >= maxRetries - 1) {
          console.warn(
            `Rate limit 초과로 재시도를 중단합니다. 남은 호출 가능 횟수: ${remaining}, 시도 횟수: ${
              retryCount + 1
            }`
          );
          return null; // null 반환하여 종료
        }

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

  // 최대 재시도에 도달했지만 다른 이유로 종료된 경우 null 반환
  console.warn(
    `최대 재시도 횟수 (${maxRetries})에 도달했지만 요청이 성공하지 않았습니다.`
  );
  return null;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

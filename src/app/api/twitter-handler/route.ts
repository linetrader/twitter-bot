import {
  getCommentsFromSheet,
  getTwitterCredentialsFromSheet,
} from "@/utils/googleAuthUtil";
import { retryWithRateLimit, delay } from "@/utils/helpers";
import { NextResponse } from "next/server";
const { TwitterApi, ApiResponseError } = require("twitter-api-v2");

export const POST = async (req: Request) => {
  const { targetTweetId, action } = await req.json();

  if (!targetTweetId || !action) {
    return NextResponse.json(
      { error: "targetTweetId와 action을 제공해야 합니다." },
      { status: 400 }
    );
  }

  const validActions = ["like", "reply", "retweet", "view"];
  if (!validActions.includes(action)) {
    return NextResponse.json(
      { error: `올바르지 않은 action 값입니다. (${validActions.join(", ")})` },
      { status: 400 }
    );
  }

  try {
    const comments = await getCommentsFromSheet();
    let credentialsList = await getTwitterCredentialsFromSheet();

    // 유저 순서를 랜덤으로 섞기
    credentialsList = credentialsList.sort(() => Math.random() - 0.5);

    for (const credentials of credentialsList) {
      if (
        !credentials.appKey ||
        !credentials.appSecret ||
        !credentials.accessToken ||
        !credentials.accessSecret
      ) {
        console.error(`[${credentials.username}] 인증 정보가 누락되었습니다.`);
        continue;
      }

      const client = new TwitterApi({
        appKey: credentials.appKey,
        appSecret: credentials.appSecret,
        accessToken: credentials.accessToken,
        accessSecret: credentials.accessSecret,
      });

      try {
        // 좋아요 작업
        if (action === "like") {
          try {
            const like = await retryWithRateLimit(() =>
              client.v2.like(
                credentials.accessToken.split("-")[0],
                targetTweetId
              )
            );
            console.log(`[${credentials.username}] 좋아요 성공:`, like);
          } catch (likeError) {
            console.error(`[${credentials.username}] 좋아요 실패:`, likeError);
          }
        }

        // 댓글 작성 작업
        if (action === "reply") {
          try {
            const randomComment =
              comments[Math.floor(Math.random() * comments.length)];
            const reply = await retryWithRateLimit(() =>
              client.v2.reply(randomComment, targetTweetId)
            );
            console.log(`[${credentials.username}] 댓글 작성 성공:`, reply);
          } catch (replyError) {
            console.error(
              `[${credentials.username}] 댓글 작성 실패:`,
              replyError
            );
          }
        }

        // 리트윗 작업
        if (action === "retweet") {
          try {
            const retweet = await retryWithRateLimit(() =>
              client.v2.retweet(
                credentials.accessToken.split("-")[0],
                targetTweetId
              )
            );
            console.log(`[${credentials.username}] 리트윗 성공:`, retweet);
          } catch (retweetError) {
            console.error(
              `[${credentials.username}] 리트윗 실패:`,
              retweetError
            );
          }
        }

        // 뷰 증가 작업
        if (action === "view") {
          try {
            const singleTweet = await retryWithRateLimit(() =>
              client.v2.singleTweet(targetTweetId)
            );
            console.log(`[${credentials.username}] 뷰 증가 성공:`, singleTweet);
          } catch (viewError) {
            console.error(`[${credentials.username}] 뷰 증가 실패:`, viewError);
          }
        }

        // 작업 간 랜덤 딜레이 추가
        await delay(Math.random() * (5000 - 2000) + 2000); // 2초 ~ 5초 랜덤 대기

        console.log(`[${credentials.username}] 작업 완료.`);
      } catch (err: any) {
        if (err instanceof ApiResponseError) {
          console.error(
            `[${credentials.username}] 작업 실패:`,
            err.data || err.message
          );
        } else {
          console.error(`[${credentials.username}] 작업 실패:`, err.message);
        }
      }
    }

    return NextResponse.json({ message: `${action} 작업이 완료되었습니다.` });
  } catch (err) {
    console.error("작업 중 오류 발생:", err);
    return NextResponse.json({ error: "작업 실패" }, { status: 500 });
  }
};

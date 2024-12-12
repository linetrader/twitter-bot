import { getTwitterCredentialsFromSheet } from "@/utils/getTwitterCredentials";
import { getCommentsFromSheet } from "@/utils/getComments";
import { retryWithRateLimit, delay } from "@/utils/helpers";
import { NextResponse } from "next/server";
const { TwitterApi, ApiResponseError } = require("twitter-api-v2");

const tweetExists = async (
  client: InstanceType<typeof TwitterApi>,
  tweetId: string
): Promise<boolean> => {
  try {
    await client.v2.singleTweet(tweetId);
    return true;
  } catch (err: any) {
    if (err instanceof ApiResponseError) {
      const status = err.response?.status;
      if (status === 403) {
        console.error("트윗 접근 불가 (403 Forbidden).");
      } else if (status === 404) {
        console.error("트윗이 존재하지 않음 (404 Not Found).");
      }
    }
    return false;
  }
};

export const POST = async (req: Request) => {
  const { targetTweetId } = await req.json();

  if (!targetTweetId) {
    return NextResponse.json(
      { error: "targetTweetId가 제공되지 않았습니다." },
      { status: 400 }
    );
  }

  try {
    const credentialsList = await getTwitterCredentialsFromSheet();
    const comments = await getCommentsFromSheet();

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

      // const exists = await tweetExists(client, targetTweetId);
      // if (!exists) {
      //  console.error(
      //    `[${credentials.username}] 트윗이 삭제되었거나 접근할 수 없습니다.`
      //  );
      //  continue;
      // }

      const randomComment =
        comments[Math.floor(Math.random() * comments.length)];

      try {
        //        console.log(
        //          `[${credentials.username}] Sending reply to tweet: ${targetTweetId}`
        //        );

        // 좋아요 요청
        try {
          const like = await retryWithRateLimit(() =>
            client.v2.like(credentials.accessToken.split("-")[0], targetTweetId)
          );
          console.log(`[${credentials.username}] 좋아요 성공:`, like);
        } catch (likeError) {
          console.error(`[${credentials.username}] 좋아요 실패:`, likeError);
        }

        // 댓글 작성 요청
        try {
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

        await delay(2000);

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

    return NextResponse.json({ message: "모든 작업 완료." });
  } catch (err) {
    console.error("작업 중 오류 발생:", err);
    return NextResponse.json({ error: "작업 실패" }, { status: 500 });
  }
};

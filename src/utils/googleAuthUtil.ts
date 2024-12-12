import { google } from "googleapis";
import path from "path";
import fs from "fs";

export async function getGoogleSheetsClient() {
  // 서비스 계정 키 가져오기 (로컬 또는 Vercel)
  const isVercelEnvironment = !!process.env.VERCEL;
  let serviceAccountKey: string;

  if (isVercelEnvironment) {
    // Vercel 환경: 환경변수에서 읽어옴
    serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY || "";
    if (!serviceAccountKey) {
      throw new Error("환경 변수 SERVICE_ACCOUNT_KEY가 설정되지 않았습니다.");
    }
  } else {
    // 로컬 환경: service-account-key.json 파일에서 읽어옴
    const keyFilePath = path.join(process.cwd(), "service-account-key.json");
    if (!fs.existsSync(keyFilePath)) {
      throw new Error(
        `로컬 환경에서 service-account-key.json 파일이 존재하지 않습니다. (${keyFilePath})`
      );
    }
    serviceAccountKey = fs.readFileSync(keyFilePath, "utf8");
  }

  // Google Auth 클라이언트 설정
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(serviceAccountKey),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const client = await auth.getClient();
  return google.sheets({ version: "v4", auth: client as any });
}

import { google } from "googleapis";
import path from "path";
import fs from "fs";

type TwitterCredential = {
  username: string;
  appKey: string;
  appSecret: string;
  accessToken: string;
  accessSecret: string;
};

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

export async function getCommentsFromSheet(): Promise<string[]> {
  const sheets = await getGoogleSheetsClient();

  // Google Sheet ID와 Range 설정
  const spreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_COMMENT_ID;
  if (!spreadsheetId) {
    throw new Error(
      "환경 변수 NEXT_PUBLIC_GOOGLE_SHEET_COMMENT_ID가 설정되지 않았습니다."
    );
  }

  const range = "시트1!A1:A100";

  // Google Sheets API 호출
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  // 유효성 검사
  if (!response.data.values || response.data.values.length === 0) {
    console.warn("스프레드시트에서 데이터를 찾을 수 없습니다.");
    return []; // 빈 배열 반환
  }

  // 정상적인 데이터 처리
  return response.data.values.flat() as string[];
}

export async function getTwitterCredentialsFromSheet(): Promise<
  TwitterCredential[]
> {
  const sheets = await getGoogleSheetsClient();

  // Google Sheets ID 및 범위 설정
  const spreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_USERS_ID;
  if (!spreadsheetId) {
    throw new Error(
      "환경 변수 NEXT_PUBLIC_GOOGLE_SHEET_USERS_ID가 설정되지 않았습니다."
    );
  }

  const range = "시트1!A1:E10";

  // Google Sheets API 호출
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  // 유효성 검사
  if (!response.data.values || response.data.values.length === 0) {
    console.warn("스프레드시트에서 데이터를 찾을 수 없습니다.");
    return []; // 빈 배열 반환
  }

  // 데이터 매핑
  return response.data.values.map((row) => ({
    username: row[0] || "",
    appKey: row[1] || "",
    appSecret: row[2] || "",
    accessToken: row[3] || "",
    accessSecret: row[4] || "",
  })) as TwitterCredential[];
}

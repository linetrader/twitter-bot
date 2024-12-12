import { getGoogleSheetsClient } from "@/utils/googleAuthUtil";

type TwitterCredential = {
  username: string;
  appKey: string;
  appSecret: string;
  accessToken: string;
  accessSecret: string;
};

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

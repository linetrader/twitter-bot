import { getGoogleSheetsClient } from "@/utils/googleAuthUtil";

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

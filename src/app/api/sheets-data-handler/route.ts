import { google } from "googleapis";
import path from "path";
import { NextResponse } from "next/server";

// Google Sheets 클라이언트 생성
async function getSheetsClient() {
  const keyFilePath = path.join(
    process.cwd(),
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || "service-account-key.json"
  );

  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client as any });
  return sheets;
}

// GET 요청: 데이터 가져오기
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const spreadsheetId = searchParams.get("spreadsheetId");

    console.log("Received Spreadsheet ID:", spreadsheetId);

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "spreadsheetId를 제공해야 합니다." },
        { status: 400 }
      );
    }

    const sheets = await getSheetsClient();
    const range = "시트1!A1:D10";

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return NextResponse.json({ data: response.data.values });
  } catch (error: any) {
    console.error("Google Sheets API 오류:", error.message);
    return NextResponse.json(
      { error: "데이터를 가져오지 못했습니다.", details: error.message },
      { status: 500 }
    );
  }
}

// POST 요청: 새로운 행 추가
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Server Received Body:", body);

    const { spreadsheetId, values } = body;
    console.log("Server Spreadsheet ID:", spreadsheetId);
    console.log("Server Values:", values);

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "spreadsheetId를 제공해야 합니다." },
        { status: 400 }
      );
    }

    if (!values || !Array.isArray(values)) {
      return NextResponse.json(
        { error: "유효하지 않은 값입니다. 배열 형식으로 제공해야 합니다." },
        { status: 400 }
      );
    }

    const sheets = await getSheetsClient();

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "시트1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [values],
      },
    });

    return NextResponse.json({
      message: "새로운 행이 성공적으로 추가되었습니다.",
      response: response.data,
    });
  } catch (error: any) {
    console.error("Google Sheets API 오류:", error.message);
    return NextResponse.json(
      { error: "데이터를 추가하지 못했습니다.", details: error.message },
      { status: 500 }
    );
  }
}

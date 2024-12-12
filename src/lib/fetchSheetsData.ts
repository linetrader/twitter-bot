export async function fetchSheetsData(
  spreadsheetID: string,
  endpoint: string
): Promise<string[][]> {
  if (!spreadsheetID) {
    throw new Error("Spreadsheet ID가 설정되지 않았습니다.");
  }

  const response = await fetch(`${endpoint}?spreadsheetId=${spreadsheetID}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("데이터를 가져오는 데 실패했습니다.");
  }

  const result = await response.json();

  if (!result.data || !Array.isArray(result.data)) {
    throw new Error("유효하지 않은 데이터 형식입니다.");
  }

  return result.data;
}

export async function submitToSheets(
  spreadsheetId: string,
  values: string[]
): Promise<{ message: string }> {
  if (!spreadsheetId) {
    throw new Error("Spreadsheet ID가 설정되지 않았습니다.");
  }

  const response = await fetch("/api/sheets-data-handler", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ spreadsheetId, values }),
  });

  if (!response.ok) {
    throw new Error("Google Sheets API 호출에 실패했습니다.");
  }

  return response.json();
}

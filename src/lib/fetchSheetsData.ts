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

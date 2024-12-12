"use client";

import { useState } from "react";
import { fetchSheetsData } from "@/lib/fetchSheetsData";

export default function GetSheetComment() {
  const [data, setData] = useState<string[][] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const spreadsheetID =
    process.env.NEXT_PUBLIC_GOOGLE_SHEET_COMMENT_ID || "default-id";

  console.log(spreadsheetID);

  const handleFetchData = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await fetchSheetsData(
        spreadsheetID,
        "/api/sheets-data-handler"
      );
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 bg-white shadow rounded-md mt-6">
      <button
        onClick={handleFetchData}
        className="w-full py-3 text-white font-semibold bg-blue-500 rounded-md shadow-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 transition"
      >
        {loading ? "로딩 중..." : "데이터 가져오기"}
      </button>

      {error && (
        <p className="mt-4 text-red-600 font-medium text-center">{error}</p>
      )}

      {data && (
        <div className="overflow-x-auto mt-4">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                {data[0].map((header, index) => (
                  <th
                    key={index}
                    className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border border-gray-300 px-4 py-2 text-gray-600"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

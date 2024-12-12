"use client";

import { useState } from "react";

const spreadsheetID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_COMMENT_ID;

export default function SetSheetFormComment() {
  const [value, setValue] = useState<string>(""); // 단일 입력 필드 값
  const [status, setStatus] = useState<string | null>(null); // 성공 메시지
  const [error, setError] = useState<string | null>(null); // 에러 메시지
  const [loading, setLoading] = useState<boolean>(false); // 로딩 상태

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setError(null);
    setLoading(true);

    console.log("Client Spreadsheet ID:", spreadsheetID);
    console.log("Client Value:", value);

    try {
      const response = await fetch("/api/sheets-data-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ spreadsheetId: spreadsheetID, values: [value] }),
      });

      if (!response.ok) {
        throw new Error("데이터 추가에 실패했습니다.");
      }

      const result = await response.json();
      setStatus(result.message);
      setValue(""); // 입력 필드 초기화
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Google Sheets에 댓글 추가
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3">
          <label htmlFor="field" className="text-sm font-medium text-gray-700">
            댓글:
          </label>
          <input
            id="field"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 text-white font-semibold rounded-md shadow-md transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300"
          }`}
        >
          {loading ? "추가 중..." : "추가"}
        </button>
      </form>
      {status && (
        <p className="mt-4 text-green-600 font-medium text-center">{status}</p>
      )}
      {error && (
        <p className="mt-4 text-red-600 font-medium text-center">{error}</p>
      )}
    </div>
  );
}

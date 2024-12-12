"use client";

import { useState } from "react";

export default function TargetTweetForm() {
  const [targetTweetId, setTargetTweetId] = useState<string>(""); // 타겟 트윗 ID
  const [status, setStatus] = useState<string | null>(null); // 상태 메시지
  const [loading, setLoading] = useState<boolean>(false); // 로딩 상태

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const response = await fetch("/api/twitter-handler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetTweetId }),
      });

      if (!response.ok) {
        throw new Error("작업 중 오류가 발생했습니다.");
      }

      const result = await response.json();
      setStatus(result.message);
    } catch (err: any) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        타겟 트윗 ID 입력
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3">
          <label
            htmlFor="targetTweetId"
            className="text-sm font-medium text-gray-700"
          >
            트윗 ID:
          </label>
          <input
            id="targetTweetId"
            type="text"
            value={targetTweetId}
            onChange={(e) => setTargetTweetId(e.target.value)}
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
          {loading ? "작업 중..." : "실행"}
        </button>
      </form>
      {status && (
        <p className="mt-4 text-green-600 font-medium text-center">{status}</p>
      )}
    </div>
  );
}

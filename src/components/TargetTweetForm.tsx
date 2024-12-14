"use client";

import { useState, useRef } from "react";

// 공통 API 호출 함수
const performAction = async (
  targetTweetId: string,
  action: string
): Promise<string> => {
  const response = await fetch("/api/twitter-handler", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ targetTweetId, action }),
  });

  if (!response.ok) {
    throw new Error(`${action} 작업 중 오류가 발생했습니다.`);
  }

  const result = await response.json();
  return result.message;
};

export default function TargetTweetForm() {
  const [targetTweetId, setTargetTweetId] = useState<string>(""); // 타겟 트윗 ID
  const [action, setAction] = useState<string>("like"); // 작업 유형 (기본값: 좋아요)
  const [status, setStatus] = useState<string | null>(null); // 상태 메시지
  const [loading, setLoading] = useState<boolean>(false); // 로딩 상태
  const intervalRef = useRef<number | null>(null); // 작업 중단용 interval 참조

  // 작업 실행 함수
  const handleStart = async () => {
    setStatus(null);
    setLoading(true);

    // 작업 유형에 따른 처리
    if (action === "view") {
      // 뷰 작업은 반복 실행
      intervalRef.current = window.setInterval(async () => {
        try {
          const message = await performAction(targetTweetId, action);
          setStatus(message);
        } catch (err: any) {
          setStatus(err.message);
          stopWork(); // 오류 발생 시 작업 중단
        }
      }, Math.random() * (5000 - 2000) + 2000); // 2초 ~ 5초 랜덤 딜레이
      return;
    }

    // 좋아요, 댓글, 리트윗 작업은 한 번만 실행
    try {
      const message = await performAction(targetTweetId, action);
      setStatus(message);
      stopWork(); // 작업 완료 후 정지
    } catch (err: any) {
      setStatus(err.message);
      stopWork(); // 오류 발생 시 작업 중단
    }
  };

  // 작업 정지 함수
  const stopWork = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoading(false);
    setStatus("작업이 중지되었습니다.");
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        트윗 작업 실행
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleStart();
        }}
        className="space-y-4"
      >
        {/* 트윗 ID 입력 */}
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

        {/* 작업 선택 */}
        <div className="flex items-center gap-3">
          <label htmlFor="action" className="text-sm font-medium text-gray-700">
            작업 유형:
          </label>
          <select
            id="action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="like">좋아요</option>
            <option value="reply">댓글</option>
            <option value="retweet">리트윗</option>
            <option value="view">뷰 증가</option>
          </select>
        </div>

        {/* 실행 및 정지 버튼 */}
        <div className="flex items-center gap-3">
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
          <button
            type="button"
            onClick={stopWork}
            disabled={!loading}
            className="w-full py-3 bg-red-500 text-white font-semibold rounded-md shadow-md hover:bg-red-600 focus:ring-2 focus:ring-red-300 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            정지
          </button>
        </div>
      </form>

      {/* 상태 메시지 */}
      {status && (
        <p className="mt-4 text-green-600 font-medium text-center">{status}</p>
      )}
    </div>
  );
}

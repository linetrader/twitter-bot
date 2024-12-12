"use client";

export default function StartBotButton() {
  const onClick = () => {
    console.log("봇 시작");
  };

  return (
    <div>
      <button
        onClick={onClick}
        className="w-full py-3 text-white font-semibold bg-blue-500 rounded-md shadow-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 transition"
      >
        봇 시작
      </button>
    </div>
  );
}

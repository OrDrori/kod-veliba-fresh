import { useState } from "react";
import AIChat from "./AIChat";

export default function FloatingChatButton({ employeeId }: { employeeId: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50 group"
          aria-label="פתח צ'אט AI"
        >
          <span className="text-3xl">🤖</span>
          
          {/* Pulse Animation */}
          <span className="absolute w-full h-full rounded-full bg-indigo-400 animate-ping opacity-20"></span>
          
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 right-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            העוזר האישי שלך
            <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && <AIChat employeeId={employeeId} onClose={() => setIsOpen(false)} />}
    </>
  );
}

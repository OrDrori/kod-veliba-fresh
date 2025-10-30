import { ReactNode } from "react";
import MondaySidebar from "./MondaySidebar";
import MobileSidebar from "./MobileSidebar";
import { NotificationCenter } from "./NotificationCenter";

interface MondayLayoutProps {
  children: ReactNode;
}

export default function MondayLayout({ children }: MondayLayoutProps) {
  return (
    <>
      <MobileSidebar />
      <div className="flex h-screen bg-gray-50" dir="rtl">
        <MondaySidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar with Notifications */}
          <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
            <div className="flex-1" />
            <NotificationCenter />
          </div>
          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}


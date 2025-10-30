import { useState } from "react";
import { Info, X, Mail, Plus, DollarSign, BarChart3, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  action: () => void;
}

interface BoardInfoBubbleNewProps {
  boardName: string;
  description: string;
  features: string[];
  automations?: string[];
  quickActions?: QuickAction[];
}

export function BoardInfoBubbleNew({
  boardName,
  description,
  features,
  automations = [],
  quickActions = [],
}: BoardInfoBubbleNewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Info Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="rounded-full hover:bg-white/10 transition-colors"
        aria-label="מידע על הבורד"
      >
        <Info className="w-5 h-5 text-white/70 hover:text-white" />
      </Button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Content */}
          <div
            className="bg-gradient-to-br from-[#2a2d42] to-[#1a1d2e] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors"
                aria-label="סגור"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                {boardName} - ניהול והדרכה
              </h2>
              <p className="text-white/90 text-sm">
                {description}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
              {/* Quick Actions */}
              {quickActions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    פעולות מהירות
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quickActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => {
                          action.action();
                          setIsOpen(false);
                        }}
                        className="flex items-start gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-all hover:scale-105 text-right"
                      >
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                          {action.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-white mb-1">
                            {action.label}
                          </div>
                          <div className="text-xs text-white/60">
                            {action.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  יעד הבורד
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Feature List */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  תהליכי עבודה
                </h3>
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
                    >
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-white/80 text-sm flex-1">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automations */}
              {automations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-2xl">🤖</span>
                    אוטומציות פעילות
                  </h3>
                  <div className="space-y-2">
                    {automations.map((automation, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg"
                      >
                        <span className="text-purple-400 text-xl">⚙️</span>
                        <p className="text-white/80 text-sm flex-1">
                          {automation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  טיפים לשימוש
                </h3>
                <ul className="space-y-2 text-sm text-white/80">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>השתמש בפעולות המהירות למעלה לחסוך זמן</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>כל השינויים נשמרים אוטומטית</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>לחץ על כפתור המיון/סינון לסינון מתקדם</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white/5 p-4 flex justify-between items-center">
              <div className="text-xs text-white/60">
                עודכן לאחרונה: {new Date().toLocaleDateString('he-IL')}
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                הבנתי, תודה!
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


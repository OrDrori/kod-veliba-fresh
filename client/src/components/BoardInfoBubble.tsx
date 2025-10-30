import { useState } from "react";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BoardInfoBubbleProps {
  title: string;
  purpose: string;
  automations: {
    trigger: string;
    action: string;
    result: string;
  }[];
  workflow?: string[];
}

export default function BoardInfoBubble({ title, purpose, automations, workflow }: BoardInfoBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none"
        title="מידע על הבורד"
      >
        <Info className="h-5 w-5" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden" 
            onClick={() => setIsOpen(false)}
          />
          
          <Card className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] md:absolute md:left-auto md:right-0 md:top-12 md:translate-x-0 md:translate-y-0 md:w-96 max-w-md z-50 shadow-2xl border-2 border-blue-500 animate-in fade-in zoom-in-95 duration-200">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5" />
                {title}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
            {/* Purpose */}
            <div>
              <h3 className="font-bold text-sm text-gray-700 mb-1">🎯 ייעוד הבורד:</h3>
              <p className="text-sm text-gray-600">{purpose}</p>
            </div>

            {/* Workflow */}
            {workflow && workflow.length > 0 && (
              <div>
                <h3 className="font-bold text-sm text-gray-700 mb-2">📋 תהליך עבודה:</h3>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  {workflow.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Automations */}
            {automations.length > 0 && (
              <div>
                <h3 className="font-bold text-sm text-gray-700 mb-2">⚡ אוטומציות פעילות:</h3>
                <div className="space-y-3">
                  {automations.map((automation, index) => (
                    <div key={index} className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border border-purple-200">
                      <div className="space-y-2">
                        <div>
                          <span className="font-semibold text-xs text-purple-700">🔔 טריגר:</span>
                          <p className="text-sm text-gray-700 mt-0.5">{automation.trigger}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-blue-700">⚙️ פעולה:</span>
                          <p className="text-sm text-gray-700 mt-0.5">{automation.action}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-green-700">✅ תוצאה:</span>
                          <p className="text-sm text-gray-700 mt-0.5">{automation.result}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {automations.length === 0 && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  💡 <strong>טיפ:</strong> בורד זה עדיין לא כולל אוטומציות אוטומטיות. ניתן להוסיף אוטומציות מותאמות אישית בעתיד.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        </>
      )}
    </div>
  );
}


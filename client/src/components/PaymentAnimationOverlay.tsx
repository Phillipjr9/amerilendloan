import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

interface PaymentAnimationOverlayProps {
  status: "success" | "failed" | null;
  onAnimationComplete: () => void;
}

export function PaymentAnimationOverlay({
  status,
  onAnimationComplete,
}: PaymentAnimationOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [videoPath, setVideoPath] = useState<string>("");

  useEffect(() => {
    if (status) {
      setIsVisible(true);
      // Set video path based on status
      if (status === "success") {
        setVideoPath("/videos/tick-market.mp4");
      } else if (status === "failed") {
        setVideoPath("/videos/payment-failed.mp4");
      }
    }
  }, [status]);

  const handleVideoEnd = () => {
    setTimeout(() => {
      setIsVisible(false);
      onAnimationComplete();
    }, 500);
  };

  if (!isVisible || !status) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md">
        {/* Video Container */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
          <video
            src={videoPath}
            autoPlay
            onEnded={handleVideoEnd}
            className="w-full h-auto"
            style={{
              aspectRatio: "16/9",
            }}
          />
        </div>

        {/* Status Message */}
        <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          {status === "success" ? (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle className="h-12 w-12 text-green-600 animate-bounce" />
              <div>
                <h3 className="text-xl font-bold text-green-600">Payment Successful!</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your payment has been processed successfully
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="h-12 w-12 text-red-600 animate-bounce" />
              <div>
                <h3 className="text-xl font-bold text-red-600">Payment Failed</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Please try again or contact support
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

interface StickyCTAButtonProps {
  isVisible: boolean;
}

export default function StickyCTAButton({ isVisible }: StickyCTAButtonProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-2xl md:hidden animate-slide-up">
      <Link href="/check-offers">
        <button className="w-full bg-gradient-to-r from-[#0A2540] to-[#1e4976] hover:from-[#1e4976] hover:to-[#0A2540] text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02]">
          <span className="text-lg">Get Your Loan Now</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </Link>
      <p className="text-center text-xs text-gray-500 mt-2">
        ⚡ Fast approval • 💰 Up to $35,000
      </p>
    </div>
  );
}

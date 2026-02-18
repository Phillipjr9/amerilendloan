import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "wouter";

interface ExitIntentPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExitIntentPopup({ isOpen, onClose }: ExitIntentPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in slide-in-from-top-4 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#C9A227] to-[#E8D48A] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#0A2540]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h3 className="text-2xl font-bold text-[#0A2540] mb-3">
            Wait! Don't Leave Yet 👋
          </h3>
          
          <p className="text-gray-600 mb-6">
            Get your <span className="font-semibold text-[#C9A227]">FREE loan quote</span> in just 60 seconds with <span className="font-semibold">no impact</span> to your credit score!
          </p>

          <div className="bg-[#0A2540]/5 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-left">
                <div className="font-semibold text-[#0A2540]">✓ Same-day funding</div>
                <div className="text-gray-600">Get cash today</div>
              </div>
              <div className="text-left">
                <div className="font-semibold text-[#0A2540]">✓ No hidden fees</div>
                <div className="text-gray-600">100% transparent</div>
              </div>
              <div className="text-left col-span-2">
                <div className="font-semibold text-[#0A2540]">✓ Trusted by 50,000+ customers</div>
              </div>
            </div>
          </div>

          <Link href="/check-offers">
            <Button className="w-full bg-gradient-to-r from-[#C9A227] to-[#E8D48A] hover:from-[#E8D48A] hover:to-[#C9A227] text-[#0A2540] font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all">
              Get My Free Quote Now →
            </Button>
          </Link>

          <button
            onClick={onClose}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            No thanks, I'll pass on this opportunity
          </button>
        </div>
      </div>
    </div>
  );
}

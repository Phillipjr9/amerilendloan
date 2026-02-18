import { Clock, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export default function UrgencyCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    // Calculate end of today
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = endOfDay.getTime() - now.getTime();

      if (diff <= 0) {
        // Reset for next day
        const newEnd = new Date();
        newEnd.setDate(newEnd.getDate() + 1);
        newEnd.setHours(23, 59, 59, 999);
        endOfDay.setTime(newEnd.getTime());
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold">
                🔥 Limited Time Offer!
              </h3>
              <p className="text-white/90 text-sm">
                Apply today and get <strong>0.5% off your rate</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px] text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-xs text-white/80">Hours</div>
              </div>
              <span className="text-white text-2xl font-bold">:</span>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px] text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-xs text-white/80">Minutes</div>
              </div>
              <span className="text-white text-2xl font-bold">:</span>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px] text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-xs text-white/80">Seconds</div>
              </div>
            </div>

            <Link href="/check-offers">
              <button className="bg-white text-red-600 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 whitespace-nowrap">
                Claim Offer →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

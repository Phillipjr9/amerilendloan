import { ShieldCheck, BadgeCheck, Fingerprint, Lock, ArrowRight } from "lucide-react";
import { useState } from "react";

const verificationMethods = [
  {
    icon: BadgeCheck,
    name: "Bank Account Verification",
    provider: "Secure Manual Review",
    description: "Provide your bank details securely — our team verifies within hours",
    time: "< 24 hours",
    color: "bg-green-100 text-green-600",
    trust: "256-bit encrypted bank credentials",
  },
  {
    icon: Fingerprint,
    name: "Identity Verification",
    provider: "Admin-Reviewed Documents",
    description: "Upload your ID documents — our team manually reviews and approves",
    time: "< 24 hours",
    color: "bg-blue-100 text-blue-600",
    trust: "Bank-grade identity verification",
  },
  {
    icon: Lock,
    name: "Income Verification",
    provider: "Document Upload",
    description: "Upload pay stubs or tax returns for manual verification by our team",
    time: "< 24 hours",
    color: "bg-purple-100 text-purple-600",
    trust: "Verified by certified loan officers",
  },
];

export default function IncomeVerificationBadge() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="bg-gradient-to-br from-gray-50 to-slate-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <ShieldCheck className="w-4 h-4" />
              Instant Verification
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0A2540] mb-4">
              Verify in Seconds, Not Days
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your documents securely and our team will verify your identity and income — fast and reliable.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {verificationMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className={`w-14 h-14 ${method.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg mb-1">{method.name}</h3>
                  <p className="text-xs text-gray-400 font-medium mb-3">{method.provider}</p>
                  <p className="text-sm text-gray-600 mb-4">{method.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-xs text-gray-400">Completion time</div>
                      <div className="font-bold text-[#0A2540] text-sm">{method.time}</div>
                    </div>
                    <div className={`w-8 h-8 rounded-full bg-green-100 flex items-center justify-center transition-all ${hoveredIndex === index ? "scale-110" : ""}`}>
                      <ArrowRight className="w-4 h-4 text-green-600" />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                    <Lock className="w-3 h-3" />
                    {method.trust}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Security assurance */}
          <div className="mt-8 bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
            <ShieldCheck className="w-8 h-8 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Your data is encrypted end-to-end</p>
              <p className="text-xs text-gray-500">
                256-bit SSL encryption. We never store your bank credentials. SOC 2 Type II certified.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

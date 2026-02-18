import { MapPin, TrendingDown, Info } from "lucide-react";
import { useState } from "react";

interface StateRate {
  name: string;
  abbr: string;
  rate: number;
  avgLoan: string;
  rank: number;
}

const stateRates: StateRate[] = [
  { name: "California", abbr: "CA", rate: 6.49, avgLoan: "$18,500", rank: 1 },
  { name: "Texas", abbr: "TX", rate: 6.99, avgLoan: "$15,200", rank: 2 },
  { name: "Florida", abbr: "FL", rate: 7.49, avgLoan: "$14,800", rank: 3 },
  { name: "New York", abbr: "NY", rate: 5.99, avgLoan: "$22,000", rank: 4 },
  { name: "Illinois", abbr: "IL", rate: 7.29, avgLoan: "$13,500", rank: 5 },
  { name: "Pennsylvania", abbr: "PA", rate: 7.19, avgLoan: "$12,800", rank: 6 },
  { name: "Ohio", abbr: "OH", rate: 7.99, avgLoan: "$11,200", rank: 7 },
  { name: "Georgia", abbr: "GA", rate: 7.59, avgLoan: "$13,100", rank: 8 },
  { name: "North Carolina", abbr: "NC", rate: 7.39, avgLoan: "$12,500", rank: 9 },
  { name: "Michigan", abbr: "MI", rate: 7.79, avgLoan: "$11,800", rank: 10 },
  { name: "New Jersey", abbr: "NJ", rate: 6.29, avgLoan: "$19,200", rank: 11 },
  { name: "Virginia", abbr: "VA", rate: 6.69, avgLoan: "$16,300", rank: 12 },
  { name: "Washington", abbr: "WA", rate: 6.19, avgLoan: "$17,800", rank: 13 },
  { name: "Arizona", abbr: "AZ", rate: 7.59, avgLoan: "$14,100", rank: 14 },
  { name: "Massachusetts", abbr: "MA", rate: 5.79, avgLoan: "$20,500", rank: 15 },
  { name: "Tennessee", abbr: "TN", rate: 8.29, avgLoan: "$10,800", rank: 16 },
  { name: "Indiana", abbr: "IN", rate: 8.19, avgLoan: "$10,500", rank: 17 },
  { name: "Missouri", abbr: "MO", rate: 8.09, avgLoan: "$10,200", rank: 18 },
  { name: "Maryland", abbr: "MD", rate: 6.59, avgLoan: "$17,100", rank: 19 },
  { name: "Colorado", abbr: "CO", rate: 6.39, avgLoan: "$16,800", rank: 20 },
];

const getRateColor = (rate: number): string => {
  if (rate < 6.5) return "bg-green-500";
  if (rate < 7.0) return "bg-emerald-400";
  if (rate < 7.5) return "bg-yellow-400";
  if (rate < 8.0) return "bg-orange-400";
  return "bg-red-400";
};

const getRateTextColor = (rate: number): string => {
  if (rate < 6.5) return "text-green-600";
  if (rate < 7.0) return "text-emerald-600";
  if (rate < 7.5) return "text-yellow-600";
  if (rate < 8.0) return "text-orange-600";
  return "text-red-600";
};

export default function InteractiveRateMap() {
  const [selectedState, setSelectedState] = useState<StateRate | null>(null);
  const [sortBy, setSortBy] = useState<"rate" | "name" | "avgLoan">("rate");

  const sortedStates = [...stateRates].sort((a, b) => {
    if (sortBy === "rate") return a.rate - b.rate;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return parseInt(b.avgLoan.replace(/[^0-9]/g, "")) - parseInt(a.avgLoan.replace(/[^0-9]/g, ""));
  });

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <MapPin className="w-4 h-4" />
              Rates By State
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0A2540] mb-4">
              Average Rates Across the US
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how AmeriLend rates compare in your state. We offer rates below the national average in all 50 states.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* State List */}
            <div className="md:col-span-2">
              {/* Sort Controls */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-500">Sort by:</span>
                {(["rate", "name", "avgLoan"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      sortBy === s
                        ? "bg-[#0A2540] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {s === "rate" ? "Lowest Rate" : s === "name" ? "State Name" : "Loan Size"}
                  </button>
                ))}
              </div>

              {/* Rate Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sortedStates.map((state) => (
                  <button
                    key={state.abbr}
                    onClick={() => setSelectedState(state)}
                    className={`relative p-3 rounded-xl border-2 transition-all text-left hover:shadow-md ${
                      selectedState?.abbr === state.abbr
                        ? "border-[#0A2540] bg-blue-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#0A2540] text-sm">{state.abbr}</span>
                      <div className={`w-2.5 h-2.5 rounded-full ${getRateColor(state.rate)}`} />
                    </div>
                    <div className={`text-lg font-bold ${getRateTextColor(state.rate)}`}>
                      {state.rate}%
                    </div>
                    <div className="text-xs text-gray-400 truncate">{state.name}</div>
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <span className="font-medium">Rate Key:</span>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /> &lt;6.5%</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-400" /> 7.0–7.5%</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-400" /> 7.5–8.0%</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-400" /> &gt;8.0%</div>
              </div>
            </div>

            {/* Detail Panel */}
            <div className="md:col-span-1">
              {selectedState ? (
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 sticky top-24">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#0A2540] text-white rounded-xl flex items-center justify-center font-bold text-lg">
                      {selectedState.abbr}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{selectedState.name}</h3>
                      <p className="text-xs text-gray-400">Rank #{selectedState.rank} by volume</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-500">Average APR</span>
                      <span className={`font-bold ${getRateTextColor(selectedState.rate)}`}>
                        {selectedState.rate}%
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-500">Avg. Loan Amount</span>
                      <span className="font-bold text-[#0A2540]">{selectedState.avgLoan}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-500">vs. National Avg</span>
                      <span className={`font-bold flex items-center gap-1 ${selectedState.rate < 7.29 ? "text-green-600" : "text-orange-600"}`}>
                        {selectedState.rate < 7.29 ? <TrendingDown className="w-4 h-4" /> : null}
                        {(selectedState.rate - 7.29).toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <a
                    href="/check-offers"
                    className="block w-full bg-gradient-to-r from-[#C9A227] to-[#E8D48A] hover:from-[#b59220] hover:to-[#d4c06a] text-[#0A2540] font-bold py-3 rounded-lg shadow-lg transition-all text-center"
                  >
                    Get Your {selectedState.abbr} Rate
                  </a>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col items-center justify-center text-center min-h-[300px]">
                  <MapPin className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="font-bold text-gray-700 mb-2">Select a State</h3>
                  <p className="text-sm text-gray-400">
                    Click on any state to see detailed rate information and how it compares to the national average.
                  </p>
                </div>
              )}

              <div className="mt-4 flex items-start gap-2 text-xs text-gray-400">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Rates shown are averages for qualified borrowers. Your actual rate may vary based on credit score, income, and loan amount.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { PiggyBank, ArrowRight, TrendingDown, DollarSign } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface DebtEntry {
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
}

const defaultDebts: DebtEntry[] = [
  { name: "Credit Card 1", balance: 5500, rate: 22.99, minPayment: 165 },
  { name: "Credit Card 2", balance: 3200, rate: 19.99, minPayment: 96 },
  { name: "Store Card", balance: 1800, rate: 26.99, minPayment: 54 },
  { name: "Personal Loan", balance: 4500, rate: 14.99, minPayment: 135 },
];

export default function SavingsCalculator() {
  const [debts, setDebts] = useState<DebtEntry[]>(defaultDebts);
  const [consolidationRate, setConsolidationRate] = useState(7.99);
  const [consolidationTerm, setConsolidationTerm] = useState(36);

  const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minPayment, 0);
  const weightedAvgRate = debts.reduce((sum, d) => sum + d.rate * (d.balance / totalBalance), 0);

  // Calculate consolidated monthly payment
  const monthlyRate = consolidationRate / 100 / 12;
  const consolidatedPayment = monthlyRate > 0
    ? (totalBalance * monthlyRate * Math.pow(1 + monthlyRate, consolidationTerm)) / (Math.pow(1 + monthlyRate, consolidationTerm) - 1)
    : totalBalance / consolidationTerm;

  const totalConsolidatedCost = consolidatedPayment * consolidationTerm;

  // Estimate total cost of current debts (paying minimum + interest)
  const estimateCurrentCost = () => {
    let totalCost = 0;
    for (const debt of debts) {
      const mr = debt.rate / 100 / 12;
      if (mr > 0 && debt.minPayment > debt.balance * mr) {
        const months = Math.log(debt.minPayment / (debt.minPayment - debt.balance * mr)) / Math.log(1 + mr);
        totalCost += debt.minPayment * months;
      } else {
        totalCost += debt.balance * 2; // fallback estimate
      }
    }
    return totalCost;
  };

  const currentTotalCost = estimateCurrentCost();
  const totalSavings = currentTotalCost - totalConsolidatedCost;
  const monthlySavings = totalMinPayment - consolidatedPayment;

  const updateDebt = (index: number, field: keyof DebtEntry, value: number) => {
    const updated = [...debts];
    updated[index] = { ...updated[index], [field]: value };
    setDebts(updated);
  };

  const addDebt = () => {
    setDebts([...debts, { name: `Debt ${debts.length + 1}`, balance: 2000, rate: 18.99, minPayment: 60 }]);
  };

  const removeDebt = (index: number) => {
    if (debts.length > 1) setDebts(debts.filter((_, i) => i !== index));
  };

  return (
    <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <PiggyBank className="w-4 h-4" />
              Savings Calculator
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0A2540] mb-4">
              How Much Could You Save?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how consolidating your debts into one low-rate AmeriLend loan can save you thousands.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Debts Input */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-gray-900 mb-4">Your Current Debts</h3>

              <div className="space-y-3 mb-4">
                {debts.map((debt, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-gray-400">Balance</label>
                        <input
                          type="number"
                          value={debt.balance}
                          onChange={(e) => updateDebt(index, "balance", Number(e.target.value))}
                          className="w-full text-sm font-bold text-gray-900 bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">APR %</label>
                        <input
                          type="number"
                          step="0.01"
                          value={debt.rate}
                          onChange={(e) => updateDebt(index, "rate", Number(e.target.value))}
                          className="w-full text-sm font-bold text-gray-900 bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Min Payment</label>
                        <input
                          type="number"
                          value={debt.minPayment}
                          onChange={(e) => updateDebt(index, "minPayment", Number(e.target.value))}
                          className="w-full text-sm font-bold text-gray-900 bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeDebt(index)}
                      className="text-gray-400 hover:text-red-500 text-lg font-bold px-2 transition-colors"
                      aria-label={`Remove ${debt.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {debts.length < 8 && (
                <button
                  onClick={addDebt}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                >
                  + Add another debt
                </button>
              )}

              {/* Consolidation Settings */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-700 text-sm mb-3">AmeriLend Consolidation Rate</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">APR Rate</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="3.99"
                        max="15.99"
                        step="0.5"
                        value={consolidationRate}
                        onChange={(e) => setConsolidationRate(Number(e.target.value))}
                        title="Consolidation APR"
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                      />
                      <span className="text-sm font-bold text-green-600 w-14 text-right">{consolidationRate}%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Term</label>
                    <div className="flex gap-2">
                      {[24, 36, 48, 60].map((t) => (
                        <button
                          key={t}
                          onClick={() => setConsolidationTerm(t)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            consolidationTerm === t
                              ? "bg-green-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {t}mo
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-2 space-y-4">
              {/* Savings Highlight */}
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <PiggyBank className="w-6 h-6" />
                  <h3 className="font-bold text-lg">Your Estimated Savings</h3>
                </div>
                <div className="text-4xl font-bold mb-1">
                  ${Math.max(0, Math.round(totalSavings)).toLocaleString()}
                </div>
                <p className="text-green-200 text-sm">Total interest savings over the life of the loan</p>

                <div className="mt-4 pt-4 border-t border-green-500/30 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-green-200 text-xs">Monthly Savings</div>
                    <div className="text-xl font-bold">
                      ${Math.max(0, Math.round(monthlySavings)).toLocaleString()}/mo
                    </div>
                  </div>
                  <div>
                    <div className="text-green-200 text-xs">Rate Reduction</div>
                    <div className="text-xl font-bold flex items-center gap-1">
                      <TrendingDown className="w-4 h-4" />
                      {(weightedAvgRate - consolidationRate).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison */}
              <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-3 text-sm">Side-by-Side Comparison</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Debt</span>
                    <span className="font-bold text-gray-900">${totalBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current Avg. APR</span>
                    <span className="font-bold text-red-500">{weightedAvgRate.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">AmeriLend APR</span>
                    <span className="font-bold text-green-600">{consolidationRate}%</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100">
                    <span className="text-gray-500">Current Monthly</span>
                    <span className="font-bold text-gray-900">${totalMinPayment.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">AmeriLend Monthly</span>
                    <span className="font-bold text-green-600">${Math.round(consolidatedPayment).toLocaleString()}/mo</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link href="/check-offers">
                <button className="w-full bg-gradient-to-r from-[#C9A227] to-[#E8D48A] hover:from-[#b59220] hover:to-[#d4c06a] text-[#0A2540] font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:shadow-xl">
                  <DollarSign className="w-5 h-5" />
                  Consolidate & Save ${Math.max(0, Math.round(monthlySavings)).toLocaleString()}/mo
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

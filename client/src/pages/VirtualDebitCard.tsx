import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Eye,
  EyeOff,
  Snowflake,
  Shield,
  Settings,
  ArrowLeft,
  Copy,
  Check,
  Globe,
  Wifi,
  Building2,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Clock,
  Plus,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Card color themes
const cardThemes: Record<string, { bg: string; accent: string; text: string }> = {
  blue: { bg: "from-blue-600 via-blue-700 to-blue-900", accent: "text-blue-200", text: "text-white" },
  black: { bg: "from-gray-800 via-gray-900 to-black", accent: "text-gray-400", text: "text-white" },
  gold: { bg: "from-yellow-600 via-amber-700 to-amber-900", accent: "text-amber-200", text: "text-white" },
  green: { bg: "from-emerald-600 via-emerald-700 to-emerald-900", accent: "text-emerald-200", text: "text-white" },
  purple: { bg: "from-purple-600 via-purple-700 to-purple-900", accent: "text-purple-200", text: "text-white" },
};

function VirtualDebitCard() {
  const [, navigate] = useLocation();
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const { data: user } = trpc.auth.me.useQuery();
  const { data: cards, isLoading, refetch: refetchCards } = trpc.virtualCards.myCards.useQuery(undefined, {
    enabled: !!user,
  });

  const revealCardMutation = trpc.virtualCards.revealCard.useMutation();
  const toggleFreezeMutation = trpc.virtualCards.toggleFreeze.useMutation({
    onSuccess: () => refetchCards(),
  });
  const updateSettingsMutation = trpc.virtualCards.updateSettings.useMutation({
    onSuccess: () => refetchCards(),
  });

  const selectedCard = cards?.find((c: any) => c.id === selectedCardId) || cards?.[0];
  const cardId = selectedCard?.id;

  const { data: transactions } = trpc.virtualCards.getTransactions.useQuery(
    { cardId: cardId!, limit: 20 },
    { enabled: !!cardId }
  );

  const { data: revealedData } = revealCardMutation;

  useEffect(() => {
    if (cards && cards.length > 0 && !selectedCardId) {
      setSelectedCardId(cards[0].id);
    }
  }, [cards, selectedCardId]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRevealCard = async () => {
    if (!cardId) return;
    if (showCardDetails) {
      setShowCardDetails(false);
      return;
    }
    try {
      await revealCardMutation.mutateAsync({ cardId });
      setShowCardDetails(true);
      // Auto-hide after 30 seconds
      setTimeout(() => setShowCardDetails(false), 30000);
    } catch (err) {
      console.error("Failed to reveal card:", err);
    }
  };

  const handleToggleFreeze = async () => {
    if (!cardId) return;
    await toggleFreezeMutation.mutateAsync({ cardId });
  };

  const handleToggleSetting = async (setting: string, value: boolean) => {
    if (!cardId) return;
    await updateSettingsMutation.mutateAsync({ cardId, [setting]: value });
  };

  const theme = cardThemes[selectedCard?.cardColor || "blue"] || cardThemes.blue;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign in Required</h2>
            <p className="text-gray-500 mb-4">Please sign in to view your virtual debit cards.</p>
            <Button onClick={() => navigate("/login")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading your cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/user-dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Virtual Debit Card</h1>
              </div>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
              <Shield className="w-3 h-3 mr-1" /> Secure
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {!cards || cards.length === 0 ? (
          /* No Cards State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <CreditCard className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Virtual Cards Yet</h2>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Your virtual debit card will be issued once your loan is approved and disbursed.
              Apply for a loan to get started.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => navigate("/apply")}>
                <Plus className="w-4 h-4 mr-2" /> Apply for a Loan
              </Button>
              <Button variant="outline" onClick={() => navigate("/user-dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Card Display */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card Selector (if multiple cards) */}
              {cards.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {cards.map((card: any) => (
                    <button
                      key={card.id}
                      onClick={() => { setSelectedCardId(card.id); setShowCardDetails(false); }}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                        selectedCardId === card.id
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {card.cardLabel || "Debit Card"} •••• {card.cardNumberLast4}
                    </button>
                  ))}
                </div>
              )}

              {/* Card Visual */}
              <div className="relative">
                <div className={`relative bg-gradient-to-br ${theme.bg} rounded-2xl p-6 sm:p-8 shadow-2xl aspect-[1.6/1] max-w-lg mx-auto overflow-hidden`}>
                  {/* Card chip pattern */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
                  
                  {/* Status badge */}
                  {selectedCard?.status === "frozen" && (
                    <div className="absolute top-4 right-4 bg-blue-400/80 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 text-xs font-medium text-white">
                      <Snowflake className="w-3 h-3" /> FROZEN
                    </div>
                  )}
                  {selectedCard?.status === "cancelled" && (
                    <div className="absolute top-4 right-4 bg-red-500/80 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 text-xs font-medium text-white">
                      <AlertTriangle className="w-3 h-3" /> CANCELLED
                    </div>
                  )}

                  <div className="relative h-full flex flex-col justify-between">
                    {/* Top row */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`text-xs font-medium ${theme.accent} mb-1`}>
                          {selectedCard?.cardLabel || "AmeriLend Debit Card"}
                        </p>
                        <div className="flex items-center gap-2">
                          <Wifi className="w-6 h-6 text-white/80 rotate-90" />
                          <div className="w-10 h-7 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md" />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-[10px] ${theme.accent}`}>DEBIT</p>
                        <p className="text-white font-bold text-lg tracking-wider">VISA</p>
                      </div>
                    </div>

                    {/* Card Number */}
                    <div className="py-2">
                      <p className="text-white font-mono text-lg sm:text-xl tracking-[0.2em]">
                        {showCardDetails && revealedData
                          ? revealedData.cardNumber.replace(/(.{4})/g, "$1 ").trim()
                          : `•••• •••• •••• ${selectedCard?.cardNumberLast4}`}
                      </p>
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className={`text-[10px] ${theme.accent} mb-0.5`}>CARDHOLDER</p>
                        <p className="text-white font-medium text-sm tracking-wide">
                          {selectedCard?.cardholderName?.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-[10px] ${theme.accent} mb-0.5`}>EXPIRES</p>
                        <p className="text-white font-mono text-sm">
                          {showCardDetails && revealedData
                            ? `${revealedData.expiryMonth}/${revealedData.expiryYear.slice(-2)}`
                            : `${selectedCard?.expiryMonth}/**`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-[10px] ${theme.accent} mb-0.5`}>CVV</p>
                        <p className="text-white font-mono text-sm">
                          {showCardDetails && revealedData ? revealedData.cvv : "•••"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex justify-center gap-3 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRevealCard}
                    disabled={revealCardMutation.isPending || selectedCard?.status === "cancelled"}
                    className="gap-2"
                  >
                    {showCardDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {revealCardMutation.isPending ? "Revealing..." : showCardDetails ? "Hide Details" : "Show Details"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleFreeze}
                    disabled={toggleFreezeMutation.isPending || selectedCard?.status === "cancelled" || selectedCard?.status === "expired"}
                    className={`gap-2 ${selectedCard?.status === "frozen" ? "text-blue-600 border-blue-300" : ""}`}
                  >
                    <Snowflake className="w-4 h-4" />
                    {toggleFreezeMutation.isPending ? "..." : selectedCard?.status === "frozen" ? "Unfreeze" : "Freeze"}
                  </Button>
                  {showCardDetails && revealedData && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(revealedData.cardNumber, "number")}
                      className="gap-2"
                    >
                      {copiedField === "number" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      {copiedField === "number" ? "Copied!" : "Copy Number"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Balance Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-white">
                  <CardContent className="pt-5 pb-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">Available Balance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency((selectedCard?.currentBalance || 0) / 100)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardContent className="pt-5 pb-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">Daily Spent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency((selectedCard?.dailySpent || 0) / 100)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      of {formatCurrency((selectedCard?.dailySpendLimit || 500000) / 100)} limit
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardContent className="pt-5 pb-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">Monthly Spent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency((selectedCard?.monthlySpent || 0) / 100)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      of {formatCurrency((selectedCard?.monthlySpendLimit || 2500000) / 100)} limit
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Transactions */}
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Recent Transactions</CardTitle>
                    <CardDescription>Your latest card activity</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {!transactions || transactions.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No transactions yet</p>
                      <p className="text-sm mt-1">Your card activity will appear here</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {transactions.map((tx: any) => {
                        const isCredit = tx.amount < 0;
                        return (
                          <div key={tx.id} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isCredit ? "bg-green-100 text-green-600" : "bg-red-50 text-red-500"
                              }`}>
                                {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{tx.merchantName}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  {tx.merchantCategory && <span>{tx.merchantCategory}</span>}
                                  <span>•</span>
                                  <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold text-sm ${isCredit ? "text-green-600" : "text-gray-900"}`}>
                                {isCredit ? "+" : "-"}{formatCurrency(Math.abs(tx.amount) / 100)}
                              </p>
                              <Badge variant="outline" className={`text-[10px] ${
                                tx.status === "completed" ? "text-green-600 border-green-200" :
                                tx.status === "pending" ? "text-yellow-600 border-yellow-200" :
                                tx.status === "declined" ? "text-red-600 border-red-200" :
                                "text-gray-500 border-gray-200"
                              }`}>
                                {tx.status}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Card Settings */}
            <div className="space-y-6">
              {/* Card Info */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Card Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <div>
                        <Label className="text-sm font-medium">Online Transactions</Label>
                        <p className="text-xs text-gray-400">Use card for online purchases</p>
                      </div>
                    </div>
                    <Switch
                      checked={selectedCard?.onlineTransactionsEnabled ?? true}
                      onCheckedChange={(v) => handleToggleSetting("onlineTransactionsEnabled", v)}
                      disabled={selectedCard?.status !== "active"}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <div>
                        <Label className="text-sm font-medium">International</Label>
                        <p className="text-xs text-gray-400">Allow international purchases</p>
                      </div>
                    </div>
                    <Switch
                      checked={selectedCard?.internationalTransactionsEnabled ?? false}
                      onCheckedChange={(v) => handleToggleSetting("internationalTransactionsEnabled", v)}
                      disabled={selectedCard?.status !== "active"}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <div>
                        <Label className="text-sm font-medium">ATM Withdrawals</Label>
                        <p className="text-xs text-gray-400">Withdraw cash at ATMs</p>
                      </div>
                    </div>
                    <Switch
                      checked={selectedCard?.atmWithdrawalsEnabled ?? true}
                      onCheckedChange={(v) => handleToggleSetting("atmWithdrawalsEnabled", v)}
                      disabled={selectedCard?.status !== "active"}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-gray-400" />
                      <div>
                        <Label className="text-sm font-medium">Contactless / Tap</Label>
                        <p className="text-xs text-gray-400">Apple Pay, Google Pay, tap</p>
                      </div>
                    </div>
                    <Switch
                      checked={selectedCard?.contactlessEnabled ?? true}
                      onCheckedChange={(v) => handleToggleSetting("contactlessEnabled", v)}
                      disabled={selectedCard?.status !== "active"}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Spending Limits */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Spending Limits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-sm">Daily Limit</Label>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency((selectedCard?.dailySpendLimit || 500000) / 100)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(((selectedCard?.dailySpent || 0) / (selectedCard?.dailySpendLimit || 500000)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatCurrency((selectedCard?.dailySpent || 0) / 100)} spent today
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-sm">Monthly Limit</Label>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency((selectedCard?.monthlySpendLimit || 2500000) / 100)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(((selectedCard?.monthlySpent || 0) / (selectedCard?.monthlySpendLimit || 2500000)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatCurrency((selectedCard?.monthlySpent || 0) / 100)} spent this month
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card Details */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Card Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Card Type</span>
                    <span className="font-medium">Virtual Debit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Network</span>
                    <span className="font-medium">Visa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <Badge variant="outline" className={
                      selectedCard?.status === "active" ? "text-green-600 border-green-200 bg-green-50" :
                      selectedCard?.status === "frozen" ? "text-blue-600 border-blue-200 bg-blue-50" :
                      "text-red-600 border-red-200 bg-red-50"
                    }>
                      {(selectedCard?.status ?? "unknown").charAt(0).toUpperCase() + (selectedCard?.status ?? "unknown").slice(1)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last 4</span>
                    <span className="font-mono font-medium">{selectedCard?.cardNumberLast4}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Issued</span>
                    <span className="font-medium">
                      {selectedCard?.issuedAt ? new Date(selectedCard.issuedAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Expires</span>
                    <span className="font-medium">
                      {selectedCard?.expiryMonth}/{selectedCard?.expiryYear}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Security Tips */}
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800 text-sm">Security Tips</p>
                      <ul className="text-xs text-amber-700 mt-2 space-y-1">
                        <li>• Never share your card details via email or phone</li>
                        <li>• Freeze your card immediately if you suspect fraud</li>
                        <li>• Review transactions regularly for unauthorized activity</li>
                        <li>• Card details auto-hide after 30 seconds</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} AmeriLend. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/legal/privacy_policy" className="hover:text-gray-700">Privacy Policy</Link>
              <Link href="/legal/terms_of_service" className="hover:text-gray-700">Terms of Service</Link>
              <Link href="/support" className="hover:text-gray-700">Contact Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default VirtualDebitCard;

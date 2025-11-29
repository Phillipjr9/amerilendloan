import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Copy, Share2, Mail, DollarSign, Users, CheckCircle, Clock, Gift } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function Referrals() {
  const { user, isAuthenticated } = useAuth();
  const [copySuccess, setCopySuccess] = useState(false);

  const { data: referralData, isLoading: referralLoading } = trpc.referrals.getMyReferralCode.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.referrals.getMyReferralStats.useQuery();
  const { data: referrals, isLoading: referralsLoading } = trpc.referrals.getMyReferrals.useQuery();
  const { data: rewards, isLoading: rewardsLoading } = trpc.referrals.getMyRewardsBalance.useQuery();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please log in to access referrals.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const loading = referralLoading || statsLoading || referralsLoading || rewardsLoading;

  const handleCopyLink = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      setCopySuccess(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleEmailShare = () => {
    if (!referralData?.referralLink) return;
    
    const subject = encodeURIComponent("Get $25 with AmeriLend!");
    const body = encodeURIComponent(
      `Hi! I thought you might be interested in AmeriLend loans. Use my referral link to get $25 credit when you complete your first payment:\n\n${referralData.referralLink}\n\nI'll also receive $50 as a thank you. It's a win-win!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
          <p className="text-muted-foreground">
            Earn $50 for every friend who completes their first payment. Your friend gets $25 too!
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Rewards Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Your Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(rewards?.creditBalance || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Account Credit</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-600">
                      {stats?.totalReferrals || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Referrals</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.completedReferrals || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(stats?.totalEarned || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Share Your Link */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  Share Your Referral Link
                </CardTitle>
                <CardDescription>
                  Share this link with friends. When they complete their first payment, you both earn rewards!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={referralData?.referralLink || ""}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant={copySuccess ? "default" : "outline"}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copySuccess ? "Copied!" : "Copy"}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleEmailShare} variant="outline" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Share via Email
                  </Button>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <p className="font-semibold text-sm">Your Referral Code:</p>
                  <p className="text-2xl font-mono font-bold text-primary tracking-wider">
                    {referralData?.referralCode || ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires: {referralData?.expiresAt ? new Date(referralData.expiresAt).toLocaleDateString() : "Never"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold text-primary">1</span>
                    </div>
                    <h3 className="font-semibold mb-2">Share Your Link</h3>
                    <p className="text-sm text-muted-foreground">
                      Send your unique referral link to friends and family
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold text-primary">2</span>
                    </div>
                    <h3 className="font-semibold mb-2">They Apply & Pay</h3>
                    <p className="text-sm text-muted-foreground">
                      Your friend applies for a loan (min. $1,000) and makes their first payment
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold text-primary">3</span>
                    </div>
                    <h3 className="font-semibold mb-2">Earn Rewards</h3>
                    <p className="text-sm text-muted-foreground">
                      You get $50 credit, they get $25 credit—everyone wins!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referral History */}
            {referrals && referrals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Referrals</CardTitle>
                  <CardDescription>Track the status of your referrals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {referrals.map((referral) => (
                      <div
                        key={referral.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {referral.referredUserName || "User"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {referral.referredUserEmail}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          {referral.status === "completed" ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                Completed - {formatCurrency(referral.referrerBonus || 0)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-600">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm font-medium">Pending</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Program Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <ul className="list-disc list-inside space-y-1">
                  <li>Referrer earns $50 account credit per successful referral</li>
                  <li>Referred user earns $25 account credit</li>
                  <li>Referred user must apply for minimum $1,000 loan</li>
                  <li>Rewards are credited after referred user makes first payment</li>
                  <li>Referral codes expire after 365 days</li>
                  <li>Account credits can be used toward future loan payments</li>
                  <li>Cannot refer yourself or existing customers</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

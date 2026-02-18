import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, TrendingUp, Users, DollarSign, MousePointerClick, Plus } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function MarketingCampaigns() {
  const utils = trpc.useUtils();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");

  // Get all campaigns
  const { data: campaigns, isLoading } = trpc.marketing.getCampaigns.useQuery();

  // Get campaign performance
  const { data: performanceData } = trpc.marketing.getCampaignPerformance.useQuery({ campaignId: undefined as any });
  const performance = (performanceData as any)?.data as any[] | undefined;

  // Create campaign mutation
  const createMutation = trpc.marketing.createCampaign.useMutation({
    onSuccess: () => {
      utils.marketing.getCampaigns.invalidate();
      utils.marketing.getCampaignPerformance.invalidate();
      setCreateDialogOpen(false);
      setCampaignName("");
      setUtmSource("");
      setUtmMedium("");
      setUtmCampaign("");
      setUtmTerm("");
      setUtmContent("");
      setBudget("");
      setNotes("");
      toast.success("Marketing campaign has been created successfully.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create campaign.");
    },
  });

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      campaignName,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm: utmTerm || undefined,
      utmContent: utmContent || undefined,
      budget: budget ? Math.round(parseFloat(budget) * 100) : undefined,
      notes: notes || undefined,
    } as any);
  };

  const generateTrackingUrl = (campaign: any) => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      utm_source: campaign.utmSource,
      utm_medium: campaign.utmMedium,
      utm_campaign: campaign.utmCampaign,
      ...(campaign.utmTerm && { utm_term: campaign.utmTerm }),
      ...(campaign.utmContent && { utm_content: campaign.utmContent }),
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!", {
      description: "Tracking URL copied to clipboard.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Marketing Campaigns
        </h1>
        <p className="text-muted-foreground">
          Track campaign performance and attribution with UTM parameters.
        </p>
      </div>

      {/* Performance Summary */}
      {performance && performance.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
                <p className="text-2xl font-bold">{(campaigns as any)?.data?.length || (campaigns as any)?.length || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Visits</p>
                <p className="text-2xl font-bold">
                  {(performance as any)?.reduce((sum: number, p: any) => sum + p.totalVisits, 0)}
                </p>
              </div>
              <MousePointerClick className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Signups</p>
                <p className="text-2xl font-bold">
                  {(performance as any)?.reduce((sum: number, p: any) => sum + p.totalSignups, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-2xl font-bold">
                  {(performance as any)?.reduce((sum: number, p: any) => sum + p.totalApplications, 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Create Campaign */}
      <div className="flex justify-end mb-6">
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Marketing Campaign</DialogTitle>
              <DialogDescription>
                Set up a new campaign with UTM tracking parameters.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateCampaign}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Summer 2024 Promotion"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="source">UTM Source *</Label>
                    <Input
                      id="source"
                      value={utmSource}
                      onChange={(e) => setUtmSource(e.target.value)}
                      placeholder="google, facebook, email"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Where traffic is coming from
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medium">UTM Medium *</Label>
                    <Input
                      id="medium"
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                      placeholder="cpc, email, social"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Marketing channel type
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign">UTM Campaign *</Label>
                  <Input
                    id="campaign"
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    placeholder="summer_sale_2024"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Specific campaign identifier
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="term">UTM Term (Optional)</Label>
                    <Input
                      id="term"
                      value={utmTerm}
                      onChange={(e) => setUtmTerm(e.target.value)}
                      placeholder="personal+loans"
                    />
                    <p className="text-xs text-muted-foreground">
                      Paid keywords
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">UTM Content (Optional)</Label>
                    <Input
                      id="content"
                      value={utmContent}
                      onChange={(e) => setUtmContent(e.target.value)}
                      placeholder="banner_ad_1"
                    />
                    <p className="text-xs text-muted-foreground">
                      Ad variation
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (Optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input
                      id="budget"
                      type="number"
                      step="0.01"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="pl-7"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional information..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Campaign"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaigns Table */}
      <Card className="mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Source/Medium</TableHead>
              <TableHead>Visits</TableHead>
              <TableHead>Signups</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead>Conversion</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {((campaigns as any)?.data || campaigns) && ((campaigns as any)?.data || campaigns as any).length > 0 ? (
              ((campaigns as any)?.data || campaigns as any).map((campaign: any) => {
                const perf = (performance as any)?.find((p: any) => p.campaignId === campaign.id);
                const conversionRate = perf?.totalVisits
                  ? ((perf.totalApplications / perf.totalVisits) * 100).toFixed(2)
                  : "0.00";

                return (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{campaign.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {campaign.utmCampaign}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant="outline">{campaign.utmSource}</Badge>
                        <Badge variant="outline">{campaign.utmMedium}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>{perf?.totalVisits || 0}</TableCell>
                    <TableCell>{perf?.totalSignups || 0}</TableCell>
                    <TableCell>{perf?.totalApplications || 0}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50">
                        {conversionRate}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {campaign.budget ? `$${(campaign.budget / 100).toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generateTrackingUrl(campaign))}
                      >
                        Copy URL
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No campaigns yet. Create one to start tracking.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* UTM Guide */}
      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-3">UTM Parameter Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium mb-1">utm_source</p>
            <p className="text-muted-foreground">
              Identifies where traffic comes from (google, facebook, newsletter)
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">utm_medium</p>
            <p className="text-muted-foreground">
              Identifies the type of link (cpc, email, social, referral)
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">utm_campaign</p>
            <p className="text-muted-foreground">
              Identifies the specific campaign (summer_sale, launch)
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">utm_term (optional)</p>
            <p className="text-muted-foreground">
              Identifies paid search keywords
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">utm_content (optional)</p>
            <p className="text-muted-foreground">
              Differentiates similar content or links (banner_a, text_link)
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

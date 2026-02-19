import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreditCard,
  ArrowLeft,
  Plus,
  DollarSign,
  Ban,
  RefreshCw,
  User,
  Search,
  Shield,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

function AdminVirtualCards() {
  const [, navigate] = useLocation();
  const [issueDialog, setIssueDialog] = useState(false);
  const [addBalanceDialog, setAddBalanceDialog] = useState<{ open: boolean; cardId: number | null }>({ open: false, cardId: null });
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; cardId: number | null }>({ open: false, cardId: null });
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Issue form state
  const [issueForm, setIssueForm] = useState({
    userId: "",
    cardholderName: "",
    initialBalance: "",
    cardLabel: "",
    cardColor: "blue",
  });
  const [addBalanceAmount, setAddBalanceAmount] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const { data: user } = trpc.auth.me.useQuery();
  const { data: cards, isLoading, refetch } = trpc.virtualCards.adminListCards.useQuery(
    { status: filterStatus !== "all" ? filterStatus : undefined },
    { enabled: !!user && user.role === "admin" }
  );

  const issueCardMutation = trpc.virtualCards.issueCard.useMutation({
    onSuccess: (data) => {
      toast.success(`Card issued! Last 4: ${data.card.cardNumberLast4}`);
      setIssueDialog(false);
      setIssueForm({ userId: "", cardholderName: "", initialBalance: "", cardLabel: "", cardColor: "blue" });
      refetch();
    },
    onError: (err) => toast.error(err.message || "Failed to issue card"),
  });

  const addBalanceMutation = trpc.virtualCards.addBalance.useMutation({
    onSuccess: (data) => {
      toast.success(`Balance added! New balance: ${formatCurrency(data.newBalance / 100)}`);
      setAddBalanceDialog({ open: false, cardId: null });
      setAddBalanceAmount("");
      refetch();
    },
    onError: (err) => toast.error(err.message || "Failed to add balance"),
  });

  const cancelCardMutation = trpc.virtualCards.cancelCard.useMutation({
    onSuccess: () => {
      toast.success("Card cancelled successfully");
      setCancelDialog({ open: false, cardId: null });
      setCancelReason("");
      refetch();
    },
    onError: (err) => toast.error(err.message || "Failed to cancel card"),
  });

  const handleIssueCard = () => {
    if (!issueForm.userId || !issueForm.cardholderName) {
      toast.error("User ID and cardholder name are required");
      return;
    }
    issueCardMutation.mutate({
      userId: parseInt(issueForm.userId),
      cardholderName: issueForm.cardholderName,
      initialBalance: issueForm.initialBalance ? Math.round(parseFloat(issueForm.initialBalance) * 100) : 0,
      cardLabel: issueForm.cardLabel || undefined,
      cardColor: issueForm.cardColor || undefined,
    });
  };

  const handleAddBalance = () => {
    if (!addBalanceDialog.cardId || !addBalanceAmount) return;
    addBalanceMutation.mutate({
      cardId: addBalanceDialog.cardId,
      amount: Math.round(parseFloat(addBalanceAmount) * 100),
    });
  };

  const handleCancelCard = () => {
    if (!cancelDialog.cardId) return;
    cancelCardMutation.mutate({
      cardId: cancelDialog.cardId,
      reason: cancelReason || undefined,
    });
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Admin access required</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800 border-green-300",
    frozen: "bg-blue-100 text-blue-800 border-blue-300",
    expired: "bg-gray-100 text-gray-800 border-gray-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Admin
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Virtual Cards Management</h1>
              </div>
            </div>
            <Button onClick={() => setIssueDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Issue New Card
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-gray-500 mb-1">Total Cards</p>
              <p className="text-2xl font-bold">{cards?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-gray-500 mb-1">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {cards?.filter((c: any) => c.status === "active").length || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-gray-500 mb-1">Frozen</p>
              <p className="text-2xl font-bold text-blue-600">
                {cards?.filter((c: any) => c.status === "frozen").length || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-gray-500 mb-1">Total Balance</p>
              <p className="text-2xl font-bold">
                {formatCurrency((cards?.reduce((sum: number, c: any) => sum + (c.currentBalance || 0), 0) || 0) / 100)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 mb-6">
          <Label className="text-sm text-gray-500">Filter:</Label>
          {["all", "active", "frozen", "cancelled"].map(status => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
          <div className="ml-auto">
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="gap-1">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>
        </div>

        {/* Cards Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12 text-gray-400">Loading cards...</div>
            ) : !cards || cards.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No virtual cards issued yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Card</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">User ID</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Cardholder</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Balance</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Issued</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cards.map((card: any) => (
                      <tr key={card.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span className="font-mono">•••• {card.cardNumberLast4}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{card.cardLabel || "Debit Card"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-700">#{card.userId}</span>
                        </td>
                        <td className="px-4 py-3 font-medium">{card.cardholderName}</td>
                        <td className="px-4 py-3 font-mono font-medium">
                          {formatCurrency((card.currentBalance || 0) / 100)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={statusColors[card.status] || ""}>
                            {card.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(card.issuedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setAddBalanceDialog({ open: true, cardId: card.id }); }}
                              disabled={card.status === "cancelled"}
                              title="Add Balance"
                            >
                              <DollarSign className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setCancelDialog({ open: true, cardId: card.id }); }}
                              disabled={card.status === "cancelled"}
                              className="text-red-500 hover:text-red-700"
                              title="Cancel Card"
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Issue Card Dialog */}
      <Dialog open={issueDialog} onOpenChange={setIssueDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" /> Issue Virtual Debit Card
            </DialogTitle>
            <DialogDescription>
              Create a new virtual debit card for a user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="issue-userId">User ID *</Label>
              <Input
                id="issue-userId"
                type="number"
                placeholder="Enter user ID"
                value={issueForm.userId}
                onChange={(e) => setIssueForm({ ...issueForm, userId: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="issue-name">Cardholder Name *</Label>
              <Input
                id="issue-name"
                placeholder="Full name on card"
                value={issueForm.cardholderName}
                onChange={(e) => setIssueForm({ ...issueForm, cardholderName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="issue-balance">Initial Balance ($)</Label>
              <Input
                id="issue-balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={issueForm.initialBalance}
                onChange={(e) => setIssueForm({ ...issueForm, initialBalance: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="issue-label">Card Label</Label>
              <Input
                id="issue-label"
                placeholder="e.g. Personal Loan Card"
                value={issueForm.cardLabel}
                onChange={(e) => setIssueForm({ ...issueForm, cardLabel: e.target.value })}
              />
            </div>
            <div>
              <Label>Card Color</Label>
              <div className="flex gap-2 mt-1">
                {["blue", "black", "gold", "green", "purple"].map(color => (
                  <button
                    key={color}
                    onClick={() => setIssueForm({ ...issueForm, cardColor: color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      issueForm.cardColor === color ? "border-gray-900 scale-110" : "border-gray-200"
                    } ${
                      color === "blue" ? "bg-blue-600" :
                      color === "black" ? "bg-gray-900" :
                      color === "gold" ? "bg-amber-500" :
                      color === "green" ? "bg-emerald-600" :
                      "bg-purple-600"
                    }`}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueDialog(false)}>Cancel</Button>
            <Button
              onClick={handleIssueCard}
              disabled={issueCardMutation.isPending}
            >
              {issueCardMutation.isPending ? "Issuing..." : "Issue Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Balance Dialog */}
      <Dialog open={addBalanceDialog.open} onOpenChange={(open) => setAddBalanceDialog({ open, cardId: open ? addBalanceDialog.cardId : null })}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" /> Add Balance
            </DialogTitle>
            <DialogDescription>
              Load funds onto this virtual card.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="add-amount">Amount ($)</Label>
            <Input
              id="add-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={addBalanceAmount}
              onChange={(e) => setAddBalanceAmount(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddBalanceDialog({ open: false, cardId: null })}>Cancel</Button>
            <Button
              onClick={handleAddBalance}
              disabled={addBalanceMutation.isPending || !addBalanceAmount}
            >
              {addBalanceMutation.isPending ? "Adding..." : "Add Balance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Card Dialog */}
      <Dialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ open, cardId: open ? cancelDialog.cardId : null })}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="w-5 h-5" /> Cancel Card
            </DialogTitle>
            <DialogDescription>
              This action is permanent. The card will be deactivated immediately.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="cancel-reason">Reason (optional)</Label>
            <Input
              id="cancel-reason"
              placeholder="Reason for cancellation"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog({ open: false, cardId: null })}>Keep Card</Button>
            <Button
              variant="destructive"
              onClick={handleCancelCard}
              disabled={cancelCardMutation.isPending}
            >
              {cancelCardMutation.isPending ? "Cancelling..." : "Cancel Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminVirtualCards;

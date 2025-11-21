import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet, CheckCircle, Copy, Save } from "lucide-react";
import { toast } from "sonner";

export default function CryptoWalletSettings() {
  const [btcAddress, setBtcAddress] = useState("");
  const [ethAddress, setEthAddress] = useState("");
  const [usdtAddress, setUsdtAddress] = useState("");
  const [usdcAddress, setUsdcAddress] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: settings, isLoading, refetch } = trpc.adminCryptoWallet.get.useQuery();

  const updateMutation = trpc.adminCryptoWallet.update.useMutation({
    onSuccess: () => {
      toast.success("Crypto wallet addresses updated successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update wallet addresses");
    },
  });

  // Load settings into form when data arrives
  useEffect(() => {
    if (settings) {
      setBtcAddress(settings.btcAddress || "");
      setEthAddress(settings.ethAddress || "");
      setUsdtAddress(settings.usdtAddress || "");
      setUsdcAddress(settings.usdcAddress || "");
    }
  }, [settings]);

  const handleSave = () => {
    updateMutation.mutate({
      btcAddress: btcAddress.trim() || undefined,
      ethAddress: ethAddress.trim() || undefined,
      usdtAddress: usdtAddress.trim() || undefined,
      usdcAddress: usdcAddress.trim() || undefined,
    });
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Address copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Cryptocurrency Wallet Addresses
        </CardTitle>
        <CardDescription>
          Manage wallet addresses where users will send crypto payments for processing fees.
          These addresses will be displayed to users during payment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-amber-900 mb-2">⚠️ Important Security Notice</p>
          <p className="text-sm text-amber-800">
            Double-check all wallet addresses before saving. Incorrect addresses may result in lost funds.
            These addresses are visible to all users making crypto payments.
          </p>
        </div>

        <div className="space-y-6">
          {/* Bitcoin Address */}
          <div className="space-y-2">
            <Label htmlFor="btcAddress" className="text-base font-semibold flex items-center gap-2">
              <span className="text-orange-500">₿</span> Bitcoin (BTC) Address
            </Label>
            <div className="flex gap-2">
              <Input
                id="btcAddress"
                value={btcAddress}
                onChange={(e) => setBtcAddress(e.target.value)}
                placeholder="bc1q... (Enter your Bitcoin wallet address)"
                className="font-mono text-sm"
              />
              {btcAddress && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(btcAddress, "btc")}
                >
                  {copiedField === "btc" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">Native SegWit (bc1) or legacy address format supported</p>
          </div>

          {/* Ethereum Address */}
          <div className="space-y-2">
            <Label htmlFor="ethAddress" className="text-base font-semibold flex items-center gap-2">
              <span className="text-purple-500">⟠</span> Ethereum (ETH) Address
            </Label>
            <div className="flex gap-2">
              <Input
                id="ethAddress"
                value={ethAddress}
                onChange={(e) => setEthAddress(e.target.value)}
                placeholder="0x... (Enter your Ethereum wallet address)"
                className="font-mono text-sm"
              />
              {ethAddress && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(ethAddress, "eth")}
                >
                  {copiedField === "eth" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">ERC-20 compatible address (also receives USDT and USDC)</p>
          </div>

          {/* USDT Address */}
          <div className="space-y-2">
            <Label htmlFor="usdtAddress" className="text-base font-semibold flex items-center gap-2">
              <span className="text-green-500">₮</span> Tether (USDT) Address
            </Label>
            <div className="flex gap-2">
              <Input
                id="usdtAddress"
                value={usdtAddress}
                onChange={(e) => setUsdtAddress(e.target.value)}
                placeholder="0x... (Enter USDT wallet address or leave blank to use ETH address)"
                className="font-mono text-sm"
              />
              {usdtAddress && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(usdtAddress, "usdt")}
                >
                  {copiedField === "usdt" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              ERC-20 USDT address. If left blank, ETH address will be used.
            </p>
          </div>

          {/* USDC Address */}
          <div className="space-y-2">
            <Label htmlFor="usdcAddress" className="text-base font-semibold flex items-center gap-2">
              <span className="text-blue-500">$</span> USD Coin (USDC) Address
            </Label>
            <div className="flex gap-2">
              <Input
                id="usdcAddress"
                value={usdcAddress}
                onChange={(e) => setUsdcAddress(e.target.value)}
                placeholder="0x... (Enter USDC wallet address or leave blank to use ETH address)"
                className="font-mono text-sm"
              />
              {usdcAddress && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(usdcAddress, "usdc")}
                >
                  {copiedField === "usdc" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              ERC-20 USDC address. If left blank, ETH address will be used.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">💡 Tip</p>
          <p className="text-sm text-blue-800">
            Since USDT and USDC are ERC-20 tokens on Ethereum, you can use the same ETH address
            for all three currencies. Users will see these addresses when selecting crypto payment options.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="w-full"
          size="lg"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Wallet Addresses
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

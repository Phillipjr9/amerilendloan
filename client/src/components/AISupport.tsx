import { useState } from "react";
import { AIChatBox, type Message } from "./AIChatBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Package, Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Enhanced AI Support component with:
 * - A-Z customer support chat
 * - Application tracking without login
 * - Personalized service for authenticated users
 */
export function AISupport() {
  const { user } = useAuth();
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "track">("chat");

  // Tracking state
  const [trackingId, setTrackingId] = useState("");
  const [trackingEmail, setTrackingEmail] = useState("");
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Chat mutation
  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (result) => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.message,
        } as Message,
      ]);
      setIsLoading(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to get response");
      setIsLoading(false);
    },
  });

  // Tracking mutation
  const trackingMutation = trpc.ai.trackApplication.useMutation({
    onSuccess: (result: any) => {
      setTrackingResult(result.application);
      setIsTracking(false);
      toast.success("Application found!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Could not find application");
      setIsTracking(false);
    },
  });

  const handleSendChatMessage = (content: string) => {
    // Add user message
    setChatMessages((prev) => [
      ...prev,
      {
        role: "user",
        content,
      },
    ]);

    setIsLoading(true);

    // Check if message is about tracking
    if (
      content.toLowerCase().includes("track") ||
      content.toLowerCase().includes("status") ||
      content.toLowerCase().includes("application")
    ) {
      // Suggest switching to tracking tab
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I can help you track your application! To get the most accurate status, please use our Application Tracker tab where you can enter your Application ID and email address. This will give you real-time updates on your application status.",
        },
      ]);
      setIsLoading(false);
      // Auto-switch to tracking tab
      setActiveTab("track");
      return;
    }

    // Send chat message to AI
    chatMutation.mutate({
      messages: [
        ...chatMessages,
        {
          role: "user",
          content,
        },
      ],
    });
  };

  const handleTrackApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trackingId.trim() || !trackingEmail.trim()) {
      toast.error("Please enter both Application ID and email");
      return;
    }

    setIsTracking(true);
    trackingMutation.mutate({
      applicationId: trackingId,
      email: trackingEmail,
    });
  };

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chat" | "track")}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="chat" className="flex gap-2">
          <MessageCircle className="w-4 h-4" />
          Support
        </TabsTrigger>
        <TabsTrigger value="track" className="flex gap-2">
          <Package className="w-4 h-4" />
          Track Application
        </TabsTrigger>
      </TabsList>

      <TabsContent value="chat" className="mt-4">
        <AIChatBox
          messages={chatMessages}
          onSendMessage={handleSendChatMessage}
          isLoading={isLoading}
          isAuthenticated={!!user}
          suggestedPrompts={
            user
              ? [
                  "What's my loan status?",
                  "How do I make a payment?",
                  "Can I modify my application?",
                  "What are your fees?",
                ]
              : [
                  "How do I apply for a loan?",
                  "What are the eligibility requirements?",
                  "What loan amounts are available?",
                  "How long does approval take?",
                ]
          }
          height="500px"
        />
      </TabsContent>

      <TabsContent value="track" className="mt-4 p-4 bg-card rounded-lg border">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-4">Track Your Application</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enter your Application ID and email address to check your loan application status.
            </p>
          </div>

          <form onSubmit={handleTrackApplication} className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Application ID</label>
              <Input
                type="text"
                placeholder="e.g., APP-123456"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                disabled={isTracking}
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can find this in your confirmation email
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Email Address</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={trackingEmail}
                onChange={(e) => setTrackingEmail(e.target.value)}
                disabled={isTracking}
                defaultValue={user?.email || ""}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isTracking || !trackingId.trim() || !trackingEmail.trim()}
            >
              {isTracking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Tracking...
                </>
              ) : (
                "Track Application"
              )}
            </Button>
          </form>

          {trackingResult && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">Application Status</h4>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-semibold ml-2 capitalize text-blue-900">
                    {trackingResult.status}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground">Loan Amount:</span>
                  <span className="font-semibold ml-2 text-blue-900">
                    ${trackingResult.loanAmount?.toLocaleString() || "N/A"}
                  </span>
                </div>

                {trackingResult.createdAt && (
                  <div>
                    <span className="text-muted-foreground">Application Date:</span>
                    <span className="font-semibold ml-2 text-blue-900">
                      {new Date(trackingResult.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {trackingResult.nextSteps && trackingResult.nextSteps.length > 0 && (
                  <div>
                    <span className="text-muted-foreground block mb-2">Next Steps:</span>
                    <ul className="list-disc list-inside space-y-1 text-blue-900">
                      {trackingResult.nextSteps.map((step: string, idx: number) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {trackingResult.status === "approved" && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-green-900 text-sm font-semibold">
                    🎉 Congratulations! Your application has been approved. Log in to your dashboard to proceed with disbursement.
                  </p>
                </div>
              )}

              {trackingResult.status === "rejected" && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-900 text-sm">
                    Please contact us at{" "}
                    <span className="font-semibold">(800) 990-9130</span> for more information.
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => {
                  setTrackingResult(null);
                  setTrackingId("");
                  setTrackingEmail("");
                }}
              >
                Track Another Application
              </Button>
            </div>
          )}

          {!trackingResult && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
              <p className="text-amber-900 text-sm">
                <strong>Don't have your Application ID?</strong> Check your confirmation email or contact us at{" "}
                <span className="font-semibold">(800) 990-9130</span>
              </p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}

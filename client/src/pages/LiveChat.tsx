import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Loader2, Send, MessageCircle, Clock, User, Bot } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";

export default function LiveChat() {
  const utils = trpc.useUtils();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get or create active chat session
  const { data: session, isLoading: sessionLoading } = trpc.liveChat.getOrCreateSession.useQuery(undefined, {
    refetchInterval: 5000, // Poll every 5 seconds for status updates
  });

  // Get messages for the session
  const { data: messages, isLoading: messagesLoading } = trpc.liveChat.getMessages.useQuery(
    { sessionId: (session as any)?.id ?? 0 },
    {
      enabled: !!(session as any)?.id,
      refetchInterval: 2000, // Poll every 2 seconds for new messages
    }
  );

  // Send message mutation
  const sendMutation = trpc.liveChat.sendMessage.useMutation({
    onSuccess: () => {
      utils.liveChat.getMessages.invalidate();
      setMessage("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Could not send message.");
    },
  });

  // Close chat mutation
  const closeMutation = trpc.liveChat.closeSession.useMutation({
    onSuccess: () => {
      utils.liveChat.getOrCreateSession.invalidate();
      toast.success("This chat session has been closed.");
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && (session as any)?.id) {
      sendMutation.mutate({ sessionId: (session as any).id, message: message.trim() });
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <MessageCircle className="h-8 w-8" />
          Live Chat Support
        </h1>
        <p className="text-muted-foreground">
          Get instant help from our support team.
        </p>
      </div>

      <Card className="flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            {session?.status === "waiting" && (
              <Badge variant="outline" className="bg-yellow-50">
                <Clock className="h-3 w-3 mr-1" />
                Waiting for agent...
              </Badge>
            )}
            {session?.status === "active" && session.assignedToAgentId && (
              <Badge variant="outline" className="bg-green-50">
                <User className="h-3 w-3 mr-1" />
                Connected to agent
              </Badge>
            )}
            {session?.status === "closed" && (
              <Badge variant="outline" className="bg-gray-100">
                Chat Closed
              </Badge>
            )}
          </div>

          {session?.status !== "closed" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (session as any)?.id && closeMutation.mutate({ sessionId: (session as any).id })}
              disabled={closeMutation.isPending}
            >
              Close Chat
            </Button>
          )}
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messagesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : messages && messages.length > 0 ? (
              messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isFromUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      msg.isFromUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!msg.isFromUser && (
                        <div className="mt-0.5">
                          {msg.isFromBot ? (
                            <Bot className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.isFromUser
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatDistanceToNow(new Date(msg.createdAt), {
                            addSuffix: true,
                          })}
                          {msg.status === "read" && msg.isFromUser && " · Read"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        {session?.status !== "closed" ? (
          <form onSubmit={handleSend} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={sendMutation.isPending}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!message.trim() || sendMutation.isPending}
                size="icon"
              >
                {sendMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            {session?.status === "waiting" && (
              <p className="text-xs text-muted-foreground mt-2">
                An agent will be with you shortly. Average wait time: 2-5 minutes.
              </p>
            )}
          </form>
        ) : (
          <div className="p-4 border-t text-center">
            <p className="text-sm text-muted-foreground mb-3">
              This chat session has been closed.
            </p>
            <Button
              onClick={() => {
                utils.liveChat.getOrCreateSession.invalidate();
                window.location.reload();
              }}
            >
              Start New Chat
            </Button>
          </div>
        )}
      </Card>

      {/* Help Info */}
      <Card className="p-4 mt-6 bg-muted/50">
        <h3 className="font-semibold mb-2 text-sm">Chat Support Hours</h3>
        <p className="text-xs text-muted-foreground">
          Monday - Friday: 8:00 AM - 8:00 PM EST
          <br />
          Saturday - Sunday: 10:00 AM - 6:00 PM EST
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Outside of these hours, please submit a support ticket or send us an email.
        </p>
      </Card>
    </div>
  );
}

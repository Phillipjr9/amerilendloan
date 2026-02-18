import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Send, MessageCircle, Clock, User, CheckCircle2, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";

export default function AdminLiveChat() {
  const utils = trpc.useUtils();
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [cannedResponsesOpen, setCannedResponsesOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get all active chat sessions
  const { data: sessions, isLoading: sessionsLoading } = trpc.liveChat.getActiveSessions.useQuery(undefined, {
    refetchInterval: 5000,
  });

  // Get selected session details
  const { data: selectedSession } = trpc.liveChat.getSession.useQuery(
    { sessionId: selectedSessionId! },
    {
      enabled: !!selectedSessionId,
      refetchInterval: 5000,
    }
  );

  // Get messages for selected session
  const { data: messages } = trpc.liveChat.getMessages.useQuery(
    { sessionId: selectedSessionId! },
    {
      enabled: !!selectedSessionId,
      refetchInterval: 2000,
    }
  );

  // Get canned responses
  const { data: cannedResponses } = trpc.liveChat.getCannedResponses.useQuery();

  // Assign chat to self
  const assignMutation = trpc.liveChat.assignToAgent.useMutation({
    onSuccess: () => {
      utils.liveChat.getActiveSessions.invalidate();
      utils.liveChat.getSession.invalidate();
      toast.success("You are now handling this chat.");
    },
  });

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
      utils.liveChat.getActiveSessions.invalidate();
      setSelectedSessionId(null);
      toast.success("Chat session has been closed.");
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
    if (message.trim()) {
      sendMutation.mutate({
        sessionId: selectedSessionId!,
        message: message.trim(),
      });
    }
  };

  const handleCannedResponse = (text: string) => {
    setMessage(text);
    setCannedResponsesOpen(false);
  };

  if (sessionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <MessageCircle className="h-8 w-8" />
          Live Chat Dashboard
        </h1>
        <p className="text-muted-foreground">Manage active chat sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <Card className="lg:col-span-1">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Active Chats ({sessions?.length || 0})</h2>
          </div>
          <ScrollArea className="h-[600px]">
            <div className="p-4 space-y-2">
              {sessions && sessions.length > 0 ? (
                sessions.map((session: any) => (
                  <Card
                    key={session.id}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedSessionId === session.id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedSessionId(session.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium text-sm">
                          User #{session.userId}
                        </span>
                      </div>
                      {session.status === "waiting" && (
                        <Badge variant="outline" className="bg-yellow-50 text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Waiting
                        </Badge>
                      )}
                      {session.status === "active" && session.agentId && (
                        <Badge variant="outline" className="bg-green-50 text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Started {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                    </p>
                    {session.agentId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Assigned to: Agent #{session.agentId}
                      </p>
                    )}
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active chats</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2 flex flex-col h-[680px]">
          {selectedSessionId && selectedSession ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-semibold">User #{selectedSession.userId}</h3>
                    <p className="text-xs text-muted-foreground">
                      Session #{selectedSession.id}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {selectedSession.status === "waiting" && (
                    <Button
                      size="sm"
                      onClick={() => assignMutation.mutate({ sessionId: selectedSession.id })}
                      disabled={assignMutation.isPending}
                    >
                      {assignMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      Accept Chat
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => closeMutation.mutate({ sessionId: selectedSession.id })}
                    disabled={closeMutation.isPending}
                  >
                    Close Chat
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages && messages.length > 0 ? (
                    messages.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isFromUser ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            msg.isFromUser
                              ? "bg-muted"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.isFromUser
                                ? "text-muted-foreground"
                                : "text-primary-foreground/70"
                            }`}
                          >
                            {formatDistanceToNow(new Date(msg.createdAt), {
                              addSuffix: true,
                            })}
                            {msg.status === "read" && !msg.isFromUser && " · Read"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No messages yet</p>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              {selectedSession.status !== "closed" && (
                <form onSubmit={handleSend} className="p-4 border-t">
                  <div className="flex gap-2 mb-2">
                    <Dialog open={cannedResponsesOpen} onOpenChange={setCannedResponsesOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                          <Zap className="h-4 w-4 mr-2" />
                          Canned Responses
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Quick Responses</DialogTitle>
                          <DialogDescription>
                            Select a pre-written response to insert.
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[400px]">
                          <div className="space-y-2">
                            {cannedResponses?.map((response: any) => (
                              <Card
                                key={response.id}
                                className="p-3 cursor-pointer hover:bg-muted/50"
                                onClick={() => handleCannedResponse(response.content)}
                              >
                                <p className="font-medium text-sm mb-1">
                                  {response.title}
                                  {response.shortcut && (
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      /{response.shortcut}
                                    </Badge>
                                  )}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {response.content}
                                </p>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      disabled={sendMutation.isPending || selectedSession.status === "waiting"}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={!message.trim() || sendMutation.isPending || selectedSession.status === "waiting"}
                      size="icon"
                    >
                      {sendMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {selectedSession.status === "waiting" && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Accept this chat to start responding.
                    </p>
                  )}
                </form>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Select a chat session to view messages</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

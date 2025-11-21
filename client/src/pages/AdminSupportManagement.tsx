import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Search, Filter, Send, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: "payment" | "loan" | "kyc" | "technical" | "other";
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  lastUpdated: string;
  messages: TicketMessage[];
}

interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "user" | "support";
  message: string;
  sentAt: string;
}

export function AdminSupportManagement() {
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "in-progress" | "resolved">("open");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  // Mock data - replace with TRPC call
  const mockTickets: SupportTicket[] = [
    {
      id: "TKT-001",
      userId: "USR-001",
      userName: "John Smith",
      userEmail: "john.smith@example.com",
      subject: "Payment not processed",
      category: "payment",
      status: "in-progress",
      priority: "high",
      createdAt: "2024-01-20",
      lastUpdated: "2024-01-20",
      messages: [
        {
          id: "MSG-001",
          senderId: "USR-001",
          senderName: "John Smith",
          senderRole: "user",
          message: "I made a payment but it hasn't reflected in my account yet",
          sentAt: "2024-01-20 10:30",
        },
        {
          id: "MSG-002",
          senderId: "ADMIN-001",
          senderName: "Support Team",
          senderRole: "support",
          message: "We're looking into this. Can you provide your transaction ID?",
          sentAt: "2024-01-20 11:00",
        },
        {
          id: "MSG-003",
          senderId: "USR-001",
          senderName: "John Smith",
          senderRole: "user",
          message: "Sure, it's TXN-2024-001",
          sentAt: "2024-01-20 11:30",
        },
      ],
    },
    {
      id: "TKT-002",
      userId: "USR-002",
      userName: "Sarah Johnson",
      userEmail: "sarah.j@example.com",
      subject: "KYC document verification pending",
      category: "kyc",
      status: "open",
      priority: "medium",
      createdAt: "2024-01-19",
      lastUpdated: "2024-01-19",
      messages: [
        {
          id: "MSG-004",
          senderId: "USR-002",
          senderName: "Sarah Johnson",
          senderRole: "user",
          message: "How long does KYC verification usually take?",
          sentAt: "2024-01-19 14:00",
        },
      ],
    },
    {
      id: "TKT-003",
      userId: "USR-003",
      userName: "Michael Davis",
      userEmail: "m.davis@example.com",
      subject: "Loan application rejected",
      category: "loan",
      status: "resolved",
      priority: "high",
      createdAt: "2024-01-18",
      lastUpdated: "2024-01-19",
      messages: [
        {
          id: "MSG-005",
          senderId: "USR-003",
          senderName: "Michael Davis",
          senderRole: "user",
          message: "Why was my loan application rejected?",
          sentAt: "2024-01-18 09:00",
        },
        {
          id: "MSG-006",
          senderId: "ADMIN-001",
          senderName: "Support Team",
          senderRole: "support",
          message: "Your application was rejected due to KYC verification issues. Please resubmit with updated documents.",
          sentAt: "2024-01-18 10:00",
        },
        {
          id: "MSG-007",
          senderId: "USR-003",
          senderName: "Michael Davis",
          senderRole: "user",
          message: "Thank you, I'll resubmit my documents",
          sentAt: "2024-01-19 15:00",
        },
      ],
    },
  ];

  const filteredTickets = mockTickets.filter((ticket) => {
    if (filterStatus === "all") return true;
    return ticket.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-600">Open</Badge>;
      case "in-progress":
        return <Badge className="bg-yellow-600">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-600">Resolved</Badge>;
      case "closed":
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">{priority.toUpperCase()}</Badge>;
      case "medium":
        return <Badge className="bg-yellow-600">{priority.toUpperCase()}</Badge>;
      case "low":
        return <Badge variant="outline">{priority.toUpperCase()}</Badge>;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "payment":
        return "💳";
      case "loan":
        return "🏦";
      case "kyc":
        return "📄";
      case "technical":
        return "⚙️";
      default:
        return "📋";
    }
  };

  const handleReply = () => {
    if (replyMessage.trim() && selectedTicket) {
      const newMessage: TicketMessage = {
        id: `MSG-${Date.now()}`,
        senderId: "ADMIN-001",
        senderName: "Support Team",
        senderRole: "support",
        message: replyMessage,
        sentAt: new Date().toLocaleString(),
      };
      selectedTicket.messages.push(newMessage);
      setReplyMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Support Management</h1>
          </div>
          <p className="text-slate-400">Manage and respond to customer support tickets</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{mockTickets.length}</p>
                <p className="text-slate-400 text-sm">Total Tickets</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-400">
                  {mockTickets.filter((t) => t.status === "open").length}
                </p>
                <p className="text-slate-400 text-sm">Open</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">
                  {mockTickets.filter((t) => t.status === "in-progress").length}
                </p>
                <p className="text-slate-400 text-sm">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">
                  {mockTickets.filter((t) => t.status === "resolved").length}
                </p>
                <p className="text-slate-400 text-sm">Resolved</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket List */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Manage customer inquiries and issues</CardDescription>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400">No tickets found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="p-4 rounded-lg border border-slate-600 bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getCategoryIcon(ticket.category)}</span>
                          <h3 className="text-white font-semibold">{ticket.subject}</h3>
                          <code className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded">
                            {ticket.id}
                          </code>
                        </div>
                        <p className="text-slate-400 text-sm">
                          {ticket.userName} • {ticket.userEmail}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>Created: {ticket.createdAt}</span>
                      <span>•</span>
                      <MessageSquare className="w-3 h-3" />
                      <span>{ticket.messages.length} messages</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ticket Details */}
        {selectedTicket && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(selectedTicket.category)}</span>
                    {selectedTicket.subject}
                  </CardTitle>
                  <CardDescription>
                    {selectedTicket.userName} • {selectedTicket.userEmail}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Status</p>
                  <p className="text-white">{getStatusBadge(selectedTicket.status)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Priority</p>
                  <p className="text-white">{getPriorityBadge(selectedTicket.priority)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Created</p>
                  <p className="text-white text-sm">{selectedTicket.createdAt}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Last Updated</p>
                  <p className="text-white text-sm">{selectedTicket.lastUpdated}</p>
                </div>
              </div>

              {/* Messages */}
              <div>
                <h3 className="text-white font-semibold mb-4">Conversation</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedTicket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.senderRole === "user"
                          ? "bg-slate-700/30 border border-slate-600"
                          : "bg-blue-600/20 border border-blue-600/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium text-sm">{msg.senderName}</p>
                        <Badge variant="outline" className="text-xs">
                          {msg.senderRole === "user" ? "Customer" : "Support"}
                        </Badge>
                        <p className="text-xs text-slate-400">{msg.sentAt}</p>
                      </div>
                      <p className="text-slate-300 text-sm">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply */}
              {selectedTicket.status !== "closed" && (
                <div className="pt-4 border-t border-slate-600 space-y-3">
                  <Textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Write your reply here..."
                    className="bg-slate-700 border-slate-600 text-white min-h-20"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleReply}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!replyMessage.trim()}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedTicket(null)}
                      className="flex-1"
                    >
                      Save & Close Ticket
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default AdminSupportManagement;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, FileText, Download, Filter } from "lucide-react";
import { useState } from "react";

interface KYCVerification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: "approved" | "pending" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  documents: Document[];
  notes: string;
}

interface Document {
  id: string;
  type: "id" | "proof_of_address" | "income_verification" | "other";
  fileName: string;
  uploadedAt: string;
  status: "verified" | "pending" | "rejected";
  notes: string;
}

export function AdminKYCManagement() {
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedKYC, setSelectedKYC] = useState<KYCVerification | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  // Mock data - replace with TRPC call
  const mockKYCVerifications: KYCVerification[] = [
    {
      id: "KYC-001",
      userId: "USR-001",
      userName: "John Smith",
      userEmail: "john.smith@example.com",
      status: "pending",
      submittedAt: "2024-01-20",
      documents: [
        {
          id: "DOC-001",
          type: "id",
          fileName: "drivers_license.pdf",
          uploadedAt: "2024-01-20",
          status: "verified",
          notes: "Valid driver's license, no issues",
        },
        {
          id: "DOC-002",
          type: "proof_of_address",
          fileName: "utility_bill.pdf",
          uploadedAt: "2024-01-20",
          status: "pending",
          notes: "Needs manual review",
        },
      ],
      notes: "Awaiting address verification",
    },
    {
      id: "KYC-002",
      userId: "USR-002",
      userName: "Sarah Johnson",
      userEmail: "sarah.j@example.com",
      status: "approved",
      submittedAt: "2024-01-15",
      reviewedAt: "2024-01-17",
      documents: [
        {
          id: "DOC-003",
          type: "id",
          fileName: "passport.pdf",
          uploadedAt: "2024-01-15",
          status: "verified",
          notes: "Valid passport",
        },
        {
          id: "DOC-004",
          type: "proof_of_address",
          fileName: "lease_agreement.pdf",
          uploadedAt: "2024-01-15",
          status: "verified",
          notes: "Valid lease agreement",
        },
      ],
      notes: "All documents verified and approved",
    },
    {
      id: "KYC-003",
      userId: "USR-003",
      userName: "Michael Davis",
      userEmail: "m.davis@example.com",
      status: "rejected",
      submittedAt: "2024-01-18",
      reviewedAt: "2024-01-19",
      documents: [
        {
          id: "DOC-005",
          type: "id",
          fileName: "expired_id.pdf",
          uploadedAt: "2024-01-18",
          status: "rejected",
          notes: "ID is expired",
        },
      ],
      notes: "ID expired - user must resubmit with valid ID",
    },
  ];

  const filteredKYC = mockKYCVerifications.filter((kyc) => {
    if (filterStatus === "all") return true;
    return kyc.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-600 flex items-center gap-1 w-fit">
            <CheckCircle className="w-3 h-3" />
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-600 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const getDocumentBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-600 text-xs">Verified</Badge>;
      case "pending":
        return <Badge className="bg-yellow-600 text-xs">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="text-xs">Rejected</Badge>;
      default:
        return null;
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    return "📄";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">KYC Management</h1>
          </div>
          <p className="text-slate-400">Review and approve user identity verification</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{mockKYCVerifications.length}</p>
                <p className="text-slate-400 text-sm">Total Submissions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-400">
                  {mockKYCVerifications.filter((k) => k.status === "pending").length}
                </p>
                <p className="text-slate-400 text-sm">Pending Review</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">
                  {mockKYCVerifications.filter((k) => k.status === "approved").length}
                </p>
                <p className="text-slate-400 text-sm">Approved</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-400">
                  {mockKYCVerifications.filter((k) => k.status === "rejected").length}
                </p>
                <p className="text-slate-400 text-sm">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KYC List */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>KYC Submissions</CardTitle>
                <CardDescription>Review user identity verification documents</CardDescription>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredKYC.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400">No KYC submissions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredKYC.map((kyc) => (
                  <div
                    key={kyc.id}
                    onClick={() => setSelectedKYC(kyc)}
                    className="p-4 rounded-lg border border-slate-600 bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white font-semibold">{kyc.userName}</h3>
                        <p className="text-slate-400 text-sm">{kyc.userEmail}</p>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(kyc.status)}
                        {kyc.reviewedAt && (
                          <p className="text-xs text-slate-400">Reviewed: {kyc.reviewedAt}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>Submitted: {kyc.submittedAt}</span>
                      <span>•</span>
                      <span>{kyc.documents.length} documents</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* KYC Details */}
        {selectedKYC && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedKYC.userName}</CardTitle>
                  <CardDescription>{selectedKYC.userEmail}</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedKYC(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status */}
              <div>
                <h3 className="text-white font-semibold mb-3">Status</h3>
                <div className="flex gap-2">
                  {getStatusBadge(selectedKYC.status)}
                  <p className="text-slate-400 text-sm">
                    Submitted: {selectedKYC.submittedAt}
                    {selectedKYC.reviewedAt && ` • Reviewed: ${selectedKYC.reviewedAt}`}
                  </p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-white font-semibold mb-3">Documents</h3>
                <div className="space-y-3">
                  {selectedKYC.documents.map((doc) => (
                    <div key={doc.id} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getDocumentTypeIcon(doc.type)}</span>
                          <div>
                            <p className="text-white text-sm font-medium">{doc.fileName}</p>
                            <p className="text-xs text-slate-400">{doc.type.replace("_", " ")}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {getDocumentBadge(doc.status)}
                          <Button variant="ghost" size="sm" className="text-blue-400">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {doc.notes && (
                        <p className="text-xs text-slate-400 ml-10">Admin Notes: {doc.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <h3 className="text-white font-semibold mb-3">Admin Notes</h3>
                <textarea
                  value={adminNotes || selectedKYC.notes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
                  rows={4}
                  placeholder="Add notes about this KYC submission..."
                />
              </div>

              {/* Actions */}
              {selectedKYC.status === "pending" && (
                <div className="flex gap-2 pt-4 border-t border-slate-600">
                  <Button className="bg-green-600 hover:bg-green-700 flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button variant="destructive" className="flex-1">
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default AdminKYCManagement;

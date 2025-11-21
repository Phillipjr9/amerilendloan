import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, MoreVertical, Eye, Lock, Trash2, Users } from "lucide-react";
import { useState } from "react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  accountStatus: "active" | "suspended" | "pending";
  kycStatus: "approved" | "pending" | "rejected" | "not_started";
  loanCount: number;
  totalBorrowed: number;
  createdAt: string;
  lastLogin: string;
}

export function AdminUserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "suspended" | "pending">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Mock data - replace with TRPC call
  const mockUsers: User[] = [
    {
      id: "USR-001",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      phone: "(555) 123-4567",
      accountStatus: "active",
      kycStatus: "approved",
      loanCount: 2,
      totalBorrowed: 15000,
      createdAt: "2024-01-05",
      lastLogin: "2024-01-20",
    },
    {
      id: "USR-002",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.j@example.com",
      phone: "(555) 234-5678",
      accountStatus: "active",
      kycStatus: "approved",
      loanCount: 1,
      totalBorrowed: 5000,
      createdAt: "2024-01-10",
      lastLogin: "2024-01-19",
    },
    {
      id: "USR-003",
      firstName: "Michael",
      lastName: "Davis",
      email: "m.davis@example.com",
      phone: "(555) 345-6789",
      accountStatus: "pending",
      kycStatus: "pending",
      loanCount: 0,
      totalBorrowed: 0,
      createdAt: "2024-01-18",
      lastLogin: "2024-01-18",
    },
    {
      id: "USR-004",
      firstName: "Emily",
      lastName: "Wilson",
      email: "emily.w@example.com",
      phone: "(555) 456-7890",
      accountStatus: "suspended",
      kycStatus: "rejected",
      loanCount: 1,
      totalBorrowed: 8000,
      createdAt: "2024-01-02",
      lastLogin: "2024-01-10",
    },
  ];

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && user.accountStatus === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Active</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      case "pending":
        return <Badge className="bg-yellow-600">Pending</Badge>;
      default:
        return null;
    }
  };

  const getKYCBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-600">Verified</Badge>;
      case "pending":
        return <Badge className="bg-yellow-600">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "not_started":
        return <Badge variant="outline">Not Started</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">User Management</h1>
          </div>
          <p className="text-slate-400">Manage user accounts, KYC status, and account status</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{mockUsers.length}</p>
                <p className="text-slate-400 text-sm">Total Users</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">
                  {mockUsers.filter((u) => u.accountStatus === "active").length}
                </p>
                <p className="text-slate-400 text-sm">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-400">
                  {mockUsers.filter((u) => u.accountStatus === "pending").length}
                </p>
                <p className="text-slate-400 text-sm">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">
                  {mockUsers.filter((u) => u.kycStatus === "approved").length}
                </p>
                <p className="text-slate-400 text-sm">KYC Verified</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Users Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left text-white font-semibold py-3 px-4">User</th>
                      <th className="text-left text-white font-semibold py-3 px-4">Email</th>
                      <th className="text-left text-white font-semibold py-3 px-4">Phone</th>
                      <th className="text-left text-white font-semibold py-3 px-4">Status</th>
                      <th className="text-left text-white font-semibold py-3 px-4">KYC</th>
                      <th className="text-left text-white font-semibold py-3 px-4">Loans</th>
                      <th className="text-left text-white font-semibold py-3 px-4">Borrowed</th>
                      <th className="text-left text-white font-semibold py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-white font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-slate-400">{user.id}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{user.email}</td>
                        <td className="py-3 px-4 text-slate-300">{user.phone}</td>
                        <td className="py-3 px-4">{getStatusBadge(user.accountStatus)}</td>
                        <td className="py-3 px-4">{getKYCBadge(user.kycStatus)}</td>
                        <td className="py-3 px-4 text-white">{user.loanCount}</td>
                        <td className="py-3 px-4 text-white">${user.totalBorrowed.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-400 hover:text-blue-300"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {user.accountStatus === "active" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-yellow-400 hover:text-yellow-300"
                              >
                                <Lock className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
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

        {/* User Details */}
        {selectedUser && (
          <Card className="bg-slate-800 border-slate-700 mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </CardTitle>
                  <CardDescription>{selectedUser.email}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Status</p>
                  <p className="text-white">{getStatusBadge(selectedUser.accountStatus)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">KYC Status</p>
                  <p className="text-white">{getKYCBadge(selectedUser.kycStatus)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Active Loans</p>
                  <p className="text-white text-lg font-bold">{selectedUser.loanCount}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Total Borrowed</p>
                  <p className="text-white text-lg font-bold">${selectedUser.totalBorrowed.toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-600">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Account Created</p>
                  <p className="text-white">{selectedUser.createdAt}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Last Login</p>
                  <p className="text-white">{selectedUser.lastLogin}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-600 flex gap-2">
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setSelectedUser(null)}>
                  View Full Profile
                </Button>
                {selectedUser.accountStatus === "active" && (
                  <Button variant="outline" className="text-yellow-400 border-yellow-600 hover:bg-yellow-600/20">
                    Suspend Account
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default AdminUserManagement;

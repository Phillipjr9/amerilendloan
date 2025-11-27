import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Clock, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PaymentReminderAdmin() {
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");
  const [runStatus, setRunStatus] = useState<{ success?: boolean; reminders?: number; error?: string } | null>(null);
  const [testStatus, setTestStatus] = useState<{ success?: boolean; error?: string } | null>(null);

  // Get reminder logs
  const { data: logs, refetch: refetchLogs } = trpc.paymentReminders.getReminderLogs.useQuery({ limit: 50 });

  // Manually trigger reminder check
  const runCheck = trpc.paymentReminders.runReminderCheck.useMutation({
    onSuccess: (data) => {
      setRunStatus(data);
      refetchLogs();
    },
    onError: (error) => {
      setRunStatus({ success: false, error: error.message });
    },
  });

  // Send test reminder
  const sendTest = trpc.paymentReminders.sendTestReminder.useMutation({
    onSuccess: () => {
      setTestStatus({ success: true });
      refetchLogs();
    },
    onError: (error) => {
      setTestStatus({ success: false, error: error.message });
    },
  });

  const handleRunCheck = () => {
    setRunStatus(null);
    runCheck.mutate();
  };

  const handleSendTest = () => {
    if (!selectedLoanId || isNaN(Number(selectedLoanId))) {
      setTestStatus({ success: false, error: "Please enter a valid loan ID" });
      return;
    }
    setTestStatus(null);
    sendTest.mutate({ loanId: Number(selectedLoanId) });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Payment Reminder System
          </CardTitle>
          <CardDescription>
            Automated email reminders are sent daily at 9:00 AM EST for payments due in 7, 3, or 1 day(s), and for overdue payments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Manual Run */}
          <div className="space-y-2">
            <h3 className="font-semibold">Manual Reminder Check</h3>
            <p className="text-sm text-muted-foreground">
              Run the payment reminder check immediately (normally runs daily at 9:00 AM EST).
            </p>
            <Button
              onClick={handleRunCheck}
              disabled={runCheck.isPending}
              className="w-full sm:w-auto"
            >
              {runCheck.isPending ? "Running..." : "Run Reminder Check Now"}
            </Button>

            {runStatus && (
              <Alert className={runStatus.success ? "border-green-500" : "border-red-500"}>
                {runStatus.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription>
                  {runStatus.success
                    ? `Success! Sent ${runStatus.reminders || 0} reminder(s).`
                    : `Error: ${runStatus.error}`}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Test Reminder */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="font-semibold">Send Test Reminder</h3>
            <p className="text-sm text-muted-foreground">
              Send a test payment reminder email for a specific loan (3-day reminder).
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Loan ID"
                value={selectedLoanId}
                onChange={(e) => setSelectedLoanId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                onClick={handleSendTest}
                disabled={sendTest.isPending || !selectedLoanId}
                className="whitespace-nowrap"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendTest.isPending ? "Sending..." : "Send Test"}
              </Button>
            </div>

            {testStatus && (
              <Alert className={testStatus.success ? "border-green-500" : "border-red-500"}>
                {testStatus.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription>
                  {testStatus.success
                    ? "Test reminder sent successfully!"
                    : `Error: ${testStatus.error}`}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reminder Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reminder Logs</CardTitle>
          <CardDescription>
            Last {logs?.length || 0} payment reminders sent
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!logs || logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No reminders sent yet.
            </p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Loan #{log.loanApplicationId}</span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          log.reminderType === "overdue"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {log.reminderType === "overdue" ? (
                          <>
                            {Math.abs(log.daysUntilDue)} day{Math.abs(log.daysUntilDue) !== 1 ? "s" : ""} overdue
                          </>
                        ) : (
                          <>
                            {log.daysUntilDue} day{log.daysUntilDue !== 1 ? "s" : ""} until due
                          </>
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sent: {new Date(log.sentAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

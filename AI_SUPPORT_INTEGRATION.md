/**
 * AI Support Integration Guide
 * 
 * This guide explains how to integrate the AI support system
 * with your pages for comprehensive customer assistance
 */

// Example 1: Basic Integration in a Dashboard Page
// ================================================

import { useState } from "react";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export function AISupport() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();
  
  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.message,
        },
      ]);
    },
    onError: (error) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I encountered an error: ${error.message}. Please try again or contact support at (800) 990-9130.`,
        },
      ]);
    },
  });

  const handleSendMessage = (content: string) => {
    // Add user message to display
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content,
      },
    ]);

    // Send to AI support
    chatMutation.mutate({
      messages: [
        ...messages,
        {
          role: "user",
          content,
        },
      ],
    });
  };

  return (
    <div className="w-full max-w-2xl">
      <AIChatBox
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={chatMutation.isPending}
        isAuthenticated={!!user}
        height="500px"
        placeholder={
          user
            ? "Ask about your account or any AmeriLend services..."
            : "Ask me anything about AmeriLend loans..."
        }
      />
    </div>
  );
}

// Example 2: Floating Chat Widget
// ==============================

export function FloatingAISupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.message,
        },
      ]);
    },
  });

  const handleSendMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content,
      },
    ]);

    chatMutation.mutate({
      messages: [
        ...messages,
        {
          role: "user",
          content,
        },
      ],
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-96 shadow-2xl rounded-lg">
          <AIChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={chatMutation.isPending}
            isAuthenticated={!!user}
            height="400px"
          />
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#0033A0] hover:bg-[#002080] text-white rounded-full p-4 shadow-lg transition-all"
        title="AI Support Assistant"
      >
        💬
      </button>
    </div>
  );
}

// Example 3: Support Page with Resources
// =======================================

export function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();

  const { data: resources } = trpc.ai.getResources.useQuery();

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.message,
        },
      ]);
    },
  });

  const handleSendMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content,
      },
    ]);

    chatMutation.mutate({
      messages: [
        ...messages,
        {
          role: "user",
          content,
        },
      ],
    });
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 p-6">
      {/* AI Chat Section */}
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-4">AI Support Assistant</h2>
        <AIChatBox
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={chatMutation.isPending}
          isAuthenticated={!!user}
          height="600px"
          emptyStateMessage="Have a question? Start typing to get instant help!"
        />
      </div>

      {/* Resources Sidebar */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Contact Support</h3>
          <div className="space-y-3">
            {resources?.contactOptions.map((option, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <p className="font-medium text-sm">{option.method}</p>
                <p className="text-primary font-semibold">{option.value}</p>
                <p className="text-xs text-gray-600">{option.availability}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Common Questions</h3>
          <div className="space-y-2">
            {resources?.faqs.slice(0, 2).map((faq, idx) => (
              <div key={idx} className="border-l-2 border-primary pl-3">
                <p className="font-medium text-sm text-gray-700">{faq.category}</p>
                {faq.questions.slice(0, 2).map((q, qIdx) => (
                  <p
                    key={qIdx}
                    className="text-xs text-gray-600 hover:text-primary cursor-pointer"
                  >
                    • {q}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * KEY FEATURES
 * ============
 * 
 * 1. AUTHENTICATION-AWARE
 *    - Authenticated users get personalized assistance
 *    - Account status and loan information visible to AI
 *    - Priority support indicator for logged-in users
 * 
 * 2. COMPREHENSIVE A-Z SUPPORT
 *    - Application guidance
 *    - Account management
 *    - Payment help
 *    - Eligibility questions
 *    - Technical troubleshooting
 *    - And 20+ more topics
 * 
 * 3. CONTEXT-AWARE RESPONSES
 *    - AI knows user's loan status
 *    - Personalized recommendations
 *    - References previous messages
 *    - Suggests relevant topics
 * 
 * 4. MULTI-PLATFORM
 *    - Full page chat
 *    - Floating widget
 *    - Mobile responsive
 *    - Accessible
 * 
 * IMPLEMENTATION CHECKLIST
 * ========================
 * 
 * ✓ Import AIChatBox component
 * ✓ Import trpc.ai.chat mutation
 * ✓ Set up state for messages
 * ✓ Handle send message callback
 * ✓ Pass isAuthenticated prop
 * ✓ Customize placeholder text
 * ✓ Style with Tailwind classes
 * ✓ Add error handling
 * ✓ Test with authenticated user
 * ✓ Test with public user
 */

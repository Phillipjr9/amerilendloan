import React, { useState } from "react";
import { X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function MobileDrawer({ isOpen, onClose, children, title }: MobileDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-64px)]">
          {children}
        </div>
      </div>
    </>
  );
}

interface MobileNavTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
  }>;
  defaultTab?: string;
}

export function MobileNavTabs({ tabs, defaultTab }: MobileNavTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const activeTabData = tabs.find((t) => t.id === activeTab);

  return (
    <div className="flex flex-col h-full">
      {/* Mobile header with drawer toggle */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-semibold">{activeTabData?.label}</h3>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer for tab selection */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Navigation"
      >
        <div className="p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsDrawerOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#0A2540] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </MobileDrawer>

      {/* Desktop tabs */}
      <div className="hidden md:flex border-b bg-white sticky top-0 z-30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-[#0A2540] text-[#0A2540]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {tabs.find((t) => t.id === activeTab)?.content}
      </div>
    </div>
  );
}

export function TouchFriendlyButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg transition-all ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface AccordionItemProps {
  title: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function AccordionItem({ title, isOpen, onClick, children }: AccordionItemProps) {
  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between min-h-[48px] px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-left">{title}</span>
        <span
          className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-4 py-3 bg-gray-50 border-t">
          {children}
        </div>
      )}
    </div>
  );
}

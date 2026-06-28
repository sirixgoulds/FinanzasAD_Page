"use client";

import { Suspense } from "react";
import { AppShell, type TabId } from "@/components/app-shell";
import { Dashboard } from "@/components/finance/dashboard";
import { NewTransactionForm } from "@/components/finance/new-transaction-form";
import { TransactionList } from "@/components/finance/transaction-list";
import { Reminders } from "@/components/finance/reminders";
import { CoupleDashboard } from "@/components/finance/couple-dashboard";
import { Charts } from "@/components/finance/charts";
import { Settings } from "@/components/finance/settings";
import { ToolsShell } from "@/components/tools/tools-shell";

export default function Home() {
  // App estática (sin backend ni auth)
  return (
    <AppShell>
      {({ activeTab, setActiveTab }) => {
        switch (activeTab) {
          case "dashboard":
            return <Dashboard />;
          case "couple":
            return <CoupleDashboard />;
          case "new":
            return (
              <NewTransactionForm onDone={(t: TabId) => setActiveTab(t)} />
            );
          case "transactions":
            return <TransactionList />;
          case "charts":
            return <Charts />;
          case "tools":
            return (
              <ToolsShell
                onNavigateToReminders={() => setActiveTab("reminders")}
              />
            );
          case "reminders":
            return <Reminders />;
          case "settings":
            return <Settings />;
          default:
            return <Dashboard />;
        }
      }}
    </AppShell>
  );
}

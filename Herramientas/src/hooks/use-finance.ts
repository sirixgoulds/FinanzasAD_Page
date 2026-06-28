"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  transactionsApi,
  goalsApi,
  remindersApi,
  dashboardApi,
  seedApi,
  userApi,
  chartsApi,
  receiptsApi,
} from "@/lib/api";
import type {
  Transaction,
  Goal,
  Reminder,
  UserSettings,
  TransactionOwner,
} from "@/lib/types";

/**
 * Hooks de TanStack Query para datos financieros.
 * - staleTime generoso (60s) para evitar refetches innecesarios.
 * - Invalidación selectiva: al mutar transactions también invalida dashboard
 *   (porque los agregados cambian), pero NO invalida goals/reminders.
 */

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  transactions: ["transactions"] as const,
  transactionsFiltered: (type?: string, owner?: string) =>
    ["transactions", { type, owner }] as const,
  goals: ["goals"] as const,
  reminders: ["reminders"] as const,
  settings: ["settings"] as const,
  charts: ["charts"] as const,
};

// ============ Dashboard ============

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: dashboardApi.get,
    staleTime: 60 * 1000,
  });
}

// ============ Transactions ============

export function useTransactions(params?: { type?: string; owner?: string }) {
  return useQuery({
    queryKey: queryKeys.transactionsFiltered(params?.type, params?.owner),
    queryFn: () => transactionsApi.list(params),
    staleTime: 60 * 1000,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.create,
    onSuccess: () => {
      // Invalida todas las queries de transactions + dashboard
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Transaction> }) =>
      transactionsApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

// ============ Goals ============

export function useGoals() {
  return useQuery({
    queryKey: queryKeys.goals,
    queryFn: goalsApi.list,
    staleTime: 60 * 1000,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: goalsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.goals });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<Goal> & { addAmount?: number };
    }) => goalsApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.goals });
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: goalsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.goals });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

// ============ Reminders ============

export function useReminders() {
  return useQuery({
    queryKey: queryKeys.reminders,
    queryFn: remindersApi.list,
    staleTime: 60 * 1000,
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: remindersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.reminders });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: remindersApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.reminders });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

// ============ Seed ============

export function useSeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: seedApi.load,
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
}

// ============ User Settings ============

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: userApi.getSettings,
    staleTime: 5 * 60 * 1000, // 5 min — los settings cambian poco
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<UserSettings>) => userApi.updateSettings(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings });
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings });
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: userApi.updatePassword,
  });
}

// ============ Charts ============

export function useCharts() {
  return useQuery({
    queryKey: queryKeys.charts,
    queryFn: chartsApi.get,
    staleTime: 60 * 1000,
  });
}

// ============ Receipts (VLM) ============

export function useScanReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ image, owner }: { image: string; owner?: TransactionOwner }) =>
      receiptsApi.scan(image, owner),
    onSuccess: () => {
      // No invalidamos nada acá porque el scan NO crea la transacción.
      // La invalidación ocurre al guardar la transacción confirmada.
    },
  });
}


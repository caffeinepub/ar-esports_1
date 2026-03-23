import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TeamInfo, TournamentId, UserProfile } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useListTournaments() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTournaments();
    },
    enabled: !!actor,
    refetchInterval: 5000,
  });
}

export function useGetCallerProfile() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !!identity,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useCheckDuplicate(tournamentId: TournamentId) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["duplicate", tournamentId],
    queryFn: async () => {
      if (!actor || !identity) return false;
      try {
        return await actor.checkDuplicateRegistration(tournamentId);
      } catch {
        return false;
      }
    },
    enabled: !!actor && !!identity && !!tournamentId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: false,
  });
}

export function useRegisterTournament() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tournamentId,
      team,
    }: { tournamentId: TournamentId; team: TeamInfo }) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerTournament(tournamentId, team);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["duplicate"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["paymentStatus"] });
    },
  });
}

export function useGetPaymentStatus(tournamentId: TournamentId) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["paymentStatus", tournamentId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPaymentStatus(tournamentId);
    },
    enabled: !!actor && !!identity && !!tournamentId,
  });
}

export function useGetUserHistory() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserHistory();
    },
    enabled: !!actor && !!identity,
  });
}

export function useIsCallerAdmin() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor,
  });
}

export function useGetAllUsers() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllUsers();
      return result;
    },
    enabled: !!actor,
    refetchInterval: 5000,
    retry: 3,
  });
}

export function useGetAllRegistrations() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["allRegistrations"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllRegistrations();
      return result;
    },
    enabled: !!actor,
    refetchInterval: 5000,
    retry: 3,
  });
}

export function useGetAllPaymentRequests() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["allPayments"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllPaymentRequests();
      return result;
    },
    enabled: !!actor,
    refetchInterval: 5000,
    retry: 3,
  });
}

export function useApprovePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      tournamentId,
    }: { userId: Principal; tournamentId: TournamentId }) => {
      if (!actor) throw new Error("Not connected");
      return actor.approvePayment(userId, tournamentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPayments"] });
      queryClient.invalidateQueries({ queryKey: ["allRegistrations"] });
    },
  });
}

export function useRejectPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      tournamentId,
    }: { userId: Principal; tournamentId: TournamentId }) => {
      if (!actor) throw new Error("Not connected");
      return actor.rejectPayment(userId, tournamentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPayments"] });
    },
  });
}

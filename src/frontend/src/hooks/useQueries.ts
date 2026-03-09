import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TeamInfo, TournamentId, UserProfile } from "../backend";
import { useActor } from "./useActor";

export function useListTournaments() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTournaments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
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
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["duplicate", tournamentId],
    queryFn: async () => {
      if (!actor) return false;
      return actor.checkDuplicateRegistration(tournamentId);
    },
    enabled: !!actor && !isFetching && !!tournamentId,
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
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["paymentStatus", tournamentId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPaymentStatus(tournamentId);
    },
    enabled: !!actor && !isFetching && !!tournamentId,
  });
}

export function useGetUserHistory() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllRegistrations() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allRegistrations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRegistrations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPaymentRequests() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allPayments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPaymentRequests();
    },
    enabled: !!actor && !isFetching,
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

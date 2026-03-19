import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ActivityType, Environment, WorkLogEntry } from "../backend.d";
import { useActor } from "./useActor";

export function useActivityTypes() {
  const { actor, isFetching } = useActor();
  return useQuery<ActivityType[]>({
    queryKey: ["activityTypes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActivityTypes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useEnvironments() {
  const { actor, isFetching } = useActor();
  return useQuery<Environment[]>({
    queryKey: ["environments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEnvironments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyWorkLogEntries(startDate: string, endDate: string) {
  const { actor, isFetching } = useActor();
  return useQuery<WorkLogEntry[]>({
    queryKey: ["myWorkLogs", startDate, endDate],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyWorkLogEntries(startDate, endDate);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllTeamWorkLogs(
  startDate: string,
  endDate: string,
  member: Principal | null,
  activityTypeId: bigint | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<WorkLogEntry[]>({
    queryKey: [
      "teamWorkLogs",
      startDate,
      endDate,
      member?.toString(),
      activityTypeId?.toString(),
    ],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTeamWorkLogEntries(
        startDate,
        endDate,
        member,
        activityTypeId,
      );
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateWorkLogEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      activityTypeId,
      environmentIds,
      notes,
      date,
    }: {
      activityTypeId: bigint;
      environmentIds: bigint[];
      notes: string | null;
      date: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createWorkLogEntry(
        activityTypeId,
        environmentIds,
        notes,
        date,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myWorkLogs"] });
      qc.invalidateQueries({ queryKey: ["teamWorkLogs"] });
    },
  });
}

export function useDeleteWorkLogEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteWorkLogEntry(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myWorkLogs"] });
      qc.invalidateQueries({ queryKey: ["teamWorkLogs"] });
    },
  });
}

export function useCreateActivityType() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.createActivityType(name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activityTypes"] }),
  });
}

export function useCreateEnvironment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.createEnvironment(name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["environments"] }),
  });
}

export function useUpdateActivityType() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: bigint; name: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateActivityType(id, name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activityTypes"] }),
  });
}

export function useUpdateEnvironment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: bigint; name: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateEnvironment(id, name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["environments"] }),
  });
}

export function useDeleteActivityType() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteActivityType(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activityTypes"] }),
  });
}

export function useDeleteEnvironment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteEnvironment(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["environments"] }),
  });
}

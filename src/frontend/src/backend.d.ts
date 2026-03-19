import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface WorkLogEntry {
    id: bigint;
    date: string;
    user: Principal;
    environmentIds: Array<bigint>;
    notes?: string;
    timestamp: Time;
    activityTypeId: bigint;
}
export interface Environment {
    id: bigint;
    name: string;
}
export type Time = bigint;
export interface ActivityType {
    id: bigint;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createActivityType(name: string): Promise<bigint>;
    createEnvironment(name: string): Promise<bigint>;
    createWorkLogEntry(activityTypeId: bigint, environmentIds: Array<bigint>, notes: string | null, date: string): Promise<bigint>;
    deleteActivityType(id: bigint): Promise<void>;
    deleteEnvironment(id: bigint): Promise<void>;
    deleteWorkLogEntry(id: bigint): Promise<void>;
    getActivityTypeStats(user: Principal, date: string): Promise<Array<[bigint, bigint]>>;
    getActivityTypes(): Promise<Array<ActivityType>>;
    getAllTeamWorkLogEntries(startDate: string, endDate: string, member: Principal | null, activityTypeId: bigint | null): Promise<Array<WorkLogEntry>>;
    getCallerUserRole(): Promise<UserRole>;
    getEnvironments(): Promise<Array<Environment>>;
    getMyWorkLogEntries(startDate: string, endDate: string): Promise<Array<WorkLogEntry>>;
    isCallerAdmin(): Promise<boolean>;
    updateActivityType(id: bigint, name: string): Promise<void>;
    updateEnvironment(id: bigint, name: string): Promise<void>;
}

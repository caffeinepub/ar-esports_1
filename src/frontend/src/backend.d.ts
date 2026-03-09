import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TournamentRegistration {
    teamInfo: TeamInfo;
    userId: Principal;
    timestamp: Time;
    tournamentId: TournamentId;
}
export type Time = bigint;
export interface TeamInfo {
    members: Array<TeamMember>;
    teamLeaderInsta: InstagramID;
    teamLeaderUPI: UPI;
}
export interface Tournament {
    id: TournamentId;
    tournamentType: TournamentType;
    entryFee: bigint;
    prize: bigint;
    timeSlot: Time;
}
export type TournamentId = string;
export type PhoneNumber = string;
export type UPI = string;
export type FFUID = bigint;
export interface TeamMember {
    age: bigint;
    email: string;
    gameName: string;
    phoneNumber: PhoneNumber;
    ffUID: FFUID;
}
export interface PaymentRequest {
    status: PaymentStatus;
    userId: Principal;
    timestamp: Time;
    tournamentId: TournamentId;
}
export type InstagramID = string;
export interface UserProfile {
    age: bigint;
    name: string;
    email: string;
    gameName: string;
    phoneNumber: PhoneNumber;
    ffUID: FFUID;
}
export enum PaymentStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum TournamentType {
    duo = "duo",
    squad = "squad"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approvePayment(userId: Principal, tournamentId: TournamentId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkDuplicateRegistration(tournamentId: TournamentId): Promise<boolean>;
    createTournament(id: TournamentId, tournamentType: TournamentType, timeSlot: Time, entryFee: bigint, prize: bigint): Promise<void>;
    getAllPaymentRequests(): Promise<Array<PaymentRequest>>;
    getAllRegistrations(): Promise<Array<TournamentRegistration>>;
    getAllUsers(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPaymentStatus(tournamentId: TournamentId): Promise<PaymentStatus>;
    getUserHistory(): Promise<Array<TournamentRegistration>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listTournaments(): Promise<Array<Tournament>>;
    registerTournament(tournamentId: TournamentId, team: TeamInfo): Promise<string>;
    rejectPayment(userId: Principal, tournamentId: TournamentId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}

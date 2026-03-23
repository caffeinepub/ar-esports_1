import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  type TournamentType = { #duo; #squad };
  type TournamentId = Text;
  type UPI = Text;
  type InstagramID = Text;
  type FFUID = Nat;
  type PhoneNumber = Text;

  public type UserProfile = {
    name : Text;
    email : Text;
    age : Nat;
    ffUID : FFUID;
    gameName : Text;
    phoneNumber : PhoneNumber;
  };

  public type TeamMember = {
    ffUID : FFUID;
    gameName : Text;
    phoneNumber : PhoneNumber;
    email : Text;
    age : Nat;
  };

  public type TeamInfo = {
    members : [TeamMember];
    teamLeaderUPI : UPI;
    teamLeaderInsta : InstagramID;
  };

  public type TournamentRegistration = {
    tournamentId : TournamentId;
    userId : Principal;
    teamInfo : TeamInfo;
    timestamp : Time.Time;
  };

  public type PaymentStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type PaymentRequest = {
    userId : Principal;
    tournamentId : TournamentId;
    status : PaymentStatus;
    timestamp : Time.Time;
  };

  public type Tournament = {
    id : TournamentId;
    tournamentType : TournamentType;
    timeSlot : Time.Time;
    entryFee : Nat;
    prize : Nat;
  };

  module Tournament {
    public func compare(a : Tournament, b : Tournament) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  // IST offset: UTC+5:30 = 19800 seconds = 19_800_000_000_000 nanoseconds
  // Adding IST offset before dividing makes day reset at midnight IST (12:00 AM IST)
  let IST_OFFSET_NS : Int = 19_800_000_000_000;
  let DAY_NS : Int = 86_400_000_000_000;

  // Compute IST day number from nanosecond timestamp
  func istDay(timestampNs : Time.Time) : Int {
    (timestampNs + IST_OFFSET_NS) / DAY_NS;
  };

  // Registration key resets daily at midnight IST
  func makeRegistrationKey(userId : Principal, tournamentId : TournamentId, timestampNs : Time.Time) : Text {
    userId.toText() # "|" # tournamentId # "|" # istDay(timestampNs).toText();
  };

  // Payment key also day-based (midnight IST reset)
  func makePaymentKey(userId : Principal, tournamentId : TournamentId, timestampNs : Time.Time) : Text {
    userId.toText() # "|" # tournamentId # "|pay|" # istDay(timestampNs).toText();
  };

  // Stable State
  var userProfilesStable : [(Principal, UserProfile)] = [];
  var tournamentsStable : [(TournamentId, Tournament)] = [];
  var tournamentRegistrationsStable : [(Text, TournamentRegistration)] = [];
  var paymentRequestsStable : [(Text, PaymentRequest)] = [];

  // In-memory state
  let userProfiles = Map.fromIter<Principal, UserProfile>(userProfilesStable.vals());
  let tournaments = Map.fromIter<TournamentId, Tournament>(tournamentsStable.vals());
  let tournamentRegistrations = Map.fromIter<Text, TournamentRegistration>(tournamentRegistrationsStable.vals());
  let paymentRequests = Map.fromIter<Text, PaymentRequest>(paymentRequestsStable.vals());

  system func preupgrade() {
    userProfilesStable := userProfiles.entries().toArray();
    tournamentsStable := tournaments.entries().toArray();
    tournamentRegistrationsStable := tournamentRegistrations.entries().toArray();
    paymentRequestsStable := paymentRequests.entries().toArray();
  };

  system func postupgrade() {
    userProfilesStable := [];
    tournamentsStable := [];
    tournamentRegistrationsStable := [];
    paymentRequestsStable := [];
    seedTournamentsIfEmpty();
  };

  func seedTournamentsIfEmpty() {
    if (tournaments.size() == 0) {
      let defaultTournaments : [(TournamentId, Tournament)] = [
        ("duo-11", { id = "duo-11"; tournamentType = #duo; timeSlot = 11; entryFee = 30; prize = 50 }),
        ("duo-16", { id = "duo-16"; tournamentType = #duo; timeSlot = 16; entryFee = 30; prize = 50 }),
        ("squad-13", { id = "squad-13"; tournamentType = #squad; timeSlot = 13; entryFee = 40; prize = 65 }),
        ("squad-20", { id = "squad-20"; tournamentType = #squad; timeSlot = 20; entryFee = 40; prize = 65 }),
      ];
      for ((id, t) in defaultTournaments.vals()) {
        tournaments.add(id, t);
      };
    };
  };

  seedTournamentsIfEmpty();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createTournament(id : TournamentId, tournamentType : TournamentType, timeSlot : Time.Time, entryFee : Nat, prize : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create tournaments");
    };
    let tournament : Tournament = {
      id;
      tournamentType;
      timeSlot;
      entryFee;
      prize;
    };
    tournaments.add(id, tournament);
  };

  public query ({ caller }) func listTournaments() : async [Tournament] {
    tournaments.values().toArray().sort();
  };

  public shared ({ caller }) func registerTournament(tournamentId : TournamentId, team : TeamInfo) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register for tournaments");
    };

    switch (tournaments.get(tournamentId)) {
      case (null) {
        Runtime.trap("Tournament does not exist");
      };
      case (?tournament) {
        let expectedSize = switch (tournament.tournamentType) {
          case (#duo) 2;
          case (#squad) 4;
        };
        
        if (team.members.size() != expectedSize) {
          Runtime.trap("Invalid team size for tournament type");
        };

        let now = Time.now();
        let registrationKey = makeRegistrationKey(caller, tournamentId, now);
        
        switch (tournamentRegistrations.get(registrationKey)) {
          case (?_) {
            Runtime.trap("You have already registered for this tournament today");
          };
          case (null) {
            let registration = {
              tournamentId;
              userId = caller;
              teamInfo = team;
              timestamp = now;
            };
            tournamentRegistrations.add(registrationKey, registration);

            let paymentKey = makePaymentKey(caller, tournamentId, now);
            let paymentRequest = {
              userId = caller;
              tournamentId;
              status = #pending;
              timestamp = now;
            };
            paymentRequests.add(paymentKey, paymentRequest);

            "Registration successful. Pending payment approval.";
          };
        };
      };
    };
  };

  // Find the most recent payment request for a user+tournament
  func findLatestPayment(userId : Principal, tournamentId : TournamentId) : ?(Text, PaymentRequest) {
    var result : ?(Text, PaymentRequest) = null;
    for ((k, req) in paymentRequests.entries()) {
      if (req.userId == userId and req.tournamentId == tournamentId) {
        switch (result) {
          case (null) { result := ?(k, req); };
          case (?(_, prev)) {
            if (req.timestamp > prev.timestamp) {
              result := ?(k, req);
            };
          };
        };
      };
    };
    result;
  };

  public query ({ caller }) func getPaymentStatus(tournamentId : TournamentId) : async PaymentStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check payment status");
    };

    switch (findLatestPayment(caller, tournamentId)) {
      case (null) { Runtime.trap("Payment request does not exist"); };
      case (?(_, req)) { req.status; };
    };
  };

  public query ({ caller }) func getUserHistory() : async [TournamentRegistration] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view history");
    };

    tournamentRegistrations.values().filter(
      func(registration) { registration.userId == caller }
    ).toArray();
  };

  public shared func approvePayment(userId : Principal, tournamentId : TournamentId) : async () {
    switch (findLatestPayment(userId, tournamentId)) {
      case (null) { Runtime.trap("Payment request does not exist"); };
      case (?(key, req)) {
        let updated = {
          userId = req.userId;
          tournamentId = req.tournamentId;
          status = #approved : PaymentStatus;
          timestamp = req.timestamp;
        };
        paymentRequests.add(key, updated);
      };
    };
  };

  public shared func rejectPayment(userId : Principal, tournamentId : TournamentId) : async () {
    switch (findLatestPayment(userId, tournamentId)) {
      case (null) { Runtime.trap("Payment request does not exist"); };
      case (?(key, req)) {
        let updated = {
          userId = req.userId;
          tournamentId = req.tournamentId;
          status = #rejected : PaymentStatus;
          timestamp = req.timestamp;
        };
        paymentRequests.add(key, updated);
      };
    };
  };

  public query func getAllUsers() : async [UserProfile] {
    userProfiles.values().toArray();
  };

  public query func getAllRegistrations() : async [TournamentRegistration] {
    tournamentRegistrations.values().toArray();
  };

  public query func getAllPaymentRequests() : async [PaymentRequest] {
    paymentRequests.values().toArray();
  };

  public query ({ caller }) func checkDuplicateRegistration(tournamentId : TournamentId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check registration status");
    };

    let now = Time.now();
    let registrationKey = makeRegistrationKey(caller, tournamentId, now);
    
    switch (tournamentRegistrations.get(registrationKey)) {
      case (null) false;
      case (?_) true;
    };
  };
};

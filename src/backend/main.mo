import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Set "mo:core/Set";
import List "mo:core/List";
import Option "mo:core/Option";

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

  // Helper function to create composite key for registration
  func makeRegistrationKey(userId : Principal, tournamentId : TournamentId, dayTimestamp : Time.Time) : Text {
    let day = dayTimestamp / 86_400_000_000_000; // Convert to days
    userId.toText() # "|" # tournamentId # "|" # day.toText();
  };

  // Helper function to create composite key for payment
  func makePaymentKey(userId : Principal, tournamentId : TournamentId) : Text {
    userId.toText() # "|" # tournamentId;
  };

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let tournaments = Map.empty<TournamentId, Tournament>();
  let tournamentRegistrations = Map.empty<Text, TournamentRegistration>();
  let paymentRequests = Map.empty<Text, PaymentRequest>();

  // Authorization
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

  // Tournament Management
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
    // No authorization needed - public information
    tournaments.values().toArray().sort();
  };

  // Registration
  public shared ({ caller }) func registerTournament(tournamentId : TournamentId, team : TeamInfo) : async Text {
    // Must be authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register for tournaments");
    };

    switch (tournaments.get(tournamentId)) {
      case (null) {
        Runtime.trap("Tournament does not exist");
      };
      case (?tournament) {
        // Validate team size based on tournament type
        let expectedSize = switch (tournament.tournamentType) {
          case (#duo) 2;
          case (#squad) 4;
        };
        
        if (team.members.size() != expectedSize) {
          Runtime.trap("Invalid team size for tournament type");
        };

        let now = Time.now();
        let registrationKey = makeRegistrationKey(caller, tournamentId, now);
        
        // Check for duplicate registration (one per user per tournament per day)
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

            let paymentKey = makePaymentKey(caller, tournamentId);
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

  // Payment Status
  public query ({ caller }) func getPaymentStatus(tournamentId : TournamentId) : async PaymentStatus {
    // Must be authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check payment status");
    };

    let paymentKey = makePaymentKey(caller, tournamentId);
    switch (paymentRequests.get(paymentKey)) {
      case (null) {
        Runtime.trap("Payment request does not exist");
      };
      case (?request) {
        // Verify ownership or admin access
        if (request.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own payment status");
        };
        request.status;
      };
    };
  };

  // User History
  public query ({ caller }) func getUserHistory() : async [TournamentRegistration] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view history");
    };

    tournamentRegistrations.values().filter(
      func(registration) { registration.userId == caller }
    ).toArray();
  };

  // Admin Panel
  public shared ({ caller }) func approvePayment(userId : Principal, tournamentId : TournamentId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve payments");
    };

    let paymentKey = makePaymentKey(userId, tournamentId);
    switch (paymentRequests.get(paymentKey)) {
      case (null) {
        Runtime.trap("Payment request does not exist");
      };
      case (?request) {
        let updatedRequest = {
          userId = request.userId;
          tournamentId = request.tournamentId;
          status = #approved : PaymentStatus;
          timestamp = request.timestamp;
        };
        paymentRequests.add(paymentKey, updatedRequest);
      };
    };
  };

  public shared ({ caller }) func rejectPayment(userId : Principal, tournamentId : TournamentId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject payments");
    };

    let paymentKey = makePaymentKey(userId, tournamentId);
    switch (paymentRequests.get(paymentKey)) {
      case (null) {
        Runtime.trap("Payment request does not exist");
      };
      case (?request) {
        let updatedRequest = {
          userId = request.userId;
          tournamentId = request.tournamentId;
          status = #rejected : PaymentStatus;
          timestamp = request.timestamp;
        };
        paymentRequests.add(paymentKey, updatedRequest);
      };
    };
  };

  // Admin Panel - Read queries are public (frontend password protects access)
  public query func getAllUsers() : async [UserProfile] {
    userProfiles.values().toArray();
  };

  public query func getAllRegistrations() : async [TournamentRegistration] {
    tournamentRegistrations.values().toArray();
  };

  public query func getAllPaymentRequests() : async [PaymentRequest] {
    paymentRequests.values().toArray();
  };

  // Duplicate Prevention
  public query ({ caller }) func checkDuplicateRegistration(tournamentId : TournamentId) : async Bool {
    // Must be authenticated user checking their own registration
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

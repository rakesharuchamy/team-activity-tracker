import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  type WorkLogEntry = {
    id : Int;
    user : Principal;
    activityTypeId : Int;
    environmentIds : [Int];
    notes : ?Text;
    date : Text; // YYYY-MM-DD
    timestamp : Time.Time;
  };

  type ActivityType = {
    id : Int;
    name : Text;
  };

  type Environment = {
    id : Int;
    name : Text;
  };

  // Ordering modules for sorting
  module WorkLogEntry {
    public func compare(a : WorkLogEntry, b : WorkLogEntry) : Order.Order {
      Int.compare(b.id, a.id);
    };
  };

  module ActivityType {
    public func compare(a : ActivityType, b : ActivityType) : Order.Order {
      Text.compare((a.name), (b.name));
    };
  };

  module Environment {
    public func compare(a : Environment, b : Environment) : Order.Order {
      Text.compare((a.name), (b.name));
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let workLogs = Map.empty<Int, WorkLogEntry>();
  let activityTypes = Map.empty<Int, ActivityType>();
  let environments = Map.empty<Int, Environment>();

  var nextWorkLogId = 1;
  var nextActivityTypeId = 1;
  var nextEnvironmentId = 1;

  // Activity Type CRUD (Admin only)
  public shared ({ caller }) func createActivityType(name : Text) : async Int {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create activity types");
    };

    let id = nextActivityTypeId;
    activityTypes.add(id, { id; name });
    nextActivityTypeId += 1;
    id;
  };

  public shared ({ caller }) func updateActivityType(id : Int, name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update activity types");
    };

    let existing = switch (activityTypes.get(id)) {
      case (null) { Runtime.trap("Activity type not found") };
      case (?existing) { existing };
    };

    activityTypes.add(id, { existing with name });
  };

  public shared ({ caller }) func deleteActivityType(id : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete activity types");
    };

    activityTypes.remove(id);
  };

  public query ({ caller }) func getActivityTypes() : async [ActivityType] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view activity types");
    };

    activityTypes.values().toArray().sort(ActivityType.compare);
  };

  // Environment CRUD (Admin only)
  public shared ({ caller }) func createEnvironment(name : Text) : async Int {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create environments");
    };

    let id = nextEnvironmentId;
    environments.add(id, { id; name });
    nextEnvironmentId += 1;
    id;
  };

  public shared ({ caller }) func updateEnvironment(id : Int, name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update environments");
    };

    let existing = switch (environments.get(id)) {
      case (null) { Runtime.trap("Environment not found") };
      case (?existing) { existing };
    };

    environments.add(id, { existing with name });
  };

  public shared ({ caller }) func deleteEnvironment(id : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete environments");
    };

    environments.remove(id);
  };

  public query ({ caller }) func getEnvironments() : async [Environment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view environments");
    };

    environments.values().toArray().sort(Environment.compare);
  };

  // Work Log Entry CRUD
  public shared ({ caller }) func createWorkLogEntry(activityTypeId : Int, environmentIds : [Int], notes : ?Text, date : Text) : async Int {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create work log entries");
    };

    let id = nextWorkLogId;
    let entry : WorkLogEntry = {
      id;
      user = caller;
      activityTypeId;
      environmentIds;
      notes;
      date;
      timestamp = Time.now();
    };

    workLogs.add(id, entry);
    nextWorkLogId += 1;
    id;
  };

  public shared ({ caller }) func deleteWorkLogEntry(id : Int) : async () {
    let entry = switch (workLogs.get(id)) {
      case (null) { Runtime.trap("Work log entry not found") };
      case (?entry) { entry };
    };

    if (entry.user != caller and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only delete your own entries");
    };

    workLogs.remove(id);
  };

  public query ({ caller }) func getMyWorkLogEntries(startDate : Text, endDate : Text) : async [WorkLogEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view work log entries");
    };

    workLogs.values().toArray().filter(
      func(entry) {
        entry.user == caller and entry.date >= startDate and entry.date <= endDate
      }
    ).sort();
  };

  public query ({ caller }) func getAllTeamWorkLogEntries(
    startDate : Text,
    endDate : Text,
    member : ?Principal,
    activityTypeId : ?Int,
  ) : async [WorkLogEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all team work log entries");
    };

    workLogs.values().toArray().filter(
      func(entry) {
        let matchesDate = entry.date >= startDate and entry.date <= endDate;
        let matchesMember = switch (member) {
          case (null) { true };
          case (?m) { entry.user == m };
        };
        let matchesActivityType = switch (activityTypeId) {
          case (null) { true };
          case (?id) { entry.activityTypeId == id };
        };
        matchesDate and matchesMember and matchesActivityType;
      }
    ).sort();
  };

  // Summary Stats
  public query ({ caller }) func getActivityTypeStats(user : Principal, date : Text) : async [(Int, Nat)] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own stats");
    };

    let userEntries = workLogs.values().toArray().filter(
      func(entry) {
        entry.user == user and entry.date == date
      }
    );
    let countMap = Map.empty<Int, Nat>();

    for (entry in userEntries.values()) {
      let currentCount = switch (countMap.get(entry.activityTypeId)) {
        case (null) { 0 };
        case (?count) { count };
      };
      countMap.add(entry.activityTypeId, currentCount + 1);
    };

    countMap.toArray();
  };
};

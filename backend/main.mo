import Bool "mo:base/Bool";
import Hash "mo:base/Hash";

import Debug "mo:base/Debug";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Error "mo:base/Error";

actor {
  type Certificate = {
    id: Nat;
    energySource: Text;
    details: Text;
    price: Nat;
    owner: ?Principal;
    createdAt: Time.Time;
    imageUrl: Text;
  };

  stable var certificates : [Certificate] = [];
  stable var nextCertificateId : Nat = 0;

  public shared(msg) func addCertificate(energySource: Text, details: Text, price: Nat, imageUrl: Text) : async Result.Result<Nat, Text> {
    Debug.print("Attempting to add certificate");
    try {
      let newCertificate : Certificate = {
        id = nextCertificateId;
        energySource = energySource;
        details = details;
        price = price;
        owner = ?msg.caller;
        createdAt = Time.now();
        imageUrl = imageUrl;
      };
      certificates := Array.append(certificates, [newCertificate]);
      nextCertificateId += 1;
      Debug.print("Certificate added successfully");
      #ok(newCertificate.id)
    } catch (e) {
      Debug.print("Error adding certificate: " # Error.message(e));
      #err("Failed to add certificate: " # Error.message(e))
    }
  };

  public query func getCertificates() : async [Certificate] {
    Debug.print("Fetching all certificates");
    certificates
  };

  public shared(msg) func login() : async Bool {
    Debug.print("User logged in: " # Principal.toText(msg.caller));
    true
  };

  public shared(msg) func logout() : async Bool {
    Debug.print("User logged out: " # Principal.toText(msg.caller));
    true
  };

  system func preupgrade() {
    Debug.print("Preparing for upgrade");
    // The stable variables will be automatically persisted
  };

  system func postupgrade() {
    Debug.print("Upgrade completed");
    // Reinitialize any non-stable state here if necessary
  };
}
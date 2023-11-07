// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {PrepaidTickets} from "../PrepaidTickets.sol";
import {UnlockableTransport} from "../UnlockableTransport.sol";

/**
 * @author  federicopasqua
 * @title   Types Library
 * @notice  A library containing all types used for the project contracts
 */

library Types {
    // All possible type of transport for a ticket
    enum TypeOfTransport {
        TRAIN,
        AIRPLANE,
        BOAT
    }

    // All possible valid states of a ticket
    enum TicketState {
        VALID,
        USED
    }

    // Struct representing a Mobility Service Provider
    struct Msp {
        string name; // Name of the MSP
        string endpoint; // Url of the MSP standard API
        UnlockableTransport unlockableContract; // Address of the MSP unloackable contract
        PrepaidTickets ticketContract; // Address of the MSP ticket contract
    }

    // Struct that describes a position with coordinates
    struct Position {
        uint256 x;
        uint256 y;
    }

    // Struct that describe a vehicle that can be locked and unlocked
    struct UnlockableVehicle {
        uint256 id; // Unique ID that represent this vehicle
        Position position; // Current position of the vehicle
        uint256 totalKm; // Total km for the vehicle (for car rent)
        uint8 battery; // Current battery/fuel percentage
        address vehicleAddress; // Address associated with pkey of vehicle
        bool enabled; // Boolean to indicate if the vehicle is currently in service
    }

    // Struct that represent the status of the ongoing rental
    struct RentStatus {
        address currentOwner; // Address of the owner currently renting
        uint256 offerId; // Id of the offer being used by this rent
        uint256 startKm; // Total km of the vehicle at which the rent was started
        uint256 startTime; // Time (in unix) at which the rent was started
        uint256 maxToSpend; // Amount of the ETH sent when the vehicle was unlocked (and therefore the maximum that can be spent on this rent)
    }

    // Struct that describe a possible offer at which a vehicle can be rented
    struct UnlockablesOffer {
        uint256 id; // Unique ID of the offer
        uint256 pricePerKm; // Price (in wei) for every km
        uint256 pricePerSec; // Price (in wei) for every sec
        uint256 UnlockPrice; // Price (in wei) to unlock the vehicle
        uint256 KmAllowance; // Free of charge amount of Km before applying the above rate
        uint256 TimeAllowance; // Free of charge amount of seconds before applying the above rate
        bool enabled; // Boolean to indicate if the offer is currently available
    }

    // Struct that describes a point of interest with its name and coordinates
    struct PointOfInterest {
        string name; // Name of the point of interest
        uint256 x;
        uint256 y;
    }

    // Struct that describes a ticket
    struct Ticket {
        bytes signature; // Signature from the MSP over the id
        bytes32 id; // keccak256 over all fields of the ticket
        TypeOfTransport typeOfTransport; // Transport type
        uint256 price; // Price to pay (in wei) for the ticket
        PointOfInterest from; // Place from where the journey starts
        PointOfInterest to; // Place where the journey ends
        uint256 departureTime; // Time of departure
        uint256 eta; // Estimated time of arrival
        uint8 class; // Class at which the passenger travels (MSP defined)
        bytes custom; // Custom data (MSP defined)
        uint256 expiration; // Expiration time (in unix) after which the ticket offer is invalid
        address validFor; // Address to which this ticket offer is valid
        TicketState state; // The state of the ticket
    }
}

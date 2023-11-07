// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {Types} from "./library/types.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @author  federicopasqua
 * @title   Contract to handle tickets
 * @notice  Contract used to handle all the tickets emitted for a specific single use ticket like train, boat or airplane journeys
 */

contract PrepaidTickets {

    /*//////////////////////////////////////////////////////////////
                                Errors
    //////////////////////////////////////////////////////////////*/

    error PrepaidTickets__NotOwner();
    error PrepaidTickets__ValueDoesntMatchTicketPrice();
    error PrepaidTickets__TicketOfferExpired();
    error PrepaidTickets__TicketOfferNotForThisAddress();
    error PrepaidTickets__TicketOfferWrongId();
    error PrepaidTickets__TicketOfferSignatureInvalid();
    error PrepaidTickets__TicketConfirmationSignatureInvalid();
    error PrepaidTickets__TicketNotFound();
    error PrepaidTickets__TicketAlreadyUsed();
    error PrepaidTickets__TicketAlreadyExist();
    error PrepaidTickets__NotEnoughEthForWithdraw();
    error PrepaidTickets__OwnerPaymentFailed();

    /*//////////////////////////////////////////////////////////////
                                State
    //////////////////////////////////////////////////////////////*/

    // Address of the contract owner
    address private immutable i_owner;

    // Amount of ETH in wei that the owner can withdraw
    uint256 private s_ownerCredit;
    // Mapping of all the tickets and their id
    mapping(bytes32 id => Types.Ticket ticket) private s_tickets;
    // Mapping between a user address and the list of their available tickets id
    mapping(address owner => bytes32[] ticketId)
        private s_AvailableAddressTickets;
    // Mapping between a user address and the list of their used tickets id
    mapping(address owner => bytes32[] ticketId) private s_UsedAddressTickets;

    /*//////////////////////////////////////////////////////////////
                                Events
    //////////////////////////////////////////////////////////////*/

    event newTicket(
        bytes32 indexed id,
        address indexed validFor,
        uint256 price,
        string from,
        string to
    );
    event validatedTicket(bytes32 indexed id, address indexed validFor);
    event newWithdraw(uint256 indexed amount);

    /*//////////////////////////////////////////////////////////////
                              Modifiers
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice  Allow only the contract owner to call a function
     */
    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert PrepaidTickets__NotOwner();
        }
        _;
    }

    /*//////////////////////////////////////////////////////////////
                             Constructor
    //////////////////////////////////////////////////////////////*/

    constructor(address owner) {
        i_owner = owner;
    }

    /*//////////////////////////////////////////////////////////////
                          External functions
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice  Function used to validate and create a new ticket. The ticket must be signed by the owner
     * @dev     Refactor to move the signature checks in its own function
     * @param   ticket  Ticket struct that includes the owner signature
     */
    function mintTicket(Types.Ticket calldata ticket) external payable {
        // Check that the amount in wei sent to the contract corresponds to the ticket price
        if (ticket.price != msg.value) {
            revert PrepaidTickets__ValueDoesntMatchTicketPrice();
        }

        // Check that the ticket offer has not expired
        if (ticket.expiration < block.timestamp) {
            revert PrepaidTickets__TicketOfferExpired();
        }

        // Check that the ticket offer is valid for the sender
        if (ticket.validFor != msg.sender) {
            revert PrepaidTickets__TicketOfferNotForThisAddress();
        }

        // Check that the ticket doesn't already exist
        if (s_tickets[ticket.id].id != 0) {
            revert PrepaidTickets__TicketAlreadyExist();
        }

        // Calculate the actual ide by hashing with keccak256 all the ticket attributes in the correct order
        bytes32 expectedHash = keccak256(
            bytes.concat(
                abi.encode(
                    ticket.typeOfTransport,
                    ticket.price,
                    ticket.from.name,
                    ticket.from.x,
                    ticket.from.y,
                    ticket.to.name,
                    ticket.to.x
                ),
                abi.encode(
                    ticket.to.y,
                    ticket.departureTime,
                    ticket.eta,
                    ticket.class,
                    ticket.expiration,
                    ticket.validFor,
                    ticket.custom
                )
            )
        );

        // Check that the calculated hash corresponds to the ticket id provided by the user
        if (expectedHash != ticket.id) {
            revert PrepaidTickets__TicketOfferWrongId();
        }

        // Check that the signature from the owner is valid
        if (
            ECDSA.recover(
                keccak256(
                    abi.encodePacked(
                        "\x19Ethereum Signed Message:\n32",
                        expectedHash
                    )
                ),
                ticket.signature
            ) != i_owner
        ) {
            revert PrepaidTickets__TicketOfferSignatureInvalid();
        }

        s_tickets[ticket.id] = ticket;
        s_tickets[ticket.id].state = Types.TicketState.VALID;
        s_AvailableAddressTickets[msg.sender].push(ticket.id);
        emit newTicket(
            ticket.id,
            ticket.validFor,
            ticket.price,
            ticket.from.name,
            ticket.to.name
        );

        s_ownerCredit += msg.value;
    }

    /**
     * @notice  Mark a minted ticket as used. A user signature is required to mark them as used to prevent MSP from being able to invalidate tickets without user consent.
     * @param   id  Id of the ticket to mark as aused
     * @param   userSignature  The signature of the user over the ticket id
     */
    function validateTicketAndMarkAsUsed(
        bytes32 id,
        bytes calldata userSignature
    ) external onlyOwner {
        Types.Ticket memory ticket = s_tickets[id];

        // Check that the ticket id exists
        if (ticket.id == 0) {
            revert PrepaidTickets__TicketNotFound();
        }

        // Check that the ticket is valid and therefore not already being used
        if (ticket.state != Types.TicketState.VALID) {
            revert PrepaidTickets__TicketAlreadyUsed();
        }

        // Check that the user signature is valid
        if (
            ECDSA.recover(
                keccak256(
                    abi.encodePacked(
                        "\x19Ethereum Signed Message:\n32",
                        ticket.id
                    )
                ),
                userSignature
            ) != ticket.validFor
        ) {
            revert PrepaidTickets__TicketConfirmationSignatureInvalid();
        }

        bytes32[] memory availableTickets = s_AvailableAddressTickets[
            ticket.validFor
        ];

        // Remove the ticket from the availableTickets list
        for (uint256 i = 0; i < availableTickets.length; i++) {
            if (availableTickets[i] == ticket.id) {
                if (i != availableTickets.length - 1) {
                    s_AvailableAddressTickets[ticket.validFor][
                        i
                    ] = availableTickets[availableTickets.length - 1];
                }
                s_AvailableAddressTickets[ticket.validFor].pop();
                break;
            }
        }
        s_UsedAddressTickets[ticket.validFor].push(ticket.id);

        s_tickets[ticket.id].state = Types.TicketState.USED;
        emit validatedTicket(ticket.id, ticket.validFor);
    }

    /**
     * @notice  Function used by the owner to withdraw all the available credit
     */
    function withdraw() external onlyOwner {
        // Check that the credit is not zero
        if (s_ownerCredit < 1) {
            revert PrepaidTickets__NotEnoughEthForWithdraw();
        }
        uint256 credit = s_ownerCredit;
        s_ownerCredit = 0;
        emit newWithdraw(credit);

        (bool success, ) = i_owner.call{value: credit}("");
        if (!success) {
            revert PrepaidTickets__OwnerPaymentFailed();
        }
    }

    /*//////////////////////////////////////////////////////////////
                       View external functions
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice  Get the address of the contract owner
     * @return  address  Address of the contract owner
     */
    function getOwner() external view returns (address) {
        return i_owner;
    }

    /**
     * @notice  Get a ticket given its id
     * @param   id  Id of the ticket
     * @return  Types.Ticket  Ticket struct
     */
    function getTicket(bytes32 id) external view returns (Types.Ticket memory) {
        return s_tickets[id];
    }

    /**
     * @notice  Get all the available tickets for a user
     * @param   owner  The address of the user
     * @return  bytes32[]  The list of ids of available tickets for the user
     */
    function getAvailableAddressTicketsId(
        address owner
    ) external view returns (bytes32[] memory) {
        return s_AvailableAddressTickets[owner];
    }

    /**
     * @notice  Get all the used tickets for a user
     * @param   owner  The address of the user
     * @return  bytes32[]  The lis of ids of used tickets for the user
     */
    function getUsedAddressTicketsId(
        address owner
    ) external view returns (bytes32[] memory) {
        return s_UsedAddressTickets[owner];
    }

    /**
     * @notice  Get the contract owner credit
     * @return  uint256  The amount the owner can withdraw
     */
    function getOwnerBalance() external view returns (uint256) {
        return s_ownerCredit;
    }
}

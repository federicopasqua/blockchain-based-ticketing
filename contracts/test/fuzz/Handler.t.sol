// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {Test} from "forge-std/Test.sol";
import {PrepaidTickets} from "../../src/PrepaidTickets.sol";
import {UnlockableTransport} from "../../src/UnlockableTransport.sol";
import {Types} from "../../src/library/types.sol";

import {console} from "forge-std/console.sol";

contract Handler is Test {
    using EnumerableSet for EnumerableSet.AddressSet;

    // Deployed contracts to interact with
    PrepaidTickets public prepaidTickets;
    UnlockableTransport public unlockableTransport;
    uint256 public ownerPrivateKey;

    uint256 constant TICKETEXPIRATION = 100;

    constructor(
        PrepaidTickets _prepaidTickets,
        UnlockableTransport _unlockableTransport,
        uint256 _ownerPrivateKey
    ) {
        prepaidTickets = _prepaidTickets;
        unlockableTransport = _unlockableTransport;
        ownerPrivateKey = _ownerPrivateKey;
    }

    function mintAndValidateTicket(
        Types.Ticket memory ticket,
        uint256 timeForValidation,
        uint256 userPrivateKey
    ) public {
        address user = vm.addr(userPrivateKey);
        address owner = vm.addr(ownerPrivateKey);
        ticket.expiration = block.timestamp + TICKETEXPIRATION;
        ticket.validFor = user;
        ticket.id = keccak256(
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
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            ownerPrivateKey,
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", ticket.id)
            )
        );
        ticket.signature = abi.encodePacked(r, s, v);
        hoax(user, ticket.price);
        prepaidTickets.mintTicket{value: ticket.price}(ticket);
        timeForValidation =
            block.timestamp +
            bound(timeForValidation, 1, TICKETEXPIRATION);
        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(
            userPrivateKey,
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", ticket.id)
            )
        );
        bytes memory signature2 = abi.encodePacked(r2, s2, v2);
        vm.warp(timeForValidation);
        vm.prank(owner);
        prepaidTickets.validateTicketAndMarkAsUsed(ticket.id, signature2);
    }

    function withdrawPrepaid() public {
        if (prepaidTickets.getOwnerBalance() == 0) {
            return;
        }
        vm.prank(vm.addr(ownerPrivateKey));
        prepaidTickets.withdraw();
    }
}

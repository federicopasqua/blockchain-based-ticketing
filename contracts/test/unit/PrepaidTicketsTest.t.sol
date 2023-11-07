// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {DeployMspRegister} from "../../script/DeployMspRegister.s.sol";
import {MspRegister} from "../../src/MspRegister.sol";
import {PrepaidTickets} from "../../src/PrepaidTickets.sol";
import {Types} from "../../src/library/types.sol";
import {Test} from "forge-std/Test.sol";

contract PrepaidTicketsTest is Test {
    MspRegister public mspRegister;
    PrepaidTickets public prepaidTickets;

    uint256 constant MSPPRIVATEKEY =
        0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318;
    address immutable MSP;

    uint256 constant USER1PRIVATEKEY =
        0xd06d705e52da743d0217e631fd686ed2f2898ccaab2ce8a50e8c78097da4aca7;
    address immutable USER1;
    address constant USER2 = address(0x2);

    uint256 constant WRONGPRIVATEKEY =
        0x7edb18c2e69fda0ba4f99e18070638fd0069cf13fd2cf4ea5f11ee7de961276b;

    Types.Ticket validTicket;

    string constant MSPNAME = "MspName";
    string constant MSPENDPOINT = "https://mspApi.com/";

    uint256 constant TICKETEXPIRATION = 1000;
    uint256 constant TICKETUSER1PRICE = 1 ether;
    uint256 constant TICKETUSER2PRICE = 3 ether;

    event newTicket(
        bytes32 indexed id,
        address indexed validFor,
        uint256 price,
        string from,
        string to
    );
    event validatedTicket(bytes32 indexed id, address indexed validFor);
    event newWithdraw(uint256 indexed amount);

    constructor() {
        MSP = vm.addr(MSPPRIVATEKEY);
        USER1 = vm.addr(USER1PRIVATEKEY);
    }

    function setUp() external {
        DeployMspRegister deployer = new DeployMspRegister();
        mspRegister = deployer.run();
        vm.prank(MSP);
        (, prepaidTickets) = mspRegister.register(MSPNAME, MSPENDPOINT);

        validTicket.typeOfTransport = Types.TypeOfTransport.TRAIN;
        validTicket.price = TICKETUSER1PRICE;
        validTicket.from = Types.PointOfInterest("Torino Porta nuova", 1, 2);
        validTicket.to = Types.PointOfInterest("Torino Porta susa", 3, 4);
        validTicket.departureTime = block.timestamp + 1000;
        validTicket.eta = block.timestamp + 3000;
        validTicket.class = 1;
        validTicket.custom = new bytes(0);
        validTicket.expiration = block.timestamp + TICKETEXPIRATION;
        validTicket.validFor = USER1;
        validTicket.state = Types.TicketState.VALID;
        validTicket.id = keccak256(
            bytes.concat(
                abi.encode(
                    validTicket.typeOfTransport,
                    validTicket.price,
                    validTicket.from.name,
                    validTicket.from.x,
                    validTicket.from.y,
                    validTicket.to.name,
                    validTicket.to.x
                ),
                abi.encode(
                    validTicket.to.y,
                    validTicket.departureTime,
                    validTicket.eta,
                    validTicket.class,
                    validTicket.expiration,
                    validTicket.validFor,
                    validTicket.custom
                )
            )
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            MSPPRIVATEKEY,
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    validTicket.id
                )
            )
        );
        validTicket.signature = abi.encodePacked(r, s, v);
    }

    // Mint Ticket

    function testMintTicket() external {
        // Arrange
        // Act
        hoax(USER1, validTicket.price);
        vm.expectEmit(true, true, false, true, address(prepaidTickets));
        emit newTicket(
            validTicket.id,
            validTicket.validFor,
            validTicket.price,
            validTicket.from.name,
            validTicket.to.name
        );
        prepaidTickets.mintTicket{value: validTicket.price}(validTicket);
        // Assert
        assertEq(prepaidTickets.getTicket(validTicket.id).id, validTicket.id);
        assert(
            prepaidTickets.getTicket(validTicket.id).state ==
                Types.TicketState.VALID
        );
        assertEq(prepaidTickets.getAvailableAddressTicketsId(USER1).length, 1);
        assertEq(
            prepaidTickets.getAvailableAddressTicketsId(USER1)[0],
            validTicket.id
        );
        assertEq(prepaidTickets.getUsedAddressTicketsId(USER1).length, 0);
        assertEq(prepaidTickets.getOwnerBalance(), validTicket.price);
    }

    function testMintTicketWrongValue() external {
        // Arrange
        // Act
        // Assert
        hoax(USER1, validTicket.price);
        vm.expectRevert(
            PrepaidTickets.PrepaidTickets__ValueDoesntMatchTicketPrice.selector
        );
        prepaidTickets.mintTicket{value: validTicket.price - 1}(validTicket);
    }

    function testMintTicketAfterExpiration() external {
        // Arrange
        // Act
        // Assert
        hoax(USER1, validTicket.price);
        vm.warp(block.timestamp + TICKETEXPIRATION + 1);
        vm.expectRevert(
            PrepaidTickets.PrepaidTickets__TicketOfferExpired.selector
        );
        prepaidTickets.mintTicket{value: validTicket.price}(validTicket);
    }

    function testMintTicketFromWrongAddress() external {
        // Arrange
        // Act
        // Assert
        hoax(USER2, validTicket.price);
        vm.expectRevert(
            PrepaidTickets.PrepaidTickets__TicketOfferNotForThisAddress.selector
        );
        prepaidTickets.mintTicket{value: validTicket.price}(validTicket);
    }

    modifier ticketMinted() {
        hoax(USER1, validTicket.price);
        prepaidTickets.mintTicket{value: validTicket.price}(validTicket);
        _;
    }

    function testMintTicketDuplicate() external ticketMinted {
        // Arrange
        // Act
        // Assert
        hoax(USER1, validTicket.price);
        vm.expectRevert(
            PrepaidTickets.PrepaidTickets__TicketAlreadyExist.selector
        );
        prepaidTickets.mintTicket{value: validTicket.price}(validTicket);
    }

    function testMintTicketWrongId() external {
        // Arrange
        validTicket.eta = block.timestamp + 1;
        // Act
        // Assert
        hoax(USER1, validTicket.price);
        vm.expectRevert(
            PrepaidTickets.PrepaidTickets__TicketOfferWrongId.selector
        );
        prepaidTickets.mintTicket{value: validTicket.price}(validTicket);
    }

    function testMintTicketWrongSignature() external {
        // Arrange
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            WRONGPRIVATEKEY,
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    validTicket.id
                )
            )
        );
        validTicket.signature = abi.encodePacked(r, s, v);
        // Act
        // Assert
        hoax(USER1, validTicket.price);
        vm.expectRevert(
            PrepaidTickets.PrepaidTickets__TicketOfferSignatureInvalid.selector
        );
        prepaidTickets.mintTicket{value: validTicket.price}(validTicket);
    }

    // Validate Ticket and mark as used

    function testValidateTicket() external ticketMinted {
        // Arrange
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            USER1PRIVATEKEY,
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    validTicket.id
                )
            )
        );
        bytes memory signature = abi.encodePacked(r, s, v);
        // Act
        vm.prank(MSP);
        vm.expectEmit(true, true, false, false, address(prepaidTickets));
        emit validatedTicket(validTicket.id, validTicket.validFor);
        prepaidTickets.validateTicketAndMarkAsUsed(validTicket.id, signature);
        // Assert
        assertEq(prepaidTickets.getTicket(validTicket.id).id, validTicket.id);
        assert(
            prepaidTickets.getTicket(validTicket.id).state ==
                Types.TicketState.USED
        );
        assertEq(prepaidTickets.getAvailableAddressTicketsId(USER1).length, 0);
        assertEq(prepaidTickets.getUsedAddressTicketsId(USER1).length, 1);
        assertEq(
            prepaidTickets.getUsedAddressTicketsId(USER1)[0],
            validTicket.id
        );
    }

    function testValidateTicketInvalidId() external {
        // Arrange
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            USER1PRIVATEKEY,
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    validTicket.id
                )
            )
        );
        bytes memory signature = abi.encodePacked(r, s, v);
        // Act
        // Assert
        vm.prank(MSP);
        vm.expectRevert(PrepaidTickets.PrepaidTickets__TicketNotFound.selector);
        prepaidTickets.validateTicketAndMarkAsUsed(validTicket.id, signature);
    }

    function testValidateTicketAlreadyUsed() external ticketMinted {
        // Arrange
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            USER1PRIVATEKEY,
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    validTicket.id
                )
            )
        );
        bytes memory signature = abi.encodePacked(r, s, v);
        vm.prank(MSP);
        prepaidTickets.validateTicketAndMarkAsUsed(validTicket.id, signature);
        // Act
        // Assert
        vm.prank(MSP);
        vm.expectRevert(
            PrepaidTickets.PrepaidTickets__TicketAlreadyUsed.selector
        );
        prepaidTickets.validateTicketAndMarkAsUsed(validTicket.id, signature);
    }

    function testValidateTicketInvalidSignature() external ticketMinted {
        // Arrange
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            WRONGPRIVATEKEY,
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    validTicket.id
                )
            )
        );
        bytes memory signature = abi.encodePacked(r, s, v);
        // Act
        // Assert
        vm.prank(MSP);
        vm.expectRevert(
            PrepaidTickets
                .PrepaidTickets__TicketConfirmationSignatureInvalid
                .selector
        );
        prepaidTickets.validateTicketAndMarkAsUsed(validTicket.id, signature);
    }

    modifier ticketMintedUser2() {
        hoax(USER2, TICKETUSER2PRICE);
        validTicket.price = TICKETUSER2PRICE;
        validTicket.validFor = USER2;
        validTicket.id = keccak256(
            bytes.concat(
                abi.encode(
                    validTicket.typeOfTransport,
                    validTicket.price,
                    validTicket.from.name,
                    validTicket.from.x,
                    validTicket.from.y,
                    validTicket.to.name,
                    validTicket.to.x
                ),
                abi.encode(
                    validTicket.to.y,
                    validTicket.departureTime,
                    validTicket.eta,
                    validTicket.class,
                    validTicket.expiration,
                    validTicket.validFor,
                    validTicket.custom
                )
            )
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            MSPPRIVATEKEY,
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    validTicket.id
                )
            )
        );
        validTicket.signature = abi.encodePacked(r, s, v);
        prepaidTickets.mintTicket{value: TICKETUSER2PRICE}(validTicket);
        _;
    }

    function testWithdraw() external ticketMinted ticketMintedUser2 {
        // Arrange
        uint256 OWNERBALANCE = TICKETUSER1PRICE + TICKETUSER2PRICE;
        // act
        vm.prank(MSP);
        vm.expectEmit(true, false, false, false, address(prepaidTickets));
        emit newWithdraw(OWNERBALANCE);
        prepaidTickets.withdraw();
        // Assert
        assertEq(prepaidTickets.getOwnerBalance(), 0);
        assertEq(MSP.balance, OWNERBALANCE);
    }

    function testWithdrawNotFromOwner() external ticketMinted {
        vm.prank(USER1);
        vm.expectRevert(PrepaidTickets.PrepaidTickets__NotOwner.selector);
        prepaidTickets.withdraw();
    }

    function testWithdrawWithZeroBalance() external {
        vm.prank(MSP);
        vm.expectRevert(
            PrepaidTickets.PrepaidTickets__NotEnoughEthForWithdraw.selector
        );
        prepaidTickets.withdraw();
    }
}

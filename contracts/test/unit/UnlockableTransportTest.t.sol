// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {DeployMspRegister} from "../../script/DeployMspRegister.s.sol";
import {MspRegister} from "../../src/MspRegister.sol";
import {UnlockableTransport} from "../../src/UnlockableTransport.sol";
import {Types} from "../../src/library/types.sol";
import {Test} from "forge-std/Test.sol";

contract UnlockableTransportTest is Test {
    MspRegister public mspRegister;
    UnlockableTransport public unlockableTransport;

    Types.UnlockableVehicle generalVehicle;
    Types.UnlockablesOffer generalOffer;

    address constant MSP = address(0x1);
    address constant USER1 = address(0x2);
    address constant USER2 = address(0x3);
    address constant VEHICLE1 = address(0x4);
    address constant VEHICLE2 = address(0x5);

    string constant MSPNAME = "MspName";
    string constant MSPENDPOINT = "https://mspApi.com/";

    uint256 constant ID1 = 1;
    uint256 constant ID2 = 2;
    uint256 constant KM1 = 12;
    uint256 constant KM2 = 15;
    uint256 constant LOTOFKM = 100;
    uint8 constant HALFBATTERY = 50;
    Types.Position RANDOMPOSITION = Types.Position(12, 14);
    uint256 constant RANDOMETHAMOUNT = 50 ether;
    uint256 constant FINALTIMESTAMP = 50;
    uint256 constant LOTOFTIME = 1000;

    event VehicleUnlocked(
        uint256 indexed vehicleId,
        address indexed owner,
        uint256 indexed offerId,
        uint256 totalKm,
        uint256 timestamp
    );
    event VehicleLocked(
        uint256 indexed vehicleId,
        address indexed owner,
        uint256 indexed cost
    );
    event VehicleForceLocked(
        uint256 indexed vehicleId,
        address indexed owner,
        uint256 indexed cost
    );
    event VehicleBatterySet(uint256 indexed vehicleId, uint8 indexed battery);
    event VehiclePositionSet(
        uint256 indexed vehicleId,
        Types.Position indexed position
    );
    event VehicleKmSet(uint256 indexed vehicleId, uint256 indexed km);
    event AddOfferEvent(uint256 indexed id, bool enabled);
    event ToggleEnableOfferEvent(uint256 indexed id, bool enabled);
    event DeleteOfferEvent(uint256 indexed id);
    event AddVehicleEvent(
        uint256 indexed id,
        address indexed vehicleAddress,
        bool enabled
    );
    event ToggleEnableVehicleEvent(
        uint256 indexed id,
        address indexed vehicleAddress,
        bool enabled
    );
    event DeleteVehicleEvent(
        uint256 indexed id,
        address indexed vehicleAddress
    );
    event newWithdraw(uint256 indexed amount);

    function setUp() external {
        DeployMspRegister deployer = new DeployMspRegister();
        mspRegister = deployer.run();
        vm.prank(MSP);
        (unlockableTransport, ) = mspRegister.register(MSPNAME, MSPENDPOINT);

        generalVehicle.id = ID1;
        generalVehicle.position = Types.Position(1, 1);
        generalVehicle.totalKm = 0;
        generalVehicle.battery = 100;
        generalVehicle.vehicleAddress = VEHICLE1;
        generalVehicle.enabled = true;

        generalOffer.id = 1;
        generalOffer.pricePerKm = 1 ether;
        generalOffer.pricePerSec = 1 ether;
        generalOffer.UnlockPrice = 1 ether;
        generalOffer.KmAllowance = 10;
        generalOffer.TimeAllowance = 20;
        generalOffer.enabled = true;
    }

    // AddVehicle

    function testAddVehicle() external {
        // Arrange
        // Act
        vm.prank(MSP);
        vm.expectEmit(true, true, false, true, address(unlockableTransport));
        emit AddVehicleEvent(
            generalVehicle.id,
            generalVehicle.vehicleAddress,
            generalVehicle.enabled
        );
        unlockableTransport.addVehicle(generalVehicle);
        // Assert
        assertEq(unlockableTransport.getAllVehicles().length, 1);
        assertEq(unlockableTransport.isIdInAvailableList(ID1), true);
        assertEq(unlockableTransport.getVehicle(ID1).id, ID1);
        assertEq(
            unlockableTransport.getVehicle(ID1).vehicleAddress,
            generalVehicle.vehicleAddress
        );
    }

    function testAddDisabledVehicle() external {
        // Arrange
        generalVehicle.enabled = false;
        // Act
        vm.prank(MSP);
        vm.expectEmit(true, true, false, true, address(unlockableTransport));
        emit AddVehicleEvent(
            generalVehicle.id,
            generalVehicle.vehicleAddress,
            generalVehicle.enabled
        );
        unlockableTransport.addVehicle(generalVehicle);
        // Assert
        assertEq(unlockableTransport.getAllVehicles().length, 1);
        assertEq(unlockableTransport.isIdInAvailableList(ID1), false);
        assertEq(unlockableTransport.getVehicle(ID1).id, ID1);
        assertEq(
            unlockableTransport.getVehicle(ID1).vehicleAddress,
            generalVehicle.vehicleAddress
        );
    }

    function testAddDuplicateIdVehicle() external {
        // Arrange
        // Act
        vm.prank(MSP);
        unlockableTransport.addVehicle(generalVehicle);
        generalVehicle.vehicleAddress = VEHICLE2;
        // Assert
        vm.prank(MSP);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__VehicleIdAlreadyExists
                .selector
        );
        unlockableTransport.addVehicle(generalVehicle);
    }

    function testAddIdZeroVehicle() external {
        // Arrange
        generalVehicle.id = 0;
        // Act;
        // Assert
        vm.prank(MSP);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__IdCannotBeZeroError
                .selector
        );
        unlockableTransport.addVehicle(generalVehicle);
    }

    function testAssociateMultipleVehiclesToSameAddress() external {
        // Arrange
        // Act
        vm.prank(MSP);
        unlockableTransport.addVehicle(generalVehicle);
        generalVehicle.id = ID2;
        // Assert
        vm.prank(MSP);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__AddressAlreadyAssociatedToOtherVehicle
                .selector
        );
        unlockableTransport.addVehicle(generalVehicle);
    }

    function testAddAllowedOnlyFromOwner() external {
        // Arrange
        // Act;
        // Assert
        vm.prank(USER1);
        vm.expectRevert(
            UnlockableTransport.UnlockableTransport__NotOwner.selector
        );
        unlockableTransport.addVehicle(generalVehicle);
    }

    // ToggleVehicleEnabled

    modifier vehicleAdded() {
        vm.prank(MSP);
        unlockableTransport.addVehicle(generalVehicle);
        _;
    }

    function testToggleEnableOffVehicle() external vehicleAdded {
        // Arrange
        // Act
        vm.prank(MSP);
        vm.expectEmit(true, true, false, true, address(unlockableTransport));
        emit ToggleEnableVehicleEvent(
            generalVehicle.id,
            generalVehicle.vehicleAddress,
            !generalVehicle.enabled
        );
        unlockableTransport.toggleVehicleEnabled(generalVehicle.id);
        // Assert
        assertEq(unlockableTransport.getAllVehicles().length, 1);
        assertEq(
            unlockableTransport.isIdInAvailableList(generalVehicle.id),
            false
        );
        assertEq(
            unlockableTransport.getVehicle(generalVehicle.id).enabled,
            false
        );
    }

    function testToggleEnableOnVehicle() external vehicleAdded {
        // Arrange
        vm.prank(MSP);
        unlockableTransport.toggleVehicleEnabled(generalVehicle.id);
        // Act
        vm.prank(MSP);
        vm.expectEmit(true, true, false, true, address(unlockableTransport));
        emit ToggleEnableVehicleEvent(
            generalVehicle.id,
            generalVehicle.vehicleAddress,
            generalVehicle.enabled
        );
        unlockableTransport.toggleVehicleEnabled(generalVehicle.id);
        // Assert
        assertEq(unlockableTransport.getAllVehicles().length, 1);
        assertEq(
            unlockableTransport.isIdInAvailableList(generalVehicle.id),
            true
        );
        assertEq(
            unlockableTransport.getVehicle(generalVehicle.id).enabled,
            true
        );
    }

    function testToggleNotExistVehicle() external vehicleAdded {
        // Arrange
        // Act
        // Assert
        vm.prank(MSP);
        vm.expectRevert(
            UnlockableTransport.UnlockableTransport__VehicleNotExist.selector
        );
        unlockableTransport.toggleVehicleEnabled(generalVehicle.id + 1);
    }

    function testToggleNotFromOwner() external vehicleAdded {
        // Arrange
        // Act
        // Assert
        vm.prank(USER1);
        vm.expectRevert(
            UnlockableTransport.UnlockableTransport__NotOwner.selector
        );
        unlockableTransport.toggleVehicleEnabled(generalVehicle.id);
    }

    // DeleteVehicle

    function testDeleteVehicle() external vehicleAdded {
        // Arrange
        // Act
        vm.prank(MSP);
        vm.expectEmit(true, true, false, false, address(unlockableTransport));
        emit DeleteVehicleEvent(
            generalVehicle.id,
            generalVehicle.vehicleAddress
        );
        unlockableTransport.deleteVehicle(generalVehicle.id);
        // Assert
        assertEq(unlockableTransport.getAllVehicles().length, 0);
        assertEq(unlockableTransport.getAvailableVehicles().length, 0);
        assertEq(
            unlockableTransport.isIdInAvailableList(generalVehicle.id),
            false
        );
        vm.expectRevert(
            UnlockableTransport.UnlockableTransport__VehicleNotExist.selector
        );
        unlockableTransport.getVehicle(generalVehicle.id);
        vm.prank(VEHICLE1);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__AddressIsNotAVehicleError
                .selector
        );
        unlockableTransport.setBattery(99);
    }

    function testDeleteNotExistantVehicle() external vehicleAdded {
        // Arrange
        // Act
        // Assert
        vm.prank(MSP);
        vm.expectRevert(
            UnlockableTransport.UnlockableTransport__VehicleNotExist.selector
        );
        unlockableTransport.deleteVehicle(generalVehicle.id + 1);
    }

    function testDeleteDisabledVehicle() external vehicleAdded {
        // Arrange
        vm.prank(MSP);
        unlockableTransport.toggleVehicleEnabled(generalVehicle.id);
        // Act
        vm.prank(MSP);
        vm.expectEmit(true, true, false, false, address(unlockableTransport));
        emit DeleteVehicleEvent(
            generalVehicle.id,
            generalVehicle.vehicleAddress
        );
        unlockableTransport.deleteVehicle(generalVehicle.id);
        // Assert
        assertEq(unlockableTransport.getAllVehicles().length, 0);
        assertEq(unlockableTransport.getAvailableVehicles().length, 0);
        assertEq(
            unlockableTransport.isIdInAvailableList(generalVehicle.id),
            false
        );
        vm.expectRevert(
            UnlockableTransport.UnlockableTransport__VehicleNotExist.selector
        );
        unlockableTransport.getVehicle(generalVehicle.id);
        vm.prank(VEHICLE1);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__AddressIsNotAVehicleError
                .selector
        );
        unlockableTransport.setBattery(99);
    }

    function testDeleteVehicleNotFromOwner() external vehicleAdded {
        // Arrange
        // Act
        // Assert
        vm.prank(VEHICLE1);
        vm.expectRevert(
            UnlockableTransport.UnlockableTransport__NotOwner.selector
        );
        unlockableTransport.deleteVehicle(generalVehicle.id);
        vm.prank(USER1);
        vm.expectRevert(
            UnlockableTransport.UnlockableTransport__NotOwner.selector
        );
        unlockableTransport.deleteVehicle(generalVehicle.id);
    }

    function testDeleteVehicleInUse() external vehicleAdded {
        // Arrange
        vm.prank(MSP);
        unlockableTransport.addOffer(generalOffer);
        hoax(USER1, generalOffer.UnlockPrice + 1);
        unlockableTransport.Unlock{value: generalOffer.UnlockPrice + 1}(
            generalVehicle.id,
            generalOffer.id
        );
        // Act
        // Assert
        vm.prank(MSP);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__cannotDeleteAVehicleCurrentlyInUse
                .selector
        );
        unlockableTransport.deleteVehicle(generalVehicle.id);
    }

    // Add Offer

    function testAddOffer() external {
        // Arrange
        // Act
        vm.prank(MSP);
        vm.expectEmit(true, false, false, true, address(unlockableTransport));
        emit AddOfferEvent(generalOffer.id, generalOffer.enabled);
        unlockableTransport.addOffer(generalOffer);
        // Assert
        assertEq(unlockableTransport.getAllOffers().length, 1);
        assertEq(
            unlockableTransport.getOffer(generalOffer.id).id,
            generalOffer.id
        );
    }

    function testAddDuplicateOffer() external {
        // Arrange
        vm.prank(MSP);
        unlockableTransport.addOffer(generalOffer);
        // Act
        // Assert
        vm.prank(MSP);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__OfferIdAlreadyExists
                .selector
        );
        unlockableTransport.addOffer(generalOffer);
    }

    function testAddOfferWithIdZero() external {
        // Arrange
        generalOffer.id = 0;
        // Act
        // Assert
        vm.prank(MSP);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__IdCannotBeZeroError
                .selector
        );
        unlockableTransport.addOffer(generalOffer);
    }

    function testAddOfferFromNotOwner() external {
        // Arrange
        // Act
        // Assert
        vm.prank(USER1);
        vm.expectRevert(
            UnlockableTransport.UnlockableTransport__NotOwner.selector
        );
        unlockableTransport.addOffer(generalOffer);
        vm.prank(VEHICLE1);
        vm.expectRevert(
            UnlockableTransport.UnlockableTransport__NotOwner.selector
        );
        unlockableTransport.addOffer(generalOffer);
    }

    // ToggleOfferEnabled

    modifier offerAdded() {
        vm.prank(MSP);
        unlockableTransport.addOffer(generalOffer);
        _;
    }

    function testToggleOfferOff() external offerAdded {
        // Arrange
        // Act
        vm.prank(MSP);
        vm.expectEmit(true, false, false, true, address(unlockableTransport));
        emit ToggleEnableOfferEvent(generalOffer.id, !generalOffer.enabled);
        unlockableTransport.toggleOfferEnabled(generalOffer.id);
        // Assert
        assertEq(unlockableTransport.getAllOffers().length, 1);
        assertEq(unlockableTransport.getOffer(generalOffer.id).enabled, false);
    }

    function testToggleOfferOn() external offerAdded {
        // Arrange
        vm.prank(MSP);
        unlockableTransport.toggleOfferEnabled(generalOffer.id);
        // Act
        vm.prank(MSP);
        vm.expectEmit(true, false, false, true, address(unlockableTransport));
        emit ToggleEnableOfferEvent(generalOffer.id, generalOffer.enabled);
        unlockableTransport.toggleOfferEnabled(generalOffer.id);
        // Assert
        assertEq(unlockableTransport.getAllOffers().length, 1);
        assertEq(unlockableTransport.getOffer(generalOffer.id).enabled, true);
    }

    function testToggleOfferNotExist() external offerAdded {
        // Arrange
        // Act
        // Assert
        vm.prank(MSP);
        vm.expectRevert(
            UnlockableTransport.UnlockableTransport__OfferNotExist.selector
        );
        unlockableTransport.toggleOfferEnabled(generalOffer.id + 1);
    }

    function testToggleOfferNotOwner() external offerAdded {
        // Arrange
        // Act
        // Assert
        vm.prank(USER1);
        vm.expectRevert(
            UnlockableTransport.UnlockableTransport__NotOwner.selector
        );
        unlockableTransport.toggleOfferEnabled(generalOffer.id);
    }

    // ToggleDelete

    function testDeleteOffer() external offerAdded {
        // Arrange
        // Act
        vm.prank(MSP);
        vm.expectEmit(true, false, false, false, address(unlockableTransport));
        emit DeleteOfferEvent(generalOffer.id);
        unlockableTransport.deleteOffer(generalOffer.id);
        // Assert
        assertEq(unlockableTransport.getAllOffers().length, 0);
        vm.expectRevert(
            UnlockableTransport.UnlockableTransport__OfferNotExist.selector
        );
        unlockableTransport.getOffer(generalOffer.id);
    }

    function testDeleteOfferNotExist() external offerAdded {
        // Arrange
        // Act

        // Assert
        vm.prank(MSP);
        vm.expectRevert(
            UnlockableTransport.UnlockableTransport__OfferNotExist.selector
        );
        unlockableTransport.deleteOffer(generalOffer.id + 1);
    }

    function testDeleteOfferInUse() external offerAdded vehicleAdded {
        // Arrange
        hoax(USER1, generalOffer.UnlockPrice + 1);
        unlockableTransport.Unlock{value: generalOffer.UnlockPrice + 1}(
            generalVehicle.id,
            generalOffer.id
        );
        vm.prank(MSP);
        unlockableTransport.toggleOfferEnabled(generalOffer.id);
        // Act
        // Assert
        vm.prank(MSP);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__cannotDeleteAnOfferCurrentlyInUse
                .selector
        );
        unlockableTransport.deleteOffer(generalOffer.id);
    }

    function testDeleteOfferNotOwner() external offerAdded {
        // Arrange
        // Act
        // Assert
        vm.prank(USER1);
        vm.expectRevert(
            UnlockableTransport.UnlockableTransport__NotOwner.selector
        );
        unlockableTransport.deleteOffer(generalOffer.id);
    }

    // SetKm

    function testSetKm() external vehicleAdded {
        // Arrange
        // Act
        vm.prank(VEHICLE1);
        vm.expectEmit(true, true, false, false, address(unlockableTransport));
        emit VehicleKmSet(generalVehicle.id, KM1);
        unlockableTransport.setKm(KM1);
        // Assert
        assertEq(
            unlockableTransport.getVehicle(generalVehicle.id).totalKm,
            KM1
        );
    }

    function testSetLowerKm() external vehicleAdded {
        // Arrange
        vm.prank(VEHICLE1);
        unlockableTransport.setKm(KM2);
        // Act
        // Assert
        vm.prank(VEHICLE1);
        vm.expectRevert(
            UnlockableTransport.UnlockableTransport__KmCannotDecrease.selector
        );
        unlockableTransport.setKm(KM1);
    }

    function testSetKmNotVehicle() external vehicleAdded {
        // Arrange
        // Act
        // Assert
        vm.prank(USER1);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__AddressIsNotAVehicleError
                .selector
        );
        unlockableTransport.setKm(KM1);
    }

    // setBattery

    function testSetBattery() external vehicleAdded {
        // Arrange
        // Act
        vm.prank(VEHICLE1);
        vm.expectEmit(true, true, false, false, address(unlockableTransport));
        emit VehicleBatterySet(generalVehicle.id, HALFBATTERY);
        unlockableTransport.setBattery(HALFBATTERY);
        // Assert
        assertEq(
            unlockableTransport.getVehicle(generalVehicle.id).battery,
            HALFBATTERY
        );
    }

    function testSetBatteryNotVehicle() external vehicleAdded {
        // Arrange
        // Act
        // Assert
        vm.prank(USER1);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__AddressIsNotAVehicleError
                .selector
        );
        unlockableTransport.setBattery(HALFBATTERY);
    }

    // SetPosition

    function testSetPosition() external vehicleAdded {
        // Arrange
        // Act
        vm.prank(VEHICLE1);
        vm.expectEmit(true, true, false, false, address(unlockableTransport));
        emit VehiclePositionSet(generalVehicle.id, RANDOMPOSITION);
        unlockableTransport.setPosition(RANDOMPOSITION);
        // Assert
        assertEq(
            unlockableTransport.getVehicle(generalVehicle.id).position.x,
            RANDOMPOSITION.x
        );
        assertEq(
            unlockableTransport.getVehicle(generalVehicle.id).position.y,
            RANDOMPOSITION.y
        );
    }

    function testSetPositionNotVehicle() external vehicleAdded {
        // Arrange
        // Act
        // Assert
        vm.prank(USER1);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__AddressIsNotAVehicleError
                .selector
        );
        unlockableTransport.setPosition(RANDOMPOSITION);
    }

    // unlock

    function testUnlock() external vehicleAdded offerAdded {
        // Arrange
        vm.prank(VEHICLE1);
        unlockableTransport.setKm(KM1);
        // Act
        hoax(USER1, RANDOMETHAMOUNT);
        vm.expectEmit(true, true, true, true, address(unlockableTransport));
        emit VehicleUnlocked(
            generalVehicle.id,
            USER1,
            generalOffer.id,
            KM1,
            block.timestamp
        );
        unlockableTransport.Unlock{value: RANDOMETHAMOUNT}(
            generalVehicle.id,
            generalOffer.id
        );
        vm.prank(VEHICLE1);
        unlockableTransport.setKm(KM2);
        // Assert
        assertEq(
            unlockableTransport.isIdInAvailableList(generalVehicle.id),
            false
        );
        assertEq(
            unlockableTransport
                .getVehicleStatus(generalVehicle.id)
                .currentOwner,
            USER1
        );
        assertEq(
            unlockableTransport.getVehicleStatus(generalVehicle.id).offerId,
            generalOffer.id
        );
        assertEq(
            unlockableTransport.getVehicleStatus(generalVehicle.id).startKm,
            KM1
        );
        assertEq(
            unlockableTransport.getVehicleStatus(generalVehicle.id).startTime,
            block.timestamp
        );
        assertEq(
            unlockableTransport.getVehicleStatus(generalVehicle.id).maxToSpend,
            RANDOMETHAMOUNT
        );
    }

    function testUnlockVehicleNotExist() external vehicleAdded offerAdded {
        // Arrange
        // Act
        // Assert
        hoax(USER1, RANDOMETHAMOUNT);
        vm.expectRevert(
            UnlockableTransport.UnlockableTransport__VehicleNotExist.selector
        );
        unlockableTransport.Unlock{value: RANDOMETHAMOUNT}(
            generalVehicle.id + 1,
            generalOffer.id
        );
    }

    function testUnlockVehicleAlreadyBooked() external vehicleAdded offerAdded {
        // Arrange
        hoax(USER1, RANDOMETHAMOUNT);
        unlockableTransport.Unlock{value: RANDOMETHAMOUNT}(
            generalVehicle.id,
            generalOffer.id
        );
        // Act
        // Assert
        hoax(USER2, RANDOMETHAMOUNT);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__cannotBookAVehicleCurrentlyInUse
                .selector
        );
        unlockableTransport.Unlock{value: RANDOMETHAMOUNT}(
            generalVehicle.id,
            generalOffer.id
        );
    }

    function testUnlockVehicleNotEnabled() external vehicleAdded offerAdded {
        // Arrange
        vm.prank(MSP);
        unlockableTransport.toggleVehicleEnabled(generalVehicle.id);
        // Act
        // Assert
        hoax(USER1, RANDOMETHAMOUNT);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__cannotBookDisabledVehicle
                .selector
        );
        unlockableTransport.Unlock{value: RANDOMETHAMOUNT}(
            generalVehicle.id,
            generalOffer.id
        );
    }

    function testUnlockVehicleZeroBattery() external vehicleAdded offerAdded {
        // Arrange
        vm.prank(VEHICLE1);
        unlockableTransport.setBattery(0);
        // Act
        // Assert
        hoax(USER1, RANDOMETHAMOUNT);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__cannotBookDischargedVehicle
                .selector
        );
        unlockableTransport.Unlock{value: RANDOMETHAMOUNT}(
            generalVehicle.id,
            generalOffer.id
        );
    }

    function testUnlockOfferNotExist() external vehicleAdded offerAdded {
        // Arrange
        // Act
        // Assert
        hoax(USER1, RANDOMETHAMOUNT);
        vm.expectRevert(
            UnlockableTransport.UnlockableTransport__OfferNotExist.selector
        );
        unlockableTransport.Unlock{value: RANDOMETHAMOUNT}(
            generalVehicle.id,
            generalOffer.id + 1
        );
    }

    function testUnlockOfferNotEnabled() external vehicleAdded offerAdded {
        // Arrange
        vm.prank(MSP);
        unlockableTransport.toggleOfferEnabled(generalOffer.id);
        // Act
        // Assert
        hoax(USER1, RANDOMETHAMOUNT);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__cannotUseDisabledOffer
                .selector
        );
        unlockableTransport.Unlock{value: RANDOMETHAMOUNT}(
            generalVehicle.id,
            generalOffer.id
        );
    }

    function testUnlockOfferNotEnoughEth() external vehicleAdded offerAdded {
        // Arrange
        // Act
        // Assert
        hoax(USER1, RANDOMETHAMOUNT);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__notEnoughEthToCoverUnlock
                .selector
        );
        unlockableTransport.Unlock{value: generalOffer.UnlockPrice}(
            generalVehicle.id,
            generalOffer.id
        );

        hoax(USER1, RANDOMETHAMOUNT);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__notEnoughEthToCoverUnlock
                .selector
        );
        unlockableTransport.Unlock{value: generalOffer.UnlockPrice - 1}(
            generalVehicle.id,
            generalOffer.id
        );
    }

    // Lock

    modifier user1Renting() {
        hoax(USER1, RANDOMETHAMOUNT);
        unlockableTransport.Unlock{value: RANDOMETHAMOUNT}(
            generalVehicle.id,
            generalOffer.id
        );
        _;
    }

    function testLock() external vehicleAdded offerAdded user1Renting {
        // Arrange
        vm.prank(VEHICLE1);
        unlockableTransport.setKm(KM1);
        Types.RentStatus memory status = unlockableTransport.getVehicleStatus(
            generalVehicle.id
        );

        uint256 cost = ((KM1 - status.startKm - generalOffer.KmAllowance) *
            generalOffer.pricePerKm) +
            ((FINALTIMESTAMP - status.startTime - generalOffer.TimeAllowance) *
                generalOffer.pricePerSec) +
            generalOffer.UnlockPrice;
        // Act
        vm.prank(USER1);
        vm.warp(FINALTIMESTAMP);
        vm.expectEmit(true, true, true, false, address(unlockableTransport));
        emit VehicleLocked(generalVehicle.id, USER1, cost);
        unlockableTransport.Lock(generalVehicle.id);
        // Assert
        assertEq(USER1.balance, RANDOMETHAMOUNT - cost);
        assertEq(
            unlockableTransport.isIdInAvailableList(generalVehicle.id),
            true
        );
        assertEq(
            unlockableTransport
                .getVehicleStatus(generalVehicle.id)
                .currentOwner,
            address(0)
        );
        assertEq(unlockableTransport.getOwnerBalance(), cost);
    }

    function testLockDisabledVehicle()
        external
        vehicleAdded
        offerAdded
        user1Renting
    {
        // Arrange
        vm.prank(MSP);
        unlockableTransport.toggleVehicleEnabled(generalVehicle.id);
        vm.prank(VEHICLE1);
        unlockableTransport.setKm(KM1);
        Types.RentStatus memory status = unlockableTransport.getVehicleStatus(
            generalVehicle.id
        );
        uint256 cost = ((KM1 - status.startKm - generalOffer.KmAllowance) *
            generalOffer.pricePerKm) +
            ((FINALTIMESTAMP - status.startTime - generalOffer.TimeAllowance) *
                generalOffer.pricePerSec) +
            generalOffer.UnlockPrice;
        // Act
        vm.prank(USER1);
        vm.warp(FINALTIMESTAMP);
        vm.expectEmit(true, true, true, false, address(unlockableTransport));
        emit VehicleLocked(generalVehicle.id, USER1, cost);
        unlockableTransport.Lock(generalVehicle.id);
        // Assert
        assertEq(USER1.balance, RANDOMETHAMOUNT - cost);
        assertEq(
            unlockableTransport.isIdInAvailableList(generalVehicle.id),
            false
        );
        assertEq(
            unlockableTransport
                .getVehicleStatus(generalVehicle.id)
                .currentOwner,
            address(0)
        );
        assertEq(unlockableTransport.getOwnerBalance(), cost);
    }

    function testLockUnderAllowance()
        external
        vehicleAdded
        offerAdded
        user1Renting
    {
        // Arrange
        vm.prank(VEHICLE1);
        unlockableTransport.setKm(generalOffer.KmAllowance - 1);
        uint256 cost = generalOffer.UnlockPrice;
        // Act
        vm.prank(USER1);
        vm.warp(generalOffer.TimeAllowance - 1);
        vm.expectEmit(true, true, true, false, address(unlockableTransport));
        emit VehicleLocked(generalVehicle.id, USER1, cost);
        unlockableTransport.Lock(generalVehicle.id);
        // Assert
        assertEq(USER1.balance, RANDOMETHAMOUNT - cost);
        assertEq(
            unlockableTransport.isIdInAvailableList(generalVehicle.id),
            true
        );
        assertEq(
            unlockableTransport
                .getVehicleStatus(generalVehicle.id)
                .currentOwner,
            address(0)
        );
        assertEq(unlockableTransport.getOwnerBalance(), cost);
    }

    function testLockOverSpent() external vehicleAdded offerAdded user1Renting {
        // Arrange
        vm.prank(VEHICLE1);
        unlockableTransport.setKm(LOTOFKM);
        Types.RentStatus memory status = unlockableTransport.getVehicleStatus(
            generalVehicle.id
        );
        // Act
        vm.prank(USER1);
        vm.warp(LOTOFTIME);
        vm.expectEmit(true, true, true, false, address(unlockableTransport));
        emit VehicleLocked(generalVehicle.id, USER1, status.maxToSpend);
        unlockableTransport.Lock(generalVehicle.id);
        // Assert
        assertEq(USER1.balance, 0);
        assertEq(
            unlockableTransport.isIdInAvailableList(generalVehicle.id),
            true
        );
        assertEq(
            unlockableTransport
                .getVehicleStatus(generalVehicle.id)
                .currentOwner,
            address(0)
        );
        assertEq(unlockableTransport.getOwnerBalance(), RANDOMETHAMOUNT);
    }

    function testLockNotExistantVehicle()
        external
        vehicleAdded
        offerAdded
        user1Renting
    {
        // Arrange
        vm.prank(VEHICLE1);
        unlockableTransport.setKm(KM1);
        // Act
        // Assert
        vm.prank(USER1);
        vm.warp(FINALTIMESTAMP);
        vm.expectRevert(
            UnlockableTransport.UnlockableTransport__VehicleNotExist.selector
        );
        unlockableTransport.Lock(generalVehicle.id + 1);
    }

    function testLockNotOwnedVehicle()
        external
        vehicleAdded
        offerAdded
        user1Renting
    {
        // Arrange
        vm.prank(VEHICLE1);
        unlockableTransport.setKm(KM1);
        // Act
        // Assert
        vm.prank(USER2);
        vm.warp(FINALTIMESTAMP);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__cannotLockVehicleNotOwned
                .selector
        );
        unlockableTransport.Lock(generalVehicle.id);
    }

    function testLockNotRentingVehicle()
        external
        vehicleAdded
        offerAdded
        user1Renting
    {
        // Arrange
        vm.prank(MSP);
        generalVehicle.id = 2;
        generalVehicle.vehicleAddress = VEHICLE2;
        unlockableTransport.addVehicle(generalVehicle);
        vm.prank(VEHICLE2);
        unlockableTransport.setKm(KM1);
        // Act
        // Assert
        vm.prank(USER1);
        vm.warp(FINALTIMESTAMP);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__cannotLockVehicleNotOwned
                .selector
        );
        unlockableTransport.Lock(generalVehicle.id);
    }

    // ForceLock

    function testForceLock() external vehicleAdded offerAdded user1Renting {
        // Arrange
        vm.prank(VEHICLE1);
        unlockableTransport.setKm(KM1);
        Types.RentStatus memory status = unlockableTransport.getVehicleStatus(
            generalVehicle.id
        );
        uint256 cost = ((KM1 - status.startKm - generalOffer.KmAllowance) *
            generalOffer.pricePerKm) +
            ((FINALTIMESTAMP - status.startTime - generalOffer.TimeAllowance) *
                generalOffer.pricePerSec) +
            generalOffer.UnlockPrice;
        // Act
        vm.prank(VEHICLE1);
        vm.warp(FINALTIMESTAMP);
        vm.expectEmit(true, true, true, false, address(unlockableTransport));
        emit VehicleForceLocked(generalVehicle.id, status.currentOwner, cost);
        unlockableTransport.ForceLock();
        // Assert
        assertEq(USER1.balance, RANDOMETHAMOUNT - cost);
        assertEq(
            unlockableTransport.isIdInAvailableList(generalVehicle.id),
            true
        );
        assertEq(
            unlockableTransport
                .getVehicleStatus(generalVehicle.id)
                .currentOwner,
            address(0)
        );
        assertEq(unlockableTransport.getOwnerBalance(), cost);
    }

    function testForceLockDisabledVehicle()
        external
        vehicleAdded
        offerAdded
        user1Renting
    {
        // Arrange
        vm.prank(MSP);
        unlockableTransport.toggleVehicleEnabled(generalVehicle.id);
        vm.prank(VEHICLE1);
        unlockableTransport.setKm(KM1);
        Types.RentStatus memory status = unlockableTransport.getVehicleStatus(
            generalVehicle.id
        );
        uint256 cost = ((KM1 - status.startKm - generalOffer.KmAllowance) *
            generalOffer.pricePerKm) +
            ((FINALTIMESTAMP - status.startTime - generalOffer.TimeAllowance) *
                generalOffer.pricePerSec) +
            generalOffer.UnlockPrice;
        // Act
        vm.prank(VEHICLE1);
        vm.warp(FINALTIMESTAMP);
        vm.expectEmit(true, true, true, false, address(unlockableTransport));
        emit VehicleForceLocked(generalVehicle.id, status.currentOwner, cost);
        unlockableTransport.ForceLock();
        // Assert
        assertEq(USER1.balance, RANDOMETHAMOUNT - cost);
        assertEq(
            unlockableTransport.isIdInAvailableList(generalVehicle.id),
            false
        );
        assertEq(
            unlockableTransport
                .getVehicleStatus(generalVehicle.id)
                .currentOwner,
            address(0)
        );
        assertEq(unlockableTransport.getOwnerBalance(), cost);
    }

    function testForceLockUnderAllowance()
        external
        vehicleAdded
        offerAdded
        user1Renting
    {
        // Arrange
        vm.prank(VEHICLE1);
        unlockableTransport.setKm(generalOffer.KmAllowance - 1);
        Types.RentStatus memory status = unlockableTransport.getVehicleStatus(
            generalVehicle.id
        );
        uint256 cost = generalOffer.UnlockPrice;
        // Act
        vm.prank(VEHICLE1);
        vm.warp(generalOffer.TimeAllowance - 1);
        vm.expectEmit(true, true, true, false, address(unlockableTransport));
        emit VehicleForceLocked(generalVehicle.id, status.currentOwner, cost);
        unlockableTransport.ForceLock();
        // Assert
        assertEq(USER1.balance, RANDOMETHAMOUNT - cost);
        assertEq(
            unlockableTransport.isIdInAvailableList(generalVehicle.id),
            true
        );
        assertEq(
            unlockableTransport
                .getVehicleStatus(generalVehicle.id)
                .currentOwner,
            address(0)
        );
        assertEq(unlockableTransport.getOwnerBalance(), cost);
    }

    function testForceLockOverSpent()
        external
        vehicleAdded
        offerAdded
        user1Renting
    {
        // Arrange
        vm.prank(VEHICLE1);
        unlockableTransport.setKm(LOTOFKM);
        Types.RentStatus memory status = unlockableTransport.getVehicleStatus(
            generalVehicle.id
        );
        // Act
        vm.prank(VEHICLE1);
        vm.warp(LOTOFTIME);
        vm.expectEmit(true, true, true, false, address(unlockableTransport));
        emit VehicleForceLocked(
            generalVehicle.id,
            status.currentOwner,
            status.maxToSpend
        );
        unlockableTransport.ForceLock();
        // Assert
        assertEq(USER1.balance, 0);
        assertEq(
            unlockableTransport.isIdInAvailableList(generalVehicle.id),
            true
        );
        assertEq(
            unlockableTransport
                .getVehicleStatus(generalVehicle.id)
                .currentOwner,
            address(0)
        );
        assertEq(unlockableTransport.getOwnerBalance(), RANDOMETHAMOUNT);
    }

    function testForceLockNotExistantVehicle()
        external
        vehicleAdded
        offerAdded
        user1Renting
    {
        // Arrange
        vm.prank(VEHICLE1);
        unlockableTransport.setKm(KM1);
        // Act
        // Assert
        vm.prank(VEHICLE2);
        vm.warp(FINALTIMESTAMP);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__AddressIsNotAVehicleError
                .selector
        );
        unlockableTransport.ForceLock();
    }

    function testForceLockNotRentingVehicle() external vehicleAdded offerAdded {
        // Arrange
        // Act
        // Assert
        vm.prank(VEHICLE1);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__cannotLockVehicleAlreadyLocked
                .selector
        );
        unlockableTransport.ForceLock();
    }

    modifier vehicleAdded2() {
        vm.prank(MSP);
        generalVehicle.id = 2;
        generalVehicle.vehicleAddress = VEHICLE2;
        unlockableTransport.addVehicle(generalVehicle);
        _;
    }

    function testWithdraw()
        external
        vehicleAdded
        offerAdded
        user1Renting
        vehicleAdded2
    {
        // Arrange
        hoax(USER2, RANDOMETHAMOUNT);
        unlockableTransport.Unlock{value: RANDOMETHAMOUNT}(
            generalVehicle.id,
            generalOffer.id
        );
        // Act
        vm.prank(USER2);
        unlockableTransport.Lock(generalVehicle.id);
        uint256 USER2COST = generalOffer.UnlockPrice;
        // act
        vm.prank(MSP);
        vm.expectEmit(true, false, false, false, address(unlockableTransport));
        emit newWithdraw(USER2COST);
        unlockableTransport.withdraw();
        // Assert
        assertEq(unlockableTransport.getOwnerBalance(), 0);
        assertEq(MSP.balance, USER2COST);
        assertEq(address(unlockableTransport).balance, RANDOMETHAMOUNT);
    }

    function testWithdrawNotFromOwner() external {
        vm.prank(USER1);
        vm.expectRevert(
            UnlockableTransport.UnlockableTransport__NotOwner.selector
        );
        unlockableTransport.withdraw();
    }

    function testWithdrawWithZeroBalance() external {
        vm.prank(MSP);
        vm.expectRevert(
            UnlockableTransport
                .UnlockableTransport__NotEnoughEthForWithdraw
                .selector
        );
        unlockableTransport.withdraw();
    }
}

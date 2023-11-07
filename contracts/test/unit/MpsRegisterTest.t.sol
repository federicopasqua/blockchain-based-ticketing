// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {DeployMspRegister} from "../../script/DeployMspRegister.s.sol";
import {MspRegister} from "../../src/MspRegister.sol";
import {UnlockableTransport} from "../../src/UnlockableTransport.sol";
import {PrepaidTickets} from "../../src/PrepaidTickets.sol";
import {Types} from "../../src/library/types.sol";
import {Test} from "forge-std/Test.sol";

contract MspRegisterTest is Test {
    MspRegister public mspRegister;
    address constant USER = address(0x1);

    string constant MSPNAME = "MspName";
    string constant MSPNAME2 = "MspName2";
    string constant MSPENDPOINT = "https://mspApi.com/";
    string constant MSPEMPTYENDPOINT = "";

    event NewMsp(
        string indexed name,
        string endpoint,
        UnlockableTransport unlockableTransport,
        PrepaidTickets prepaidTickets
    );

    function setUp() external {
        DeployMspRegister deployer = new DeployMspRegister();
        mspRegister = deployer.run();
    }

    function testRegister() external {
        // Arrange
        // Act
        vm.prank(USER);
        vm.expectEmit(true, false, false, false, address(mspRegister));
        emit NewMsp(
            MSPNAME,
            MSPEMPTYENDPOINT,
            UnlockableTransport(address(0)),
            PrepaidTickets(address(0))
        );
        (
            UnlockableTransport unlockableTransportContract,
            PrepaidTickets prepaidTicketsContract
        ) = mspRegister.register(MSPNAME, MSPEMPTYENDPOINT);
        // Assert
        assert(address(unlockableTransportContract) != address(0));
        assert(address(prepaidTicketsContract) != address(0));
        assertEq(mspRegister.getAllMsp().length, 1);
        Types.Msp memory msp = mspRegister.getMsp(USER);
        assertEq(msp.name, MSPNAME);
        assertEq(msp.endpoint, MSPEMPTYENDPOINT);
        assertEq(
            address(msp.unlockableContract),
            address(unlockableTransportContract)
        );
        assertEq(address(msp.ticketContract), address(prepaidTicketsContract));
        assertEq(unlockableTransportContract.getOwner(), USER);
    }

    function testRegisterTwiceShouldRevert() external {
        // Arrange
        vm.startPrank(USER);
        mspRegister.register(MSPNAME, MSPEMPTYENDPOINT);
        // act
        // assert
        vm.expectRevert(
            MspRegister.MspRegister__AddressIsAlreadyRegisteredError.selector
        );
        mspRegister.register(MSPNAME2, MSPENDPOINT);
        vm.stopPrank();
    }
}

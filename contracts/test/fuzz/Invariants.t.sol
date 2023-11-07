// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import {Test} from "forge-std/Test.sol";
import {StdInvariant} from "forge-std/StdInvariant.sol";
import {console} from "forge-std/console.sol";
import {MspRegister} from "../../src/MspRegister.sol";
import {PrepaidTickets} from "../../src/PrepaidTickets.sol";
import {UnlockableTransport} from "../../src/UnlockableTransport.sol";
import {DeployMspRegister} from "../../script/DeployMspRegister.s.sol";
import {Handler} from "./Handler.t.sol";

contract StopOnRevertInvariants is StdInvariant, Test {
    MspRegister public mspRegister;
    PrepaidTickets public prepaidTickets;
    UnlockableTransport public unlockableTransport;

    uint256 constant OWNERPKEY =
        0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318;

    function setUp() external {
        DeployMspRegister deployer = new DeployMspRegister();
        mspRegister = deployer.run();
        hoax(vm.addr(OWNERPKEY));
        (unlockableTransport, prepaidTickets) = mspRegister.register("MSP", "");
        Handler handler = new Handler(
            prepaidTickets,
            unlockableTransport,
            OWNERPKEY
        );
        targetContract(address(handler));
    }

    function invariant_contractsBalanceShouldAlwaysBeTheSameToOwnerCredit()
        public
        view
    {
        assert(
            prepaidTickets.getOwnerBalance() == address(prepaidTickets).balance
        );
        assert(
            unlockableTransport.getOwnerBalance() ==
                address(unlockableTransport).balance
        );
    }
}

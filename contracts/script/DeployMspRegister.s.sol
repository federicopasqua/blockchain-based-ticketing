// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {Script} from "forge-std/Script.sol";
import {MspRegister} from "../src/MspRegister.sol";
/**
 * @author  federicopasqua
 * @title   MspRegister deploy script
 * @notice  Script to automatically deploy the MspRegister contract
 */

contract DeployMspRegister is Script {
    /**
     * @notice  Function to deploy the contract
     * @return  MspRegister  Address of the created contract
     */
    function run() public returns (MspRegister) {
        vm.startBroadcast();
        MspRegister mspRegister = new MspRegister();
        vm.stopBroadcast();

        return mspRegister;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {Script} from "forge-std/Script.sol";
import {DevOpsTools} from "foundry-devops/src/DevOpsTools.sol";
import {MspRegister} from "../src/MspRegister.sol";
import {UnlockableTransport} from "../src/UnlockableTransport.sol";
import {Types} from "../src/library/types.sol";

/**
 * @author  federicopasqua
 * @title   Random numbers
 * @notice  Contract to pull randomness for tests contratcs using openssl
 */
contract Random is Script {
    /**
     * @notice  Function to get a random bytes32 of data
     * @return  Random bytes32 data
     */
    function randomBytes32() public returns (bytes32) {

        string[] memory inputs = new string[](4);

        inputs[0] = "openssl";
        inputs[1] = "rand";
        inputs[2] = "-hex";
        inputs[3] = "60";

        bytes memory res = vm.ffi(inputs);

        return keccak256(res);
    }

    /**
     * @notice  Function to get a random number between a min and a max
     * @param   min  Lower bound for the returned random number
     * @param   max  Upper bound for the returned random number
     * @return  Random number uint256
     */
    function randomNumber(uint256 min, uint256 max) public returns (uint256) {
        uint256 randomBytes = uint256(randomBytes32()) % (max - min);
        return min + randomBytes;
    }
}

/**
 * @author  federicopasqua
 * @title   Script to create a test Trenitalia MSP
 * @notice  Script to automatically create a Trenitalia MSP for testing purposes
 */
contract CreateTrenitaliaMsp is Script {   
    function run() external {
        address mspRegisterContract = DevOpsTools.get_most_recent_deployment("MspRegister", block.chainid);
        vm.startBroadcast();
        MspRegister(mspRegisterContract).register("Trenitalia", "http://msp-backend-trenitalia");
        vm.stopBroadcast();
    }
}

/**
 * @author  federicopasqua
 * @title   Script to create a test Italo MSP
 * @notice  Script to automatically create a Italo MSP for testing purposes
 */
contract CreateItaloMsp is Script {
    function run() external {
        address mspRegisterContract = DevOpsTools.get_most_recent_deployment("MspRegister", block.chainid);
        vm.startBroadcast();
        MspRegister(mspRegisterContract).register("Italo", "http://msp-backend-italo");
        vm.stopBroadcast();
    }
}

/**
 * @author  federicopasqua
 * @title   Script to create a test NotJustBikes MSP
 * @notice  Script to automatically create a NotJustBikes MSP for testing purposes with associated a few vehicles with random parameters but aposition around the Turin area
 */
contract CreateNotJustBikesMsp is Script {
    function run() external {
        address mspRegisterContract = DevOpsTools.get_most_recent_deployment("MspRegister", block.chainid);
        Random random = new Random();
        vm.startBroadcast();
        (UnlockableTransport unlockableTrasport, ) = MspRegister(mspRegisterContract).register("Not Just Bikes", "");
        for (uint i = 0; i < 50; i++) {
            uint256 randomLat = random.randomNumber(45033435, 45103359);
            uint256 randomLng = random.randomNumber(7631690, 7711613);
            uint256 randomTotalKm = random.randomNumber(0, 1000);
            uint8 randomBattery = uint8(random.randomNumber(0, 100));
            address randomAddress = address(uint160(bytes20(random.randomBytes32())));
            unlockableTrasport.addVehicle(Types.UnlockableVehicle(i + 1, Types.Position(randomLat, randomLng), randomTotalKm, randomBattery, randomAddress, true));
        }
        unlockableTrasport.addOffer(Types.UnlockablesOffer(1, 10000000, 10000000, 1000000000, 0, 5, true));
        vm.stopBroadcast();
    }
}

/**
 * @author  federicopasqua
 * @title   Script to create a test Pedala srl MSP
 * @notice  Script to automatically create a Pedala srl MSP for testing purposes with associated a few vehicles with random parameters but aposition around the Turin area
 */
contract CreatePedalaSrlMsp is Script {
    function run() external {
        address mspRegisterContract = DevOpsTools.get_most_recent_deployment("MspRegister", block.chainid);
        Random random = new Random();
        vm.startBroadcast();
        (UnlockableTransport unlockableTrasport, ) = MspRegister(mspRegisterContract).register("Pedala s.r.l.", "");
        for (uint i = 0; i < 50; i++) {
            uint256 randomLat = random.randomNumber(45033435, 45103359);
            uint256 randomLng = random.randomNumber(7631690, 7711613);
            uint256 randomTotalKm = random.randomNumber(0, 1000);
            uint8 randomBattery = uint8(random.randomNumber(0, 100));
            address randomAddress = address(uint160(bytes20(random.randomBytes32())));
            unlockableTrasport.addVehicle(Types.UnlockableVehicle(i + 1, Types.Position(randomLat, randomLng), randomTotalKm, randomBattery, randomAddress, true));
        }
        unlockableTrasport.addOffer(Types.UnlockablesOffer(1, 100000000, 100000000, 10000000000, 1, 10, true));
        vm.stopBroadcast();
    }
}

/**
 * @author  federicopasqua
 * @title   Script to fund a wallet
 * @notice  Script to fund a specific wallet used in testing and docker deployment
 */
contract SendEthToWallet is Script {
    function run() external {
        vm.startBroadcast();
        (bool success, ) = address(0x23317667d13aA77eF041eF277Dddaf9003C121F8).call{value: 10 ether}("");
        if (!success) {
            revert();
        }
        vm.stopBroadcast();
    }
}
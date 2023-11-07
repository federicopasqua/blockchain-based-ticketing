// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {PrepaidTickets} from "./PrepaidTickets.sol";
import {UnlockableTransport} from "./UnlockableTransport.sol";
import {Types} from "./library/types.sol";

/**
 * @author  federicopasqua
 * @title   MSP register contract
 * @notice  MSP uses this contract to register themselves on the blockchain and deploy their PrepaidTickets and UnlockableTransports contracts
 */

contract MspRegister {

    /*//////////////////////////////////////////////////////////////
                                Errors
    //////////////////////////////////////////////////////////////*/

    error MspRegister__AddressIsAlreadyRegisteredError();
    error MspRegister__MspNotFound();

    /*//////////////////////////////////////////////////////////////
                                State
    //////////////////////////////////////////////////////////////*/

    // List of all the registered MSP
    Types.Msp[] private s_mspList;
    // Mapping between the MSP in the mspList and their owner address
    mapping(address owner => uint256 index) private s_owner;

    /*//////////////////////////////////////////////////////////////
                                Events
    //////////////////////////////////////////////////////////////*/

    event NewMsp(
        string indexed name,
        string endpoint,
        UnlockableTransport unlockableTransport,
        PrepaidTickets prepaidTickets
    );

    /*//////////////////////////////////////////////////////////////
                          External functions
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice  Function for an MSP to register themselves
     * @param   name  Name od the MSP
     * @param   endpoint  Url of the standard API endpoint for the MSP
     * @return  UnlockableTransport  Address of the MSP UnlockableTransport contract
     * @return  PrepaidTickets  Address of the MSP PrepaidTickets contract
     */
    function register(
        string calldata name,
        string calldata endpoint
    ) external returns (UnlockableTransport, PrepaidTickets) {
        // Check that the MSP address is not already registered
        if (s_owner[msg.sender] != 0) {
            revert MspRegister__AddressIsAlreadyRegisteredError();
        }

        UnlockableTransport unlockableTransportContract = new UnlockableTransport(
                msg.sender
            );
        PrepaidTickets prepaidTicketsContract = new PrepaidTickets(msg.sender);
        s_mspList.push(
            Types.Msp(
                name,
                endpoint,
                unlockableTransportContract,
                prepaidTicketsContract
            )
        );
        s_owner[msg.sender] = s_mspList.length;
        emit NewMsp(
            name,
            endpoint,
            unlockableTransportContract,
            prepaidTicketsContract
        );
        return (unlockableTransportContract, prepaidTicketsContract);
    }

    /*//////////////////////////////////////////////////////////////
                        View external functions
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice  Get the list of all registered MSP
     * @return  Types.Msp[]  List of all registered MSP
     */
    function getAllMsp() external view returns (Types.Msp[] memory) {
        return s_mspList;
    }

    /**
     * @notice  Get an MSP given his address
     * @param   mspAddress  The address of the MSP
     * @return  Types.Msp  The MSP information struct
     */
    function getMsp(
        address mspAddress
    ) external view returns (Types.Msp memory) {
        uint256 index = s_owner[mspAddress];
        if (index == 0) {
            revert MspRegister__MspNotFound();
        }
        return s_mspList[index - 1];
    }
}

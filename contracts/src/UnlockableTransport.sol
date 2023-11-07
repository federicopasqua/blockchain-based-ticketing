// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {Types} from "./library/types.sol";

/**
 * @author  federicopasqua
 * @title   Contract to handle unlockable transport
 * @notice  Contract allowes to handle all transport vehicle that has to be unlocked and locked back to be used
 */

contract UnlockableTransport {

    /*//////////////////////////////////////////////////////////////
                                Errors
    //////////////////////////////////////////////////////////////*/

    error UnlockableTransport__AddressIsNotAVehicleError();
    error UnlockableTransport__NotOwner();
    error UnlockableTransport__OfferIdAlreadyExists();
    error UnlockableTransport__OfferNotExist();
    error UnlockableTransport__IdCannotBeZeroError();
    error UnlockableTransport__cannotDeleteAnOfferCurrentlyInUse();
    error UnlockableTransport__cannotUseDisabledOffer();
    error UnlockableTransport__VehicleIdAlreadyExists();
    error UnlockableTransport__VehicleNotExist();
    error UnlockableTransport__VehicleNotRented();
    error UnlockableTransport__AddressAlreadyAssociatedToOtherVehicle();
    error UnlockableTransport__cannotDeleteAVehicleCurrentlyInUse();
    error UnlockableTransport__cannotBookAVehicleCurrentlyInUse();
    error UnlockableTransport__cannotBookDisabledVehicle();
    error UnlockableTransport__cannotBookDischargedVehicle();
    error UnlockableTransport__notEnoughEthToCoverUnlock();
    error UnlockableTransport__cannotLockVehicleNotOwned();
    error UnlockableTransport__cannotLockVehicleAlreadyLocked();
    error UnlockableTransport__KmCannotDecrease();
    error UnlockableTransport__refundFailed();
    error UnlockableTransport__NotEnoughEthForWithdraw();
    error UnlockableTransport__OwnerPaymentFailed();

    /*//////////////////////////////////////////////////////////////
                              Constants
    //////////////////////////////////////////////////////////////*/

    uint256 constant PRECISION = 1e18;

    /*//////////////////////////////////////////////////////////////
                                State
    //////////////////////////////////////////////////////////////*/

    // Address of the contract owner
    address private immutable i_owner;

    // Amount of ETH in wei that the owner can withdraw
    uint256 private s_ownerCredit;
    // List of all the available vehicles for rent
    Types.UnlockableVehicle[] private s_vehicles;
    // Mapping linking an id of a vehicle to the index in the s_vehicles list
    mapping(uint256 id => uint256 index) private s_vehiclesIds;
    // List of currently available for rent vehicles
    Types.UnlockableVehicle[] private s_available;
    // Mapping linking an id of a vehicle to the index in the s_available list
    mapping(uint256 id => uint256 index) private s_availableIds;
    // Mapping linking the id of a vehicle to their rent status
    mapping(uint256 id => Types.RentStatus) private s_status;
    // Mapping linking the address that controls a vehicle to their index in s_vehicles
    mapping(address vehicleAddress => uint256 index)
        private s_vehicleAddressToIndex;

    // List of available offers to use to unlock any vehicle in this contract
    Types.UnlockablesOffer[] private s_availableOffers;
    // Mapping linking an id of an offer to the index in the s_availableOffers list
    mapping(uint256 id => uint256 index) private s_availableOfferIds;

    /*//////////////////////////////////////////////////////////////
                                Events
    //////////////////////////////////////////////////////////////*/

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

    /*//////////////////////////////////////////////////////////////
                               Modifers
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice  Allowes only an address registered as a vehicle to call a function
     */
    modifier onlyVehicle() {
        if (s_vehicleAddressToIndex[msg.sender] == 0) {
            revert UnlockableTransport__AddressIsNotAVehicleError();
        }
        _;
    }

    /**
     * @notice  Allowes only the owner of the contract to call a function
     */
    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert UnlockableTransport__NotOwner();
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
     * @notice  Unlock an available vehicle given its id and an offer id
     * @param   vehicleId  Available vehicle id
     * @param   offerID  Offer id
     */
    function Unlock(uint256 vehicleId, uint256 offerID) external payable {
        // Vehicle checks
        // Check that the vehicle exists
        if (!isIdInVehicleList(vehicleId)) {
            revert UnlockableTransport__VehicleNotExist();
        }
        // Check that the vehicle is available and therefore not in use
        if (getVehicleStatus(vehicleId).currentOwner != address(0)) {
            revert UnlockableTransport__cannotBookAVehicleCurrentlyInUse();
        }
        Types.UnlockableVehicle memory vehicle = getVehicle(vehicleId);
        // Check that the vehicle is enabled to be used
        if (!vehicle.enabled) {
            revert UnlockableTransport__cannotBookDisabledVehicle();
        }
        // Check that the vehicle has available battery/fuel
        if (vehicle.battery == 0) {
            revert UnlockableTransport__cannotBookDischargedVehicle();
        }

        // Offers checks
        // Check that the offer exists
        if (!isIdInOffersList(offerID)) {
            revert UnlockableTransport__OfferNotExist();
        }
        Types.UnlockablesOffer memory offer = getOffer(offerID);
        // Check that the offer is available 
        if (!offer.enabled) {
            revert UnlockableTransport__cannotUseDisabledOffer();
        }

        // Check that the amount of ETH sent is at least enough to cover the unlock fee
        if (msg.value <= offer.UnlockPrice) {
            revert UnlockableTransport__notEnoughEthToCoverUnlock();
        }

        deleteAvailableList(vehicleId);
        s_status[vehicleId] = Types.RentStatus(
            msg.sender,
            offerID,
            vehicle.totalKm,
            block.timestamp,
            msg.value
        );
        emit VehicleUnlocked(
            vehicleId,
            msg.sender,
            offerID,
            vehicle.totalKm,
            block.timestamp
        );
    }

    /**
     * @notice  Lock back a vehicle to stop the rent
     * @param   vehicleId  The vehicle id to stop renting
     */
    function Lock(uint256 vehicleId) external {
        // Check that the vehicle exists
        if (!isIdInVehicleList(vehicleId)) {
            revert UnlockableTransport__VehicleNotExist();
        }

        Types.RentStatus memory status = getVehicleStatus(vehicleId);
        // Check that the vehicle is actually currently rented by the owner
        if (status.currentOwner != msg.sender) {
            revert UnlockableTransport__cannotLockVehicleNotOwned();
        }

        Types.UnlockableVehicle memory vehicle = getVehicle(vehicleId);

        Types.UnlockablesOffer memory offer = getOffer(status.offerId);

        /** 
         * Calculate the fare for the trip.
         * The fare is calculated as the sum of:
         * - number of km (minus the km allowance) multiplied by the cost per km
         * - number of seconds (minus the seconds allowance) multiplied by the cost per second
         * - the unlock price
        */
        uint256 usedKm = vehicle.totalKm - status.startKm;
        uint256 usedTime = block.timestamp - status.startTime;
        uint256 billedKm = 0;
        // We don't add anything if the km are under the allowance
        if (usedKm > offer.KmAllowance) {
            billedKm = usedKm - offer.KmAllowance;
        }
        uint256 billedTime = 0;
        // We don't add anything if the seconds are under the allowance
        if (usedTime > offer.TimeAllowance) {
            billedTime = usedTime - offer.TimeAllowance;
        }

        uint256 total = (billedKm *
            offer.pricePerKm +
            billedTime *
            offer.pricePerSec) + offer.UnlockPrice;

        uint256 refund = 0;
        // We check that the total is less than what the user sent initally since we can't refund a negative number
        if (status.maxToSpend > total) {
            refund = status.maxToSpend - total;
        }

        delete s_status[vehicleId];
        if (vehicle.enabled) {
            addAvailableList(vehicle);
        }
        uint256 amountToOwner = status.maxToSpend - refund;
        s_ownerCredit += amountToOwner;

        (bool success, ) = msg.sender.call{value: refund}("");
        if (!success) {
            revert UnlockableTransport__refundFailed();
        }

        emit VehicleLocked(vehicleId, msg.sender, status.maxToSpend - refund);
    }

    /**
     * @notice  Allow the vehicle to lock itself if, for example, the user current cost is more than what they sent initally
     */
    function ForceLock() external onlyVehicle {
        Types.UnlockableVehicle memory vehicle = s_vehicles[
            s_vehicleAddressToIndex[msg.sender] - 1
        ];

        Types.RentStatus memory status = getVehicleStatus(vehicle.id);

        // Check that the vehicle is currently being rented
        if (status.currentOwner == address(0)) {
            revert UnlockableTransport__cannotLockVehicleAlreadyLocked();
        }

        Types.UnlockablesOffer memory offer = getOffer(status.offerId);

        /** 
         * Calculate the fare for the trip.
         * The fare is calculated as the sum of:
         * - number of km (minus the km allowance) multiplied by the cost per km
         * - number of seconds (minus the seconds allowance) multiplied by the cost per second
         * - the unlock price
        */
        uint256 usedKm = vehicle.totalKm - status.startKm;
        uint256 usedTime = block.timestamp - status.startTime;
        uint256 billedKm = 0;
        // We don't add anything if the km are under the allowance
        if (usedKm > offer.KmAllowance) {
            billedKm = usedKm - offer.KmAllowance;
        }
        uint256 billedTime = 0;
        // We don't add anything if the seconds are under the allowance
        if (usedTime > offer.TimeAllowance) {
            billedTime = usedTime - offer.TimeAllowance;
        }

        uint256 total = (billedKm *
            offer.pricePerKm +
            billedTime *
            offer.pricePerSec) + offer.UnlockPrice;

        uint256 refund = 0;
        // We check that the total is less than what the user sent initally since we can't refund a negative number
        if (status.maxToSpend > total) {
            refund = status.maxToSpend - total;
        }

        delete s_status[vehicle.id];
        if (vehicle.enabled) {
            addAvailableList(vehicle);
        }
        uint256 amountToOwner = status.maxToSpend - refund;
        s_ownerCredit += amountToOwner;

        (bool success, ) = status.currentOwner.call{value: refund}("");
        if (!success) {
            revert UnlockableTransport__refundFailed();
        }

        emit VehicleForceLocked(
            vehicle.id,
            status.currentOwner,
            status.maxToSpend - refund
        );
    }

    /**
     * @notice  Allows the vehicle to update their battery/fuel level
     * @param   percentage  The new battery percentage
     */
    function setBattery(uint8 percentage) external onlyVehicle {
        s_vehicles[s_vehicleAddressToIndex[msg.sender] - 1]
            .battery = percentage;
        emit VehicleBatterySet(
            s_vehicles[s_vehicleAddressToIndex[msg.sender] - 1].id,
            percentage
        );
    }

    /**
     * @notice  Allows the vehicle to update their current position
     * @param   position  The new position
     */
    function setPosition(
        Types.Position calldata position
    ) external onlyVehicle {
        s_vehicles[s_vehicleAddressToIndex[msg.sender] - 1].position = position;
        emit VehiclePositionSet(
            s_vehicles[s_vehicleAddressToIndex[msg.sender] - 1].id,
            position
        );
    }

    /**
     * @notice  Allows the vehicle to update their current position. The new km number can't be greater than the old value
     * @dev     .
     * @param   km  The new km value
     */
    function setKm(uint256 km) external onlyVehicle {
        // Check that the km are higher than the previous value
        if (s_vehicles[s_vehicleAddressToIndex[msg.sender] - 1].totalKm > km) {
            revert UnlockableTransport__KmCannotDecrease();
        }
        s_vehicles[s_vehicleAddressToIndex[msg.sender] - 1].totalKm = km;
        emit VehicleKmSet(
            s_vehicles[s_vehicleAddressToIndex[msg.sender] - 1].id,
            km
        );
    }

    /**
     * @notice  Function used by the owner to withdraw all the available credit
     */
    function withdraw() external onlyOwner {
        // Check that the credit is not zero
        if (s_ownerCredit < 1) {
            revert UnlockableTransport__NotEnoughEthForWithdraw();
        }
        uint256 credit = s_ownerCredit;
        s_ownerCredit = 0;
        emit newWithdraw(credit);

        (bool success, ) = i_owner.call{value: credit}("");
        if (!success) {
            revert UnlockableTransport__OwnerPaymentFailed();
        }
    }

    /**
     * @notice  Allow the owner to add a new offer
     * @param   offer  Struct describing the new offer to be added
     */
    function addOffer(
        Types.UnlockablesOffer calldata offer
    ) external onlyOwner {
        // Check that it doesn't exist an offer with the same id
        if (isIdInOffersList(offer.id)) {
            revert UnlockableTransport__OfferIdAlreadyExists();
        }
        // Check that the offer id is not 0
        if (offer.id == 0) {
            revert UnlockableTransport__IdCannotBeZeroError();
        }
        addOfferList(offer);
        emit AddOfferEvent(offer.id, offer.enabled);
    }

    /**
     * @notice  Enable the owner to enable/disable an offer
     * @param   id  The id of the offer to be enabled/disabled
     */
    function toggleOfferEnabled(uint256 id) external onlyOwner {
        // Check that the offer exists
        if (!isIdInOffersList(id)) {
            revert UnlockableTransport__OfferNotExist();
        }
        Types.UnlockablesOffer memory offer = getOffer(id);
        offer.enabled = !offer.enabled;

        s_availableOffers[s_availableOfferIds[id] - 1] = offer;
        emit ToggleEnableOfferEvent(offer.id, offer.enabled);
    }

    /**
     * @notice  Enable the owner to delete an offer. An offer can be deleted only if not currently in use
     * @param   id  The id of the offer to be deleted
     */
    function deleteOffer(uint256 id) external onlyOwner {
        // Check that the offer exists
        if (!isIdInOffersList(id)) {
            revert UnlockableTransport__OfferNotExist();
        }
        // Loop through all the vehicle to check that no one is being rented with this offer
        for (uint256 i = 0; i < s_vehicles.length; i++) {
            if (getVehicleStatus(s_vehicles[i].id).offerId == id) {
                revert UnlockableTransport__cannotDeleteAnOfferCurrentlyInUse();
            }
        }
        deleteOfferList(id);
        emit DeleteOfferEvent(id);
    }

    /**
     * @notice  Allow the owner to add a new vehicle
     * @param   vehicle  Struct describing the new vehicle to be added
     */
    function addVehicle(
        Types.UnlockableVehicle calldata vehicle
    ) external onlyOwner {
        // Check that the vehicle id already doesn't exist
        if (isIdInVehicleList(vehicle.id)) {
            revert UnlockableTransport__VehicleIdAlreadyExists();
        }
        // Check that the vehicle id is not zero
        if (vehicle.id == 0) {
            revert UnlockableTransport__IdCannotBeZeroError();
        }
        // Check that the vehicle address is unique
        if (s_vehicleAddressToIndex[vehicle.vehicleAddress] != 0) {
            revert UnlockableTransport__AddressAlreadyAssociatedToOtherVehicle();
        }
        addVehicleList(vehicle);
        if (vehicle.enabled) {
            addAvailableList(vehicle);
        }
        emit AddVehicleEvent(
            vehicle.id,
            vehicle.vehicleAddress,
            vehicle.enabled
        );
    }

    /**
     * @notice  Enable the owner to enable/disable a vehicle
     * @param   id  The id of the vehicle to be enabled/disabled
     */
    function toggleVehicleEnabled(uint256 id) external onlyOwner {
        // Check that the vehicle exists
        if (!isIdInVehicleList(id)) {
            revert UnlockableTransport__VehicleNotExist();
        }
        Types.UnlockableVehicle memory vehicle = getVehicle(id);
        vehicle.enabled = !vehicle.enabled;
        s_vehicles[s_vehiclesIds[id] - 1] = vehicle;
        if (isIdInAvailableList(id) && !vehicle.enabled) {
            deleteAvailableList(id);
        } else if (!isIdInAvailableList(id) && vehicle.enabled) {
            addAvailableList(vehicle);
        }
        emit ToggleEnableVehicleEvent(
            vehicle.id,
            vehicle.vehicleAddress,
            vehicle.enabled
        );
    }

    /**
     * @notice  Enable the owner to delete a vehicle. A vehicle can be deleted only if not currently in use
     * @param   id  The id of the vehicle to be deleted
     */
    function deleteVehicle(uint256 id) external onlyOwner {
        // Check that the vehicle exist
        if (!isIdInVehicleList(id)) {
            revert UnlockableTransport__VehicleNotExist();
        }
        // Check that the vehicle is not currently in use
        if (s_status[id].currentOwner != address(0)) {
            revert UnlockableTransport__cannotDeleteAVehicleCurrentlyInUse();
        }

        emit DeleteVehicleEvent(id, getVehicle(id).vehicleAddress);
        deleteVehicleList(id);
        if (isIdInAvailableList(id)) {
            deleteAvailableList(id);
        }
    }

    /*//////////////////////////////////////////////////////////////
                          Private functions
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice  Helper function to add a vehicle to vehicle list
     * @dev Use this to keep the state variables coherent 
     * @param   vehicle  The struct describing the vehicle to be added
     */
    function addVehicleList(Types.UnlockableVehicle calldata vehicle) private {
        s_vehicles.push(vehicle);
        s_vehiclesIds[vehicle.id] = s_vehicles.length;
        s_vehicleAddressToIndex[vehicle.vehicleAddress] = s_vehicles.length;
    }

    /**
     * @notice  Helper function to delete a vehicle from the vehicle list
     * @dev     Use this to keep the state variables coherent 
     * @param   id  The id of the vehicle to delete
     */
    function deleteVehicleList(uint256 id) private {
        uint256 deleteVehicleIndex = s_vehiclesIds[id];
        if (deleteVehicleIndex != s_vehicles.length) {
            s_vehiclesIds[
                s_vehicles[s_vehicles.length - 1].id
            ] = deleteVehicleIndex;

            s_vehicles[deleteVehicleIndex - 1] = s_vehicles[
                s_vehicles.length - 1
            ];
        }

        delete s_vehicleAddressToIndex[
            s_vehicles[deleteVehicleIndex - 1].vehicleAddress
        ];
        delete s_vehiclesIds[id];
        s_vehicles.pop();
    }

    /**
     * @notice  Helper function to add a vehicle to the available list
     * @dev Use this to keep the state variables coherent 
     * @param   vehicle  The struct describing the vehicle to be added
     */
    function addAvailableList(Types.UnlockableVehicle memory vehicle) private {
        s_available.push(vehicle);
        s_availableIds[vehicle.id] = s_available.length;
    }

    /**
     * @notice  Helper function to delete a vehicle from the available list
     * @dev     Use this to keep the state variables coherent 
     * @param   id  The id of the vehicle to delete
     */
    function deleteAvailableList(uint256 id) private {
        uint256 deleteVehicleAvailableIndex = s_availableIds[id];
        if (deleteVehicleAvailableIndex != s_available.length) {
            s_availableIds[
                s_available[s_available.length - 1].id
            ] = deleteVehicleAvailableIndex;

            s_available[deleteVehicleAvailableIndex - 1] = s_available[
                s_available.length - 1
            ];
        }
        delete s_availableIds[id];
        s_available.pop();
    }

    /**
     * @notice  Helper function to add an offer to the offers list
     * @dev Use this to keep the state variables coherent 
     * @param   offer  The struct describing the offer to be added
     */
    function addOfferList(Types.UnlockablesOffer calldata offer) private {
        s_availableOffers.push(offer);
        s_availableOfferIds[offer.id] = s_availableOffers.length;
    }

    /**
     * @notice  Helper function to delete an offer from the offers list
     * @dev     Use this to keep the state variables coherent 
     * @param   id  The id of the offer to delete
     */
    function deleteOfferList(uint256 id) private {
        uint256 deleteOfferIndex = s_availableOfferIds[id];
        if (deleteOfferIndex != s_availableOffers.length) {
            s_availableOfferIds[
                s_availableOffers[s_availableOffers.length - 1].id
            ] = deleteOfferIndex;

            s_availableOffers[deleteOfferIndex - 1] = s_availableOffers[
                s_availableOffers.length - 1
            ];
        }
        delete s_availableOfferIds[id];
        s_availableOffers.pop();
    }

    /*//////////////////////////////////////////////////////////////
                        View private functions
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice  Check if a vehicle exists given the id
     * @param   id  Id of the vehicle
     * @return  bool  true if exists, false otherwise
     */
    function isIdInVehicleList(uint256 id) private view returns (bool) {
        return s_vehiclesIds[id] != 0;
    }

    /**
     * @notice  Check if the offer exists
     * @param   id  Id of the offer
     * @return  bool  true if exists, false otherwise
     */
    function isIdInOffersList(uint256 id) private view returns (bool) {
        return s_availableOfferIds[id] != 0;
    }

    /*//////////////////////////////////////////////////////////////
                       View external functions
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice  Get the address of the owner of the contract
     * @dev     .
     * @return  address  Address of the owner of the contract
     */
    function getOwner() external view returns (address) {
        return i_owner;
    }

    /**
     * @notice  Get the list of all registered vehicles
     * @return  Types.UnlockableVehicle[]  List of registered vehicles
     */
    function getAllVehicles()
        external
        view
        returns (Types.UnlockableVehicle[] memory)
    {
        return s_vehicles;
    }

    /**
     * @notice  Get the list of all available vehicles
     * @return  Types.UnlockableVehicle[]  List of available vehicles
     */
    function getAvailableVehicles()
        external
        view
        returns (Types.UnlockableVehicle[] memory)
    {
        return s_available;
    }

    /**
     * @notice  get the list of all the offers
     * @return  Types.UnlockablesOffer[]  List of available offers
     */
    function getAllOffers()
        external
        view
        returns (Types.UnlockablesOffer[] memory)
    {
        return s_availableOffers;
    }

    /**
     * @notice  Get the amount that the owner can withdraw
     * @return  uint256  Contract owner balance
     */
    function getOwnerBalance() external view returns (uint256) {
        return s_ownerCredit;
    }

    /*//////////////////////////////////////////////////////////////
                        View public functions
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice  Get a vehicle given the id
     * @param   id  Id of the vehicle
     * @return  Types.UnlockableVehicle  Struct of the vehicle
     */
    function getVehicle(
        uint256 id
    ) public view returns (Types.UnlockableVehicle memory) {
        if (!isIdInVehicleList(id)) {
            revert UnlockableTransport__VehicleNotExist();
        }
        return s_vehicles[s_vehiclesIds[id] - 1];
    }

    /**
     * @notice  Get the status of a vehicle given the id
     * @param   id  Id of the vehicle
     * @return  Types.RentStatus  Status struct
     */
    function getVehicleStatus(
        uint256 id
    ) public view returns (Types.RentStatus memory) {
        if (!isIdInVehicleList(id)) {
            revert UnlockableTransport__VehicleNotExist();
        }
        return s_status[id];
    }

    /**
     * @notice  Check if a vehicle is available given the id
     * @param   id  Id of the vehicle
     * @return  bool  true if available, false otherwise
     */
    function isIdInAvailableList(uint256 id) public view returns (bool) {
        return s_availableIds[id] != 0;
    }

    /**
     * @notice  Get an offer given the id
     * @param   id  Id of the offer
     * @return  Types.UnlockablesOffer  Struct of the offer
     */
    function getOffer(
        uint256 id
    ) public view returns (Types.UnlockablesOffer memory) {
        if (!isIdInOffersList(id)) {
            revert UnlockableTransport__OfferNotExist();
        }
        return s_availableOffers[s_availableOfferIds[id] - 1];
    }
}

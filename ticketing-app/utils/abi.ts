export const registerContractAbi = `[
    {
      "inputs": [],
      "name": "MspRegister__AddressIsAlreadyRegisteredError",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MspRegister__MspNotFound",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "endpoint",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "contract UnlockableTransport",
          "name": "unlockableTransport",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "contract PrepaidTickets",
          "name": "prepaidTickets",
          "type": "address"
        }
      ],
      "name": "NewMsp",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "getAllMsp",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "endpoint",
              "type": "string"
            },
            {
              "internalType": "contract UnlockableTransport",
              "name": "unlockableContract",
              "type": "address"
            },
            {
              "internalType": "contract PrepaidTickets",
              "name": "ticketContract",
              "type": "address"
            }
          ],
          "internalType": "struct Types.Msp[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "mspAddress",
          "type": "address"
        }
      ],
      "name": "getMsp",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "endpoint",
              "type": "string"
            },
            {
              "internalType": "contract UnlockableTransport",
              "name": "unlockableContract",
              "type": "address"
            },
            {
              "internalType": "contract PrepaidTickets",
              "name": "ticketContract",
              "type": "address"
            }
          ],
          "internalType": "struct Types.Msp",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "endpoint",
          "type": "string"
        }
      ],
      "name": "register",
      "outputs": [
        {
          "internalType": "contract UnlockableTransport",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "contract PrepaidTickets",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]`;

export const unlockableTransportContractAbi = `[
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__AddressAlreadyAssociatedToOtherVehicle",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__AddressIsNotAVehicleError",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__IdCannotBeZeroError",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__KmCannotDecrease",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__NotEnoughEthForWithdraw",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__NotOwner",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__OfferIdAlreadyExists",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__OfferNotExist",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__OwnerPaymentFailed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__VehicleIdAlreadyExists",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__VehicleNotExist",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__VehicleNotRented",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__cannotBookAVehicleCurrentlyInUse",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__cannotBookDisabledVehicle",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__cannotBookDischargedVehicle",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__cannotDeleteAVehicleCurrentlyInUse",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__cannotDeleteAnOfferCurrentlyInUse",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__cannotLockVehicleAlreadyLocked",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__cannotLockVehicleNotOwned",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__cannotUseDisabledOffer",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__notEnoughEthToCoverUnlock",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnlockableTransport__refundFailed",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "enabled",
          "type": "bool"
        }
      ],
      "name": "AddOfferEvent",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "vehicleAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "enabled",
          "type": "bool"
        }
      ],
      "name": "AddVehicleEvent",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "DeleteOfferEvent",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "vehicleAddress",
          "type": "address"
        }
      ],
      "name": "DeleteVehicleEvent",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "enabled",
          "type": "bool"
        }
      ],
      "name": "ToggleEnableOfferEvent",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "vehicleAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "enabled",
          "type": "bool"
        }
      ],
      "name": "ToggleEnableVehicleEvent",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "vehicleId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint8",
          "name": "battery",
          "type": "uint8"
        }
      ],
      "name": "VehicleBatterySet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "vehicleId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "cost",
          "type": "uint256"
        }
      ],
      "name": "VehicleForceLocked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "vehicleId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "km",
          "type": "uint256"
        }
      ],
      "name": "VehicleKmSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "vehicleId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "cost",
          "type": "uint256"
        }
      ],
      "name": "VehicleLocked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "vehicleId",
          "type": "uint256"
        },
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "x",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "y",
              "type": "uint256"
            }
          ],
          "indexed": true,
          "internalType": "struct Types.Position",
          "name": "position",
          "type": "tuple"
        }
      ],
      "name": "VehiclePositionSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "vehicleId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "offerId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalKm",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "VehicleUnlocked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "newWithdraw",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "ForceLock",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "vehicleId",
          "type": "uint256"
        }
      ],
      "name": "Lock",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "vehicleId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "offerID",
          "type": "uint256"
        }
      ],
      "name": "Unlock",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "pricePerKm",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "pricePerSec",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "UnlockPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "KmAllowance",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "TimeAllowance",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "enabled",
              "type": "bool"
            }
          ],
          "internalType": "struct Types.UnlockablesOffer",
          "name": "offer",
          "type": "tuple"
        }
      ],
      "name": "addOffer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "x",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "y",
                  "type": "uint256"
                }
              ],
              "internalType": "struct Types.Position",
              "name": "position",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "totalKm",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "battery",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "vehicleAddress",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "enabled",
              "type": "bool"
            }
          ],
          "internalType": "struct Types.UnlockableVehicle",
          "name": "vehicle",
          "type": "tuple"
        }
      ],
      "name": "addVehicle",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "deleteOffer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "deleteVehicle",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllOffers",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "pricePerKm",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "pricePerSec",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "UnlockPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "KmAllowance",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "TimeAllowance",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "enabled",
              "type": "bool"
            }
          ],
          "internalType": "struct Types.UnlockablesOffer[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllVehicles",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "x",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "y",
                  "type": "uint256"
                }
              ],
              "internalType": "struct Types.Position",
              "name": "position",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "totalKm",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "battery",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "vehicleAddress",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "enabled",
              "type": "bool"
            }
          ],
          "internalType": "struct Types.UnlockableVehicle[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAvailableVehicles",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "x",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "y",
                  "type": "uint256"
                }
              ],
              "internalType": "struct Types.Position",
              "name": "position",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "totalKm",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "battery",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "vehicleAddress",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "enabled",
              "type": "bool"
            }
          ],
          "internalType": "struct Types.UnlockableVehicle[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "getOffer",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "pricePerKm",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "pricePerSec",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "UnlockPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "KmAllowance",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "TimeAllowance",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "enabled",
              "type": "bool"
            }
          ],
          "internalType": "struct Types.UnlockablesOffer",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getOwner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getOwnerBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "getVehicle",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "x",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "y",
                  "type": "uint256"
                }
              ],
              "internalType": "struct Types.Position",
              "name": "position",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "totalKm",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "battery",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "vehicleAddress",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "enabled",
              "type": "bool"
            }
          ],
          "internalType": "struct Types.UnlockableVehicle",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "getVehicleStatus",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "currentOwner",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "offerId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "startKm",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "startTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "maxToSpend",
              "type": "uint256"
            }
          ],
          "internalType": "struct Types.RentStatus",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "isIdInAvailableList",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "percentage",
          "type": "uint8"
        }
      ],
      "name": "setBattery",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "km",
          "type": "uint256"
        }
      ],
      "name": "setKm",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "x",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "y",
              "type": "uint256"
            }
          ],
          "internalType": "struct Types.Position",
          "name": "position",
          "type": "tuple"
        }
      ],
      "name": "setPosition",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "toggleOfferEnabled",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "toggleVehicleEnabled",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]`;

export const prepaidTicketsContractAbi = `[
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "PrepaidTickets__NotEnoughEthForWithdraw",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PrepaidTickets__NotOwner",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PrepaidTickets__OwnerPaymentFailed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PrepaidTickets__TicketAlreadyExist",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PrepaidTickets__TicketAlreadyUsed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PrepaidTickets__TicketConfirmationSignatureInvalid",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PrepaidTickets__TicketNotFound",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PrepaidTickets__TicketOfferExpired",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PrepaidTickets__TicketOfferNotForThisAddress",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PrepaidTickets__TicketOfferSignatureInvalid",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PrepaidTickets__TicketOfferWrongId",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PrepaidTickets__ValueDoesntMatchTicketPrice",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "validFor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "from",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "to",
          "type": "string"
        }
      ],
      "name": "newTicket",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "newWithdraw",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "validFor",
          "type": "address"
        }
      ],
      "name": "validatedTicket",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "getAvailableAddressTicketsId",
      "outputs": [
        {
          "internalType": "bytes32[]",
          "name": "",
          "type": "bytes32[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getOwner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getOwnerBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        }
      ],
      "name": "getTicket",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            },
            {
              "internalType": "bytes32",
              "name": "id",
              "type": "bytes32"
            },
            {
              "internalType": "enum Types.TypeOfTransport",
              "name": "typeOfTransport",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "x",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "y",
                  "type": "uint256"
                }
              ],
              "internalType": "struct Types.PointOfInterest",
              "name": "from",
              "type": "tuple"
            },
            {
              "components": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "x",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "y",
                  "type": "uint256"
                }
              ],
              "internalType": "struct Types.PointOfInterest",
              "name": "to",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "departureTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "eta",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "class",
              "type": "uint8"
            },
            {
              "internalType": "bytes",
              "name": "custom",
              "type": "bytes"
            },
            {
              "internalType": "uint256",
              "name": "exipiration",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "validFor",
              "type": "address"
            },
            {
              "internalType": "enum Types.TicketState",
              "name": "state",
              "type": "uint8"
            }
          ],
          "internalType": "struct Types.Ticket",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "getUsedAddressTicketsId",
      "outputs": [
        {
          "internalType": "bytes32[]",
          "name": "",
          "type": "bytes32[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            },
            {
              "internalType": "bytes32",
              "name": "id",
              "type": "bytes32"
            },
            {
              "internalType": "enum Types.TypeOfTransport",
              "name": "typeOfTransport",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "x",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "y",
                  "type": "uint256"
                }
              ],
              "internalType": "struct Types.PointOfInterest",
              "name": "from",
              "type": "tuple"
            },
            {
              "components": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "x",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "y",
                  "type": "uint256"
                }
              ],
              "internalType": "struct Types.PointOfInterest",
              "name": "to",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "departureTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "eta",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "class",
              "type": "uint8"
            },
            {
              "internalType": "bytes",
              "name": "custom",
              "type": "bytes"
            },
            {
              "internalType": "uint256",
              "name": "exipiration",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "validFor",
              "type": "address"
            },
            {
              "internalType": "enum Types.TicketState",
              "name": "state",
              "type": "uint8"
            }
          ],
          "internalType": "struct Types.Ticket",
          "name": "ticket",
          "type": "tuple"
        }
      ],
      "name": "mintTicket",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "userSignature",
          "type": "bytes"
        }
      ],
      "name": "validateTicketAndMarkAsUsed",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]`;

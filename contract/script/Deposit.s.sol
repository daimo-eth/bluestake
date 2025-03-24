// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Deposit} from "../src/Deposit.sol";

contract DepositScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // Base USDC and AAVE addresses
        address usdc = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
        address ausdc = 0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB;
        address aavePool = 0xA238Dd80C259a72e81d7e4664a9801593F98d1c5;
        
        // Deploy contract
        new Deposit{salt: 0}(usdc, ausdc, aavePool);

        vm.stopBroadcast();
    }
} 

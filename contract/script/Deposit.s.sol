// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Deposit} from "../src/Deposit.sol";

contract DepositScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // Base USDC and mUSDC addresses
        address usdc = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
        address musdc = 0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22;
        
        // Deploy contract
        new Deposit{salt: 0}(usdc, musdc);

        vm.stopBroadcast();
    }
} 

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

interface IERC20 {
    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

/** AAVE Pool interface */
interface IPool {
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;
}

/** Direct deposits to quality stablecoin yield, eg AAVE aUSDC */
contract Deposit {
    address public immutable USDC;
    address public immutable AUSDC;
    address public immutable AAVE_POOL;

    event Deposited(address indexed recipientAddr, uint256 amount);

    constructor(
        address usdc,
        address ausdc,
        address aavePool
    ) {
        USDC = usdc;
        AUSDC = ausdc;
        AAVE_POOL = aavePool;
    }

    function deposit(address recipientAddr) external {
        uint256 amount = IERC20(USDC).allowance(msg.sender, address(this));
        require(amount > 0, "no allowance");

        // Transfer USDC from user
        bool success = IERC20(USDC).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        require(success, "transfer failed");

        // Deposit USDC to AAVE and receive aUSDC
        success = IERC20(USDC).approve(AAVE_POOL, amount);
        require(success, "AAVE approve failed");
        
        // Supply to AAVE pool
        IPool(AAVE_POOL).supply(
            USDC,
            amount,
            recipientAddr,
            0 // referral code
        );

        emit Deposited(recipientAddr, amount);
    }
}
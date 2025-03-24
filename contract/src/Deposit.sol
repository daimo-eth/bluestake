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

/** Direct deposits to quaality stablecoin yield, eg Moonwell mUSDC */
contract Deposit {
    address public immutable USDC;
    address public immutable MUSDC;

    event Deposited(address indexed recipientAddr, uint256 amount);

    constructor(
        address usdc,
        address musdc
    ) {
        USDC = usdc;
        MUSDC = musdc;
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

        // Mint mUSDC
        success = IERC20(USDC).approve(MUSDC, amount);
        require(success, "mUSDC approve failed");
        (success, ) = MUSDC.call(
            abi.encodeWithSignature("mint(uint256)", amount)
        );
        require(success, "mUSDC mint failed");

        // Transfer mUSDC to recipient
        success = IERC20(MUSDC).transfer(recipientAddr, amount);
        require(success, "mUSDC transfer failed");

        emit Deposited(recipientAddr, amount);
    }
}
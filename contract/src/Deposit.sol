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

contract Deposit {
    address public immutable USDC;
    address public immutable PENDLE_ROUTER;
    address public immutable PENDLE_MARKET;

    event Deposited(address indexed recipientAddr, uint256 amount);

    constructor(
        address usdc,
        address pendleRouter,
        address pendleMarket
    ) {
        USDC = usdc;
        PENDLE_ROUTER = pendleRouter;
        PENDLE_MARKET = pendleMarket;
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

        // Approve Pendle router
        success = IERC20(USDC).approve(PENDLE_ROUTER, amount);
        require(success, "pendle approve failed");

        // Calculate guess values
        uint256 guessMin = amount / 2;
        uint256 guessMax = (amount * 110) / 100; // 110%
        uint256 guessOptimal = (amount * 101) / 100; // 101%

        // Call swapExactTokenForPt
        (success, ) = PENDLE_ROUTER.call(
            abi.encodeWithSelector(
                0xc81f847a,
                recipientAddr,
                PENDLE_MARKET,
                amount,
                [guessMin, guessMax, guessOptimal, 30, 10000000000000],
                TokenInput(USDC, amount, USDC, address(0), SwapData(0, address(0), "0x", false)),
                TokenOutput(address(0), 0, address(0), address(0), SwapData(0, address(0), "0x", false)),
                LimitOrderData(address(0), 0, new FillOrderParams[](0), new FillOrderParams[](0), "0x")
            )
        );
        require(success, "pendle swap failed");

        emit Deposited(recipientAddr, amount);
    }
}

struct SwapData {
    uint256 amount;
    address token;
    bytes extraData;
    bool isNative;
}

struct TokenInput {
    address tokenIn;
    uint256 netTokenIn;
    address tokenMintSy;
    address pendleSwap;
    SwapData swapData;
}

struct TokenOutput {
    address tokenOut;
    uint256 minTokenOut;
    address tokenRedeemSy;
    address pendleSwap;
    SwapData swapData;
}

struct FillOrderParams {
    uint256 amount;
    address token;
    bytes extraData;
    bool isNative;
}

struct LimitOrderData {
    address limitRouter;
    uint256 epsSkipMarket;
    FillOrderParams[] normalFills;
    FillOrderParams[] flashFills;
    bytes optData;
}

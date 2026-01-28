#![no_std]

klever_sc_wasm_adapter::allocator!();
klever_sc_wasm_adapter::panic_handler!();

klever_sc_wasm_adapter::endpoints! {
    kpepe_jackpot
    (
        init => init
        initializeWallets => initialize_wallets
        toggleRound => toggle_round
        startDraw => start_draw
        completeDraw => complete_draw
        withdraw => withdraw
        buyTicket => buy_ticket
        claimPrize => claim_prize
        autoDistributePrizes => auto_distribute_prizes
        getPool => get_pool
        getNextDraw => get_next_draw
        getWinning => get_winning
        getWinningEb => get_winning_eb
        getTotal => get_total
        isActive => is_active
        isDrawing => is_drawing
    )
}

#!/bin/bash
cd rust-contract
cargo build --target wasm32-unknown-unknown --release
cd ..
echo "✅ Build complete"

#!/usr/bin/env python3
"""
Alternative deployment using Python and requests with DNS override
"""
import json
import subprocess
import os

# Load env
with open('.env', 'r') as f:
    env = dict(line.strip().split('=', 1) for line in f if '=' in line and not line.startswith('#'))

MNEMONIC = env.get('MAINNET_MNEMONIC', '')
KPEPE_TOKEN = env.get('KPEPE_TOKEN_ADDRESS', '')
PROJECT_WALLET = env.get('PROJECT_WALLET_HEX', '')
PRIZE_POOL = env.get('PRIZE_POOL_WALLET_HEX', '')

print("=== KPEPE Jackpot Mainnet Deployment ===")
print(f"Deployer: {PROJECT_WALLET[:10]}...")
print(f"KPEPE Token: {KPEPE_TOKEN[:10]}...")
print()

# Try different RPC endpoints
rpc_endpoints = [
    "https://mainnet-gateway.klever.finance",
    "https://klever.api.enddev.xyz",
]

for rpc in rpc_endpoints:
    print(f"Trying RPC: {rpc}")
    result = subprocess.run(
        ['curl', '-s', '-X', 'POST', rpc, 
         '-H', 'Content-Type: application/json',
         '-d', json.dumps({"jsonrpc": "2.0", "method": "eth_blockNumber", "params": [], "id": 1})],
        capture_output=True, text=True, timeout=10
    )
    if result.returncode == 0 and 'result' in result.stdout:
        print(f"✅ RPC works: {rpc}")
        break
    else:
        print(f"❌ RPC failed: {result.stdout[:100]}")

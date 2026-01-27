require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    kleverTestnet: {
      url: "https://testnet-gateway.klever.finance",
      chainId: 222,
      gasPrice: 1000000000, // 1 Gwei
      accounts: {
        mnemonic: process.env.TESTNET_MNEMONIC || "your testnet wallet mnemonic here",
        path: "m/44'/7278'/0'/0",
        initialIndex: 0,
        count: 10
      }
    },
    kleverMainnet: {
      url: "https://mainnet-gateway.klever.finance",
      chainId: 221,
      gasPrice: 1000000000, // 1 Gwei
      accounts: {
        mnemonic: process.env.MAINNET_MNEMONIC || "your mainnet wallet mnemonic here",
        path: "m/44'/7278'/0'/0",
        initialIndex: 0,
        count: 10
      }
    }
  },
  etherscan: {
    apiKey: {
      kleverTestnet: "verify-key",
      kleverMainnet: "verify-key"
    },
    customChains: [
      {
        network: "kleverTestnet",
        chainId: 222,
        urls: {
          apiURL: "https://testnet.kleverscan.org/api",
          browserURL: "https://testnet.kleverscan.org"
        }
      },
      {
        network: "kleverMainnet",
        chainId: 221,
        urls: {
          apiURL: "https://kleverscan.org/api",
          browserURL: "https://kleverscan.org"
        }
      }
    ]
  },
  sourcify: {
    enabled: false
  }
};

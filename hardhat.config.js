require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    kleverMainnet: {
      url: "https://node.mainnet.klever.org",
      chainId: 100,
      gasPrice: 1000000,  // 0.001 Gwei (1 million wei)
      gas: 3000000,        // 3 million gas limit
      accounts: {
        mnemonic: process.env.MAINNET_MNEMONIC || "",
        path: "m/44'/7278'/0'/0",
        initialIndex: 0,
        count: 1
      }
    }
  },
  etherscan: {
    apiKey: {
      kleverMainnet: "verify"
    },
    customChains: [
      {
        network: "kleverMainnet",
        chainId: 221,
        urls: {
          apiURL: "https://kleverscan.org/api",
          browserURL: "https://kleverscan.org"
        }
      }
    ]
  }
};

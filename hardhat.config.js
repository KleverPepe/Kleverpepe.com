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
      url: "https://mainnet-gateway.klever.finance",
      chainId: 221,
      gasPrice: 1000000000,
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

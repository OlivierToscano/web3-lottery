import Web3 from "web3";

let provider;

if (typeof window !== "undefined"
    && typeof window.ethereum !== "undefined") {
  // We are in the browser and metamask is running.
  window.ethereum.request({ method: "eth_requestAccounts" });
  provider = window.ethereum;
} else {
  // We are on the server *OR* the user is not running metamask
  
  switch (process.env.PROVIDER) {
    case 'goerli':
      provider = new Web3.providers.HttpProvider(`https://goerli.infura.io/v3/${process.env.PROJECT_ID}`);
      break;

    case 'bsc':
    case 'bsc-testnet':
      provider = new Web3.providers.HttpProvider(`https://data-seed-prebsc-1-s1.binance.org:8545`);
      break;

    case 'matic-mumbai':
      provider = new Web3.providers.HttpProvider(`https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
      break;

    case 'ganache':
    default:
      provider = new Web3.providers.HttpProvider(`http://127.0.0.1:${process.env.GANACHE_PORT}`);
      break;
  }
}

export default new Web3(provider);
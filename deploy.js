const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { abi, evm } = require('./compile');
require('dotenv').config();

let provider;
switch (process.env.NETWORK) {
  case 'goerli':
    provider = new HDWalletProvider(
      process.env.MNEMONIC,
      `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    );
    break;

  case 'ganache':
  default:
    provider = new HDWalletProvider(
      process.env.GANACHE_MNEMONIC,
      `http://127.0.0.1:${process.env.GANACHE_PORT}`
    );
    break;
}

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ gas: '1000000', from: accounts[0] });

  console.log('Contract deployed to', result.options.address);
  provider.engine.stop();
};
deploy();
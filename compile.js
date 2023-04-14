const path = require('path');
const fs = require('fs');
const solc = require('solc');

const lotteryPath = path.resolve(__dirname, 'contracts', 'Lottery.sol');
const source = fs.readFileSync(lotteryPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'Lottery.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};

// compile
const output = JSON.parse(solc.compile(JSON.stringify(input)));

// write contract into client contracts folder
for (var contractName in output.contracts['Lottery.sol']) {
  fs.writeFileSync(
    `./client/ethereum/contracts/${contractName}.json`,
    JSON.stringify(output.contracts['Lottery.sol'][contractName])
    );
}

// export
module.exports = output.contracts['Lottery.sol'].LotteryFactory;
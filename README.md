# Web3 Lottery

Web3 lottery smart contract.

Simple smart contract where people can enter to participate to a lottery with a minimum amount.
Once the contract has one or more participants, the contract owner / manager can pick a winner and all the bet would be transfered to the winner address.

## Requierements

Node, Npm, Ganache
Node v16 and above (client requiert node v18 or above)

### NVM (Node version manager)

If you switch between different project, NVM can help you to switch on different node version: [install nvm](https://github.com/nvm-sh/nvm#install--update-script)

## Give a try

1. Start Ganache

    Launch Ganache for a test environment

2. Copy env files and install dependencies

    ```shell
    cp .env.sample .env
    npm install
    ```

    ```shell
    cp client/.env.sample client/.env
    cd client && npm install
    ```

3. Copy your ganache mnemonic into a `.env` file then compile and deploy

    ```shell
    vi .env
    node deploy.js
    ```

4. Copy/paste the contract address into the client env file `/client/.env`

    ```shell
    cd client
    vi .env
    ```

5. Enjoy

    > npm run dev

    visit: http:localhost:3000

## Test with mocha

> npm run test
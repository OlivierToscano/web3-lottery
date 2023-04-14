import web3 from "./utils/web3";
import Factory from "./contracts/LotteryFactory.json";

const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const instance = new web3.eth.Contract(Factory.abi, address);

export default instance;
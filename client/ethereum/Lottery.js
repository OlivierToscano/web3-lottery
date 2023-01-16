import web3 from "./utils/web3";
import Lottery from "./contracts/Lottery.json";

const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const instance = new web3.eth.Contract(Lottery.abi, address);

export default instance;
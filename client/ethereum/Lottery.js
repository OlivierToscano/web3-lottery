import web3 from "./utils/web3";
import Lottery from "./contracts/Lottery.json";

const instance = (address) => {
    return new web3.eth.Contract(Lottery.abi, address);
}

export default instance;
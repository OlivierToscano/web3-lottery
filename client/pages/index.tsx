import { useState } from "react";
import factory from "../ethereum/Factory";
import web3 from "../ethereum/utils/web3";
import styles from "@/styles/Factory.module.css";
import Link from "next/link";

const Factory = (props: { lotteries: Array<string> }) => {
    // message
    const [message, setMessage] = useState({ message: "", status: "error" });
    const [bet, setBet] = useState("0.1");

    // lotteries list
    const [lotteries, setLotteries] = useState(props.lotteries);

    // listen WinnerHasBeenPicked event
    factory.events.LotteryHasBeenCreated().on("data", async (event: any) => {
        const data = event.returnValues;
        console.log("data", data);
    });

    // update lotteries list
    const updateLotteries = async () => {
        const deployedLotteries = await factory.methods.getDeployedLotteries().call();
        setLotteries(deployedLotteries);
    };

    const createLottery = async (event: any) => {
        event.preventDefault();

        console.log("create a new lottery");

        try {
            const accounts = await web3.eth.getAccounts();
            await factory.methods.createLottery(web3.utils.toWei(bet, "ether")).send({
                from: accounts[0],
            });

            console.log("creation success");

            updateLotteries();
        } catch (err: any) {
            setMessage({
                message: err.message,
                status: "error",
            });

            console.log("err", err);
        }
    };

    return (
        <div>
            <h1>Lottery factory</h1>

            <div className={styles.newLotteryForm}>
                <p>Amount to participate (in ETH)</p>
                <input className={styles.input} type="number" value={bet} onChange={(e) => setBet(e.target.value)} />
                <button className={styles.button} onClick={(e) => createLottery(e)}>
                    Add a new lottery
                </button>
            </div>

            <div className={styles.lotteries}>
                {lotteries &&
                    lotteries.map((address, k) => (
                        <p key={k}>
                            <Link href={`/lotteries/${address}`}>View lottery - {address}</Link>
                        </p>
                    ))}
            </div>
        </div>
    );
};

export async function getStaticProps() {
    const lotteries = await factory.methods.getDeployedLotteries().call();
    return { props: { lotteries } };
}

export default Factory;

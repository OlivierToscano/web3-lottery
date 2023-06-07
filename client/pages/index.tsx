import { useState } from "react";
import factory from "../ethereum/Factory";
import web3 from "../ethereum/utils/web3";
import styles from "@/styles/Factory.module.css";
import Link from "next/link";

const Factory = (props: { lotteries: Array<string> }) => {
    // message
    const [message, setMessage] = useState({ message: "", status: "error" });
    const [bet, setBet] = useState("0.1");
    const [maxPlayers, setMaxPlayers] = useState("0");

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

        try {
            const accounts = await web3.eth.getAccounts();
            await factory.methods.createLottery(web3.utils.toWei(bet, "ether"), maxPlayers).send({
                from: accounts[0],
            });

            updateLotteries();
        } catch (err: any) {
            setMessage({
                message: err.message,
                status: "error",
            });
        }
    };

    return (
        <div>
            <h1>Lottery factory</h1>

            <div className={styles.newLotteryForm}>
                <p>
                    <label>Amount to participate (in ETH)</label>
                    <input
                        className={styles.input}
                        type="number"
                        value={bet}
                        onChange={(e) => setBet(e.target.value)}
                    />
                </p>
                <p>
                    <label>Mximum players (0 = unlimited)</label>
                    <input
                        className={styles.input}
                        type="number"
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(e.target.value)}
                    />
                </p>
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

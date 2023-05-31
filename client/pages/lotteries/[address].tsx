import { useRouter } from "next/router";
import Head from "next/head";
import { Inter } from "@next/font/google";
import styles from "@/styles/Factory.module.css";
import { useEffect, useState } from "react";
import Lottery from "../../ethereum/Lottery";
import web3 from "../../ethereum/utils/web3";

const inter = Inter({ subsets: ["latin"] });

const LotteryIndex = (props: {
    contract: string;
    manager: string;
    bet: string;
    players: Array<string>;
    complete: boolean;
    winnerAddress: string;
    winnerAmount: string;
}) => {
    // get manager and players from contract
    const { contract, manager, bet, winnerAddress, winnerAmount } = props;
    const router = useRouter();

    if (contract === undefined) {
        router.push("/");
    }

    // init lottery
    const lottery = Lottery(contract);

    const [players, setPlayers] = useState(props.players);
    const [complete, setComplete] = useState(props.complete);

    // Lottery balance in Wei
    const [balance, setBalance] = useState("");

    // participation amount
    const [participationAmount, setParticipationAmount] = useState(web3.utils.fromWei(bet, "ether"));

    // message
    const [message, setMessage] = useState({ message: "", status: "error" });

    // connected user
    const [accountConnected, setAccountConnected] = useState("");

    // minimum players to pick a winner
    const [minimumPlayersToPickAWinner, setMinimumPlayersToPickAWinner] = useState(0);

    // winner
    const [winner, setWinner] = useState({ address: winnerAddress, amount: winnerAmount });

    // etherscan
    const etherscanLink = `https://goerli.etherscan.io/address/${process.env.CONTRACT_ADDRESS}`;

    // get contract balance
    const getContractBalance = async () => {
        try {
            const contractBalance = await web3.eth.getBalance(contract);
            setBalance(contractBalance);
        } catch (error: any) {
            setMessage({ message: error.message, status: "error" });
        }
    };

    // reset message function
    const resetMessage = () => {
        setMessage({
            message: "",
            status: "message",
        });
    };

    // update connected address on change account on metamask
    useEffect(() => {
        resetMessage();

        const events = ["chainChanged", "accountsChanged"];
        const handleChange = async () => {
            // get current account address
            const accounts = await web3.eth.getAccounts();
            setAccountConnected(accounts[0]);
        };

        // get contract balance
        const getContractBalance = async () => {
            try {
                const contractBalance = await web3.eth.getBalance(contract);
                setBalance(contractBalance);
            } catch (error: any) {
                setMessage({ message: error.message, status: "error" });
            }
        };

        getContractBalance();

        events.forEach((e) => window.ethereum.on(e, handleChange));
        return () => {
            events.forEach((e) => window.ethereum.removeListener(e, handleChange));
        };
    }, [accountConnected, balance, contract]);

    // set initial connected address
    useEffect(() => {
        async function fetchAccount() {
            resetMessage();

            // get current account
            const accounts = await web3.eth.getAccounts();
            setAccountConnected(accounts[0]);
        }

        // get contract balance
        const getContractBalance = async () => {
            try {
                const contractBalance = await web3.eth.getBalance(contract);
                setBalance(contractBalance);
            } catch (error: any) {
                setMessage({ message: error.message, status: "error" });
            }
        };

        getContractBalance();
        fetchAccount();
    }, [accountConnected, balance, contract]);

    // listen WinnerHasBeenPicked event
    lottery.events.WinnerHasBeenPicked({ to: accountConnected }).on("data", async (event: any) => {
        const winnerPicked = event.returnValues;
        setWinner({ address: winnerPicked.winner, amount: winnerPicked.amount });

        const amountInEth = web3.utils.fromWei(winnerPicked.amount, "ether");

        setMessage({
            message: `A winner has been picked!, congrats to ${winnerPicked.winner} who won ${amountInEth} ETH`,
            status: "success",
        });
    });

    // update players list
    const updatePlayers = async () => {
        const playersContract = await lottery.methods.getPlayers().call();
        setPlayers(playersContract);
    };

    // participate to the lottery
    const handleParticipateForm = async (event: { preventDefault: () => void }) => {
        event.preventDefault();

        const accounts = await web3.eth.getAccounts();
        setMessage({ message: "Waiting on transaction success...", status: "info" });

        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: bet, // in wei
            });
            setMessage({ message: "You have been entered!", status: "success" });
        } catch (err: any) {
            console.log(err);
            setMessage({ message: err.message, status: "error" });
        }

        // update players
        updatePlayers();

        // update balance
        getContractBalance();
    };

    // pick a winner
    const handlePickAWinner = async () => {
        const accounts = await web3.eth.getAccounts();
        setMessage({ message: "Waiting on transaction success...", status: "info" });

        await lottery.methods.pickWinner().send({
            from: accountConnected,
        });

        // update players
        updatePlayers();

        // update balance
        getContractBalance();

        setComplete(true);
    };

    return (
        <>
            <Head>
                <title>Web3 Lottery App</title>
                <meta name="description" content="Web3 Lottery App" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                {/* <h1>Web3 Lottery App</h1> */}

                <div className={styles.description}>
                    <h2>Copntract</h2>
                    <p>{contract}</p>
                </div>

                {!complete && (
                    <div className={styles.description}>
                        <h2>Info</h2>
                        <p>
                            There are currently <strong>{players.length} people</strong> enter competition to win{" "}
                            <strong>{web3.utils.fromWei(balance, "ether")} ether!</strong>
                        </p>
                    </div>
                )}

                <div className={styles.description}>
                    <h2>Addresses</h2>
                    <p className={styles.textRight}>
                        This contract is managed by: {manager}
                        <br />
                        You are connected with: {accountConnected}
                    </p>
                </div>

                {process.env.NETWORK === "goerli" && (
                    <div className={styles.description}>
                        <p>
                            <a href={etherscanLink} target="_blank" rel="noreferrer">
                                Contract on etherscan
                            </a>
                        </p>
                    </div>
                )}

                {!complete && (
                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <h2>Want to try your luck?</h2>
                            <div>
                                <p>
                                    Amount: <b>{web3.utils.fromWei(bet, "ether")} Eth</b>
                                </p>
                                <button className={styles.button} onClick={handleParticipateForm}>
                                    Enter
                                </button>
                            </div>
                        </div>

                        {accountConnected === manager && players.length > minimumPlayersToPickAWinner && (
                            <div className={styles.card}>
                                <h2>Ready to pick a winner</h2>
                                <p>It&apos;s time to pick a winner !</p>
                                <button className={styles.button} onClick={handlePickAWinner}>
                                    Pick a winner!
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <p className={message.status}>{message.message}</p>

                {players.length > 0 && (
                    <div className={styles.players}>
                        <h2>players</h2>
                        {players.map((player, i) => (
                            <p key={i}>{player}</p>
                        ))}
                    </div>
                )}

                {winner.address !== "0x0000000000000000000000000000000000000000" && (
                    <div>
                        <h3>Winner</h3>
                        <p>
                            Winner: {winner.address} - amount: {web3.utils.fromWei(winner.amount, "ether")} ETH
                        </p>
                    </div>
                )}
            </main>
        </>
    );
};

export async function getStaticProps(props: any) {
    const { address } = props.params;
    const lottery = Lottery(address);

    const manager = await lottery.methods.manager().call();
    const bet = await lottery.methods.bet().call(); // in wei
    const players = await lottery.methods.getPlayers().call();
    const complete = await lottery.methods.complete().call();
    const winnerAddress = await lottery.methods.winnerAddress().call();
    const winnerAmount = await lottery.methods.winnerAmount().call();

    return {
        props: {
            contract: address,
            manager,
            bet,
            players,
            complete,
            winnerAddress,
            winnerAmount,
        },
    };
}

// pages/blog/[address].js
export async function getStaticPaths() {
    return {
        paths: [{ params: { address: "notdefined" } }],
        fallback: "blocking",
    };
}

export default LotteryIndex;

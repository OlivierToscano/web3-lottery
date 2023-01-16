import Head from 'next/head'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import { useEffect, useState } from 'react'
import lottery from "../ethereum/Lottery";
import web3 from "../ethereum/utils/web3";

const inter = Inter({ subsets: ['latin'] })

const Home = (props: { manager: string; players: Array<string> }) => {
  // get manager and players from contract
  const {manager} = props;

  const [players, setPlayers] = useState(props.players);

  // Lottery balance in Wei
  const [balance, setBalance] = useState('');

  // participation amount
  const [participationAmount, setParticipationAmount] = useState('');

  // message
  const [message, setMessage] = useState({message: '', status: 'error'});

  // connected user
  const [accountConnected, setAccountConnected] = useState('');

  // etherscan
  const etherscanLink = `https://goerli.etherscan.io/address/${process.env.CONTRACT_ADDRESS}`;

  // get contract balance
  const getContractBalance = async () => {
    try {
      const contractBalance = await web3.eth.getBalance(lottery.options.address);
      setBalance(contractBalance);
    } catch (error:any) {
      setMessage({message: error.message, status: 'error'});
    }
  }

  // get contract balance
  // useEffect(() => {
  //   const init = async () => {
  //     try {
  //       const contractBalance = await web3.eth.getBalance(lottery.options.address);
  //       setBalance(contractBalance);
  //     } catch (error:any) {
  //       console.error(error);
  //       setMessage({message: error.message, status: 'error'});
  //     }
  //   }

  //   init();
  // });

  // reset message function
  const resetMessage = () => {
    setMessage({
      message: '',
      status: 'message'
    });
  }

  // update connected address on change account on metamask
  useEffect(() => {
    resetMessage();

    const events = ["chainChanged", "accountsChanged"];
    const handleChange = async () => {
      // get current account address
      const accounts = await web3.eth.getAccounts();
      setAccountConnected(accounts[0]);
    };

    getContractBalance();

    events.forEach(e => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
    };
  }, [accountConnected]);

  // set initial connected address
  useEffect( () => {
    async  function fetchAccount() {
      resetMessage();

      // get current account
      const accounts = await web3.eth.getAccounts();
      setAccountConnected(accounts[0]);
    }

    getContractBalance();
    fetchAccount();
  }, [accountConnected]);


  // update players list
  const updatePlayers = async () => {
    const playersContract = await lottery.methods.getPlayers().call();
    setPlayers(playersContract);
  }

  // participate to the lottery
  const handleParticipageForm = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    
    const accounts = await web3.eth.getAccounts();
    setMessage({message: 'Waiting on transaction success...', status: 'info'});

    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(participationAmount, 'ether')
    });
    setMessage({message: 'You have been entered!', status: 'success'});
    
    // update players
    updatePlayers();
    
    // update balance
    getContractBalance();

    // reset participation value
    setParticipationAmount('');
  }

  // pick a winner
  const handlePickAWinner = async () => {
    const accounts = await web3.eth.getAccounts();
    setMessage({message: 'Waiting on transaction success...', status: 'info'});

    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    // update players
    updatePlayers();
    
    // update balance
    getContractBalance();

    setMessage({message: 'A winner has been picked!', status: 'success'});
  }

  return (
    <>
      <Head>
        <title>Web3 Lottery App</title>
        <meta name="description" content="Web3 Lottery App" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1>Web3 Lottery App</h1>

        <div className={styles.description}>
          <h2>Contract</h2>
          <p>{process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}</p>
        </div>
        
        <div className={styles.description}>
          <h2>Info</h2>
          <p>
            There are currently <strong>{players.length} people</strong> enter
            competition to win <strong>{web3.utils.fromWei(balance, 'ether')} ether!</strong>
          </p>
        </div>

        <div className={styles.description}>
          <h2>Addresses</h2>
          <p className={styles.textRight}>
            This contract is managed by: {manager}<br/>
            You are connected with: {accountConnected}</p>
        </div>

        {process.env.NETWORK === 'goerli' &&
          <div className={styles.description}>
            <p><a
              href={etherscanLink}
              target="_blank"
              rel="noreferrer"
              >Contract on etherscan</a></p>
            </div>
          }

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Want to try your luck?</h2>
            <form onSubmit={handleParticipageForm}>
              <p>Amount of Ether to enter</p>
              <input
                name="participationAmount"
                value={participationAmount}
                onChange={e => setParticipationAmount(e.target.value)}
                className={styles.input}
              />
              <button className={styles.button}>Enter</button>
            </form>
          </div>

          {accountConnected === manager &&
            <div className={styles.card}>
              <h2>Ready to pick a winner</h2>
              <p>It&apos;s time to pick a winner !</p>
              <button className={styles.button} onClick={handlePickAWinner}>Pick a winner!</button>
            </div>
          }
        </div>

        <p className={message.status}>{message.message}</p>

        {players.length > 0 && 
          <div className={styles.players}>
            <h2>players</h2>
            {players.map((player, i) => <p key={i}>{player}</p>)}
          </div>
        }
      </main>
    </>
  )
}

export async function getStaticProps() {
  const manager = await lottery.methods.manager().call();
  const players = await lottery.methods.getPlayers().call();

  return {
    props: {
      manager,
      players
    }
  }
}

export default Home;
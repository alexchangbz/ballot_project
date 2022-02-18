import React, { useState, useEffect } from 'react';
import { contractBallotFactoryAbi, contractAddress } from '../utils/constant';
import { ethers } from 'ethers';

import Ballot from './Ballot';

const { ethereum } = window;

const getBallotFactoryContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const transactionContract = new ethers.Contract(contractAddress, contractBallotFactoryAbi, signer)

    return transactionContract
}

const Home = () => {

    const [currentAccount, setCurrentAccount] = useState("")
    const [ballotAddress, setBallotAddress] = useState([])
    const [inputName, setInputName] = useState("")
    const [chainId, setChainId] = useState('')

    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) return alert("Please install metamask")
            const accounts = await ethereum.request({ method: "eth_accounts" })

            if (accounts.length) {
                setCurrentAccount(accounts[0])

                // getAllTransactions

            } else {
                console.log("No account found")
            }
        } catch (err) {
            console.log(err)

            throw new Error("No ethereum object")
        }
    }

    const connectWallet = async () => {
        try {
            if (!ethereum) return alert("Please install metamask");

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

            setCurrentAccount(accounts[0]);


        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.")
        }
    }

    const getAddress = async () => {
        const BallotFactory = getBallotFactoryContract()
        setBallotAddress(await BallotFactory.getVotings())
    }

    const onSubmit = async (e) => {
        e.preventDefault()

        const nameArray = inputName.split(",")

        // Get a Contract Instant
        const BallotFactory = getBallotFactoryContract()
        const deployNewBallot = await BallotFactory.createVote(nameArray)
        await deployNewBallot.wait()
        setBallotAddress(await BallotFactory.getVotings())

    }

    const getChainId = async () => {
        ethereum.request({ method: 'eth_chainId' })
            .then((value) => {
                const chainId = parseInt(value)
                switch (chainId) {
                    // case 1:
                    //     setChainId('Ethereum')
                    //     break
                    case 3:
                        setChainId('Ropsten')
                        break
                    // case 4:
                    //     setChainId('Rinkeby')
                    //     break
                    // case 5:
                    //     setChainId('Goerli')
                    //     break
                    // case 42:
                    //     setChainId('Kovan')
                    //     break
                    default:
                        setChainId('')
                }
            })
    }

    useEffect(() => {
        checkIfWalletIsConnected()
        getAddress()
        getChainId()
        if (ethereum) {
            ethereum.on('chainChanged', () => {
                window.location.reload();
            })
            ethereum.on('accountsChanged', () => {
                window.location.reload();
            })
        }
    }, [ballotAddress]);


    return <div>
        <div className="introduction">
            <h1>Decentralized Voting System Applications</h1>

            {
                currentAccount ?
                    (<h3>Wallet Address {currentAccount} is currently logged in.</h3>)
                    : (<div><button onClick={connectWallet}>Connect Metamask</button></div>)
            }

            <input type="text" onChange={(e) => setInputName(e.target.value)} placeholder="input candidate's name" />
            <button onClick={onSubmit}>Submit Proposal Names</button>
        </div>

        <hr />
        {chainId === "Ropsten" ?
            (<div className="ballots">
                {ballotAddress.map((address, index) => (
                    <div key={index} className="ballot-info">
                        <h1>Voting Session {index + 1}</h1>
                        <p>Contract Address: {address}</p>
                        <div className="ballots-description">
                            <Ballot address={address} />
                        </div>
                    </div>
                ))}
            </div>) :
            (<div className="network_error"><p>Please connect your metamask wallet to Ropsten Network</p></div>)

        }

    </div>;
};

export default Home;

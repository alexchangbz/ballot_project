import React, { useEffect, useState } from 'react'
import './component.css'
import { contractBallotAbi } from '../utils/constant'
import { ethers } from 'ethers'

const { ethereum } = window

const getBallotContract = (_address) => {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const ballotContract = new ethers.Contract(_address, contractBallotAbi, signer)

    return ballotContract
}



const Ballot = (props) => {

    const [proposalsData, setProposalsData] = useState([])
    const [chairperson, setChairperson] = useState("")
    const [ballotStatus, setBallotStatus] = useState(false)
    const [giveAddress, setGiveAddress] = useState("")
    const [radio, setRadio] = useState("")
    const [winnerName, setWinnerName] = useState("")


    const callBallot = async () => {
        const myContract = getBallotContract(props.address)

        setProposalsData(await myContract.getProposals())
        setChairperson(await myContract.chairperson())
        setBallotStatus(await myContract.endVote())
        setWinnerName(await myContract.winner())
    }

    const allowVote = async () => {
        const BallotContract = getBallotContract(props.address)
        await BallotContract.giveRightToVote(giveAddress)
    }

    const castVote = async (e) => {
        e.preventDefault()

        const BallotContract = getBallotContract(props.address)
        await BallotContract.vote(radio)
    }

    const pickWinner = async (e) => {
        e.preventDefault()

        const BallotContract = getBallotContract(props.address)
        await BallotContract.winnerName()
        setWinnerName(await BallotContract.winner())
    }

    useEffect(() => {
        callBallot()
    })



    return <div className="ballot">

        <div className="vote-details">

            <div className="vote-distribution">
                <h1>Administrative Section</h1>
                <div className="input-section">
                    <p>Provide Voting Right to Voters: </p>
                    <input type="text" onChange={(e) => setGiveAddress(e.target.value)} placeholder="input voter's address" />
                    <button className="admin-button" onClick={allowVote}>Give Right to Vote</button>
                </div>

                <h3>Chairperson's address: <span>{chairperson}</span></h3>
                <p>Note: Only the chairperson is allowed can issue voting right</p>
            </div>

            <div className='proposal-info'>
                <h1>Competing Representative</h1>

                <div className="candidate-info">
                    <div className="row">
                        <p>Select</p>
                        <p>Candidate Name</p>
                        <p>Current Vote Counts</p>
                    </div>
                    {proposalsData.map((proposal, index) => (
                        <div key={index} className="row">
                            <p><input type="radio" name="candidate" id={index} value={index} onChange={(e) => { setRadio(e.target.value) }} /></p>
                            <p><label htmlFor={index}>{proposal.name}</label></p>
                            <p>{proposal.voteCount.toNumber()}</p>
                        </div>
                    ))}
                    {!ballotStatus && (<button onClick={castVote}>Cast Vote</button>)}
                </div>


                <div className="pick-winner">
                    <h1>Voting Results</h1>
                    {!ballotStatus ? (<button className="admin-button" onClick={pickWinner}>Pick Winner</button>) : (<p className="vote-status">The winner of this voting session is <span>{winnerName}</span> </p>)}
                </div>
            </div>

        </div>

    </div>;
};

export default Ballot;

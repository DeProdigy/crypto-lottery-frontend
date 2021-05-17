import './App.css';
import React, { useState, useEffect } from 'react';
import lottery from './lottery';
import web3 from './web3';

const App = () => {
  const REQUIRED_ETH = '0.01';
  const [manager, setManager] = useState('');
  const [players, setPlayers] = useState([]);
  const [contractBalance, setContractBalance] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    const fetchManager = async () => {
      const manager = await lottery.methods.manager().call();
      setManager(manager);
    };

    fetchManager();
  }, []);

  useEffect(() => {
    const fetchAccounts = async () => {
      const accounts = await web3.eth.getAccounts();
      accounts[0] === manager && setIsManager(true) ;
    };

    fetchAccounts();
  }, [manager]);

  useEffect(() => {
    const fetchPlayers = async () => {
      const players = await lottery.methods.getPlayers().call();
      setPlayers(players);
    };

    fetchPlayers();
  }, [isProcessing]);

  useEffect(() => {
    const fetchPlayers = async () => {
      const balance = await web3.eth.getBalance(lottery.options.address);
      setContractBalance(balance);
    };

    fetchPlayers();
  }, [isProcessing]);

  const enterLottery = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    const accounts = await web3.eth.getAccounts();
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(REQUIRED_ETH, 'ether'),
    })

    setIsProcessing(false);
  }

  const selectWinner = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    await lottery.methods.sendWinningsToWinner().send({ from: manager });

    setIsProcessing(false);
  }

  return (
    <div className='app'>
      <h2>Lottery Contract</h2>
      { isProcessing && <h3>Processing on the chain...</h3> }
      <div>
        <p>This contract is managed by { manager }</p>
        <p>Currently there are { players.length } players</p>
        <p>Total contract balance is { web3.utils.fromWei(contractBalance, 'ether') } ETH</p>
      </div>
      <hr />
      <h3>Enter the lottery pool with {REQUIRED_ETH} ETH.</h3>
      <h3>Winners will be picked at random and will receive the entire pool of ETH.</h3>
      { isProcessing
        ? <button disabled={ true }>Check Metamask ...</button>
        : <button onClick={ enterLottery }>Enter the lottery</button>
      }
      { isManager &&
        <div>
          <hr/>
          <h3>Pick a winner and send the pool:</h3>
          <button onClick={ selectWinner }>Select winner</button>
        </div>
      }
    </div>
  );
}

export default App;

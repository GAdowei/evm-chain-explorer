import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { formatEther } from "ethers";
import { chains } from "../data/chainList.json";

const BlockExplorer = () => {
  let config = {
   method: "GET",
   url: "https://api.transpose.io/token/native-token-balances-by-account?",
   headers: { "X-API-KEY": import.meta.env.VITE_X_API_KEY },
  };
  
  const addressRef = useRef('')
  const chainRef = useRef('ethereum') 
  const [selectedChain, setSelectedChain] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState('');
  const [displayMessage, setDisplayMessage] = useState('');

  useEffect(() => {
    if (data) {
       const ethBalance = formatEther(BigInt(data.balance));
       const roundedBalance = Number(ethBalance).toPrecision(5)
     if (data.account_address == "0x0000000000000000000000000000000000000000") {
       setDisplayMessage(`ENS domain unregistered`);
     }
     else {
       setDisplayMessage(
        `Account ${data.account_address} has a balance of ${roundedBalance} ${selectedChain[0].symbol}`
       );
     }
   }
 }, [data]);

 const handleSubmit = (e) => {
   e.preventDefault();
   config.params = { chain_id: chainRef.current, account_addresses: addressRef.current.toLowerCase() };
   setDisplayMessage('');
   fetchData();
 };

  const fetchData = async () => {
  setData('')
  setIsLoading(true);
  setSelectedChain(chains.filter((chain) => {
  return chain.name.toLowerCase() === chainRef.current;
  }));

  try {
   const response = await axios(config);
   const result = await response.data.results;
   setData({
    ...result[0],
   });
  } catch (error) {
   console.log(`Error: ${error}`);
    setDisplayMessage("Invalid Ethereum address or ENS domain provided");
  } finally { setIsLoading(false); }
 };

 return (
  <div className="max-w-xl mx-auto">
   <div className="mt-12">
    <h3 className="text-3xl font-medium mb-4 text-center">
     Account balance lookup
    </h3>
    <form className="flex mb-8 mt-8" onSubmit={handleSubmit}>
     <input
      onChange={(e) => {
       addressRef.current = e.target.value;
      }}
      type="text"
      placeholder="Enter a wallet address or ENS name"
      className="flex-1 p-4 border-2 border-gray-300 rounded-l-full focus:outline-none focus:border-blue-500"
     />
     <button
      type="submit"
      className="ml-2 bg-blue-500 hover:bg-blue-600 text-white pr-6 pl-4 rounded-r-full"
     >
      Search
     </button>
    </form>
   </div>
   <div className="absolute top-12 right-1/4">
    <label className="pr-2">
     <span className="text-2xl font-medium ml-2 text-center">Chain</span>
    </label>
    <select
     onChange={(e) => {
      chainRef.current = e.target.value.toLowerCase();
     }}
     className="p-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
    >
     {chains.map((chain) => (
      <option key={chain.id} value={chain.name}>
       {chain.name}
      </option>
     ))}
    </select>
   </div>

   {isLoading ? (
    <p className="text-center">Loading...</p>
   ) : (
    displayMessage && (
     <div className="border-t border-gray-300 pt-4 mt-4">
      <p className="mb-2 text-center">{displayMessage}</p>
      <a
      target="_blank"
       href={`${selectedChain[0].base_url}address/${data.account_address}`}
       className="text-blue-500 hover:text-blue-600"
      >
       <p className="text-center">View on block explorer</p>
      </a>
     </div>
    )
   )}
  </div>
 );
};

export default BlockExplorer; 
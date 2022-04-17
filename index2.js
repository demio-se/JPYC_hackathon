async function myFunction(){
  console.log("テスト");
  // A Web3Provider wraps a standard Web3 provider, which is
  // what MetaMask injects as window.ethereum into each page
  const provider = await new ethers.providers.Web3Provider(window.ethereum);

  // MetaMask requires requesting permission to connect users accounts
  const blocknumber = await provider.send("eth_requestAccounts", []);
  
  alert(blocknumber);
}

async function myFunction2(){
  console.log("テスト2");
  const provider = await new ethers.providers.Web3Provider(window.ethereum);
  const addresses = await ethereum.request({method: 'eth_requestAccounts'});
  
  // The MetaMask plugin also allows signing transactions to
  // send ether and pay to change state within the blockchain.
  // For this, you need the account signer...
  const signer = await provider.getSigner();
  
  alert(addresses[0]);
}

async function myFunctionJPYC(){
  console.log("JPYC Start");

  const provider = await new ethers.providers.Web3Provider(window.ethereum);
  const addresses = await ethereum.request({method: 'eth_requestAccounts'});
  
  // The MetaMask plugin also allows signing transactions to
  // send ether and pay to change state within the blockchain.
  // For this, you need the account signer...
  const signer = await provider.getSigner();
 
  // You can also use an ENS name for the contract address
  //JPYC Test Net address
  const JPYCAddress = "0xbD9c419003A36F187DAf1273FCe184e1341362C0";

  // The ERC-20 Contract ABI, which is a common contract interface
  // for tokens (this is the Human-Readable ABI format)
  const JPYCAbi = [
    // Some details about the token
    "function name() view returns (string)",
    "function symbol() view returns (string)",

    // Get the account balance
    "function balanceOf(address) view returns (uint)",

    // Send some of your tokens to someone else
    "function transfer(address to, uint amount)",

    // An event triggered whenever anyone transfers to someone else
    "event Transfer(address indexed from, address indexed to, uint amount)"
  ];

  // The Contract object
  const JPYCContract = await new ethers.Contract(JPYCAddress, JPYCAbi, provider);
  
  await JPYCContract.name();
  console.log(JPYCContract.name());

  await JPYCContract.symbol();
  console.log(JPYCContract.symbol());

  const balance = await JPYCContract.balanceOf(addresses[0]);
  console.log(JPYCContract.balanceOf(addresses[0]));


  console.log("JPYC End");
  
}

window.onload = async function(){
  //myFunction();
  //myFunction2();
  myFunctionJPYC();
}





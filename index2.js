async function myFunction(){
  console.log("テスト");
  // A Web3Provider wraps a standard Web3 provider, which is
  // what MetaMask injects as window.ethereum into each page
  const provider = await new ethers.providers.Web3Provider(window.ethereum);

  // MetaMask requires requesting permission to connect users accounts
  const blocknumber = await provider.send("eth_requestAccounts", []);
  
  alert(bolcknumber):
}

async function myFunction2(){
  console.log("テスト2");
  const provider = await new ethers.providers.Web3Provider(window.ethereum);
  const addresses = await etherum.request({method: 'eth_requestAccounts'});
  
  // The MetaMask plugin also allows signing transactions to
  // send ether and pay to change state within the blockchain.
  // For this, you need the account signer...
  const signer = await provider.getSigner();
  
  alert(addresses[0]);
}

window.onload = async function(){
  myFunction();
  myFunction2();
}

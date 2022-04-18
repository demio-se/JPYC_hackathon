/*
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
*/

const testSpender ="0x62164A66E9673d65Ba3AC3BfabE229a1522fa01d";

async function myFunctionJPYC(){
  console.log("JPYC Start");

  //よくわからないが、ブロックチェーンからデータを持ってきてくれるProviderを生成。
  const provider = await new ethers.providers.Web3Provider(window.ethereum);

  //これによりadresses[0]に接続したメタマスクの情報が入るっぽい
  const addresses = await ethereum.request({method: 'eth_requestAccounts'});
  

  //書き込み役singerの設定。メタマスクとの紐付けのことっぽい。
  const signer = await provider.getSigner();

  //この記載でメタマスクのアドレスと一致していることが確認できた。
  console.log("Wallet address is");
  console.log(addresses[0]);
  alert(addresses[0]);
 
  //JPYCのコントラクトアドレス。テストネット。Rinkebey
  //JPYC Test Net address
  const JPYCAddress = "0xbD9c419003A36F187DAf1273FCe184e1341362C0";

  //これはこの中に描いた関数を外から呼び出せるようになるおまじない。
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

    // approveできるようにDaiに定義。
    "function approve(address spender, uint amount)",

    // allowance確認できるようにDaiに定義。
    "function allowance(address owner, address spender)",

    //これだけ関数じゃなくイベント。
    // An event triggered whenever anyone transfers to someone else
    "event Transfer(address indexed from, address indexed to, uint amount)"
  ];

  // The Contract object
  const JPYCContract = await new ethers.Contract(JPYCAddress, JPYCAbi, provider);
  
  await JPYCContract.name();
  console.log(JPYCContract.name());

  await JPYCContract.symbol();
  console.log(JPYCContract.symbol());

  let balance = await JPYCContract.balanceOf(addresses[0]);
  console.log(JPYCContract.balanceOf(addresses[0]));
  let balaceDecimal = ethers.utils.formatEther(balance);
  console.log(balaceDecimal);
  
  JPYCContract.approve(testSpender, 100);

  let allowanceAmount = JPYCContract.approve(testSpender, 100);
  let allowanceAmountDecimal = ethers.utils.formatEther(allowanceAmount);
  console.log(allowanceAmountDecimal);

  console.log("JPYC End");
  
}

window.onload = async function(){
  //myFunction();
  //myFunction2();
  myFunctionJPYC();
}





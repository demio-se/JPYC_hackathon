const testSmartContract = "0xa89F0f8f91135BD071f4aFAF000010cB8CE75635"; //Rinkebeyの勝手に応援スマートコントラクト.Rinkeby以外でも動くかも。引数でJPYCのアドレス入れているため

//const JPYCAddress = "0xbD9c419003A36F187DAf1273FCe184e1341362C0"; //Rinkeby JPYC Address
const JPYCAddress = "0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB"; //GoerliのJPYC Address

//ethers.js member. for metamask
let provider;
let addresses;
let signer;

//for original smart contract
let JpycSupportContract;
let JpycSupportWithSinger;
let JPYCWithSigner;

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

  // FromからToへtransferFrom.
  "function transferFrom(address from, address to, uint amount)",

  // approveできるようにDaiに定義。
  "function approve(address spender, uint amount)",

  // allowance確認できるようにDaiに定義。
  "function allowance(address owner, address spender)",

  //これだけ関数じゃなくイベント。
  // An event triggered whenever anyone transfers to someone else
  "event Transfer(address indexed from, address indexed to, uint amount)"
];

const JpycSupportAbi = [
  // Some details about the token
  "function name() view returns (string)",
  "function symbol() view returns (string)",

  // Get the account balance
  "function balanceOf(address) view returns (uint)",

  // Send some of your tokens to someone else
  "function transfer(address to, uint amount)",

  // FromからToへtransferFrom.
  "function transferFrom(address from, address to, uint amount)",

  // approveできるように定義。
  //"function approve(address spender, uint amount) returns(bool)",

  // allowance確認できるように定義。
  //"function allowance(address owner, address spender) view returns(bool)",

  //オリジナルの関数をAbiに定義
  "function createProject(string argtoTwID, string argfromTwID, address argfromAddress, uint argamount) payable",

  //指定したTwIDの現在の支援総額を返す関数
  "function projectAllowance(string argtoTwID) view returns (uint256)",
  //期限になったときに呼んでほしい関数
  "function projectFinish(string argtoTwID, uint256 targetAmount) payable returns (uint256 )",
  //募集終了して実際に獲得した金額
  "function finishedProjectAllowance(string  argtoTwID) view returns (uint256)",

  //現在スマートコントラクトが所持している金額を表示
  "function jpycAmount() view returns (uint)",
  //応援者の全データを取得
  //"function getAllProject() view returns (string[])",

  //これだけ関数じゃなくイベント。用途はよくわからない
  // An event triggered whenever anyone transfers to someone else
  "event Transfer(address indexed from, address indexed to, uint amount)"
];

async function connectButtonClick() {

  await connectMetamask(); //Providerとかの設定
  //alert('connectMetamask 実行');
}

//ConnectMetamaskFunction
async function connectMetamask() {
  console.log('start connectMetamask');

  //ConnectMetamask
  provider = await new ethers.providers.Web3Provider(window.ethereum);

  //adresses[0] is metamask wallet address
  addresses = await ethereum.request({ method: 'eth_requestAccounts' });
  console.log("Wallet address is");
  console.log(addresses[0]);

  //singer is writing role.
  signer = await provider.getSigner();

  //コントラクトアドレス、ABI、ProviderまたはSignerからContractを作成します。
  // The Contract object. made from contractAddress,abi, prvider or signer
  const JpycSupportContract = await new ethers.Contract(testSmartContract, JpycSupportAbi, provider);


  //今のコントラクト（JpycSupportContract）はProviderとつながっているが、Read OnlyなのでSignerとも接続
  //contract Connect with Signer.
  JpycSupportWithSinger = JpycSupportContract.connect(signer);

  console.log("connectMetamask End");
  alert('connectMetamask End');
}



//☆此処から先を応援するボタンを押したら実行したい。
//CreateProject
async function CreateProject(inputYen, inputToTwId, inputFromTwId) {

  console.log("Create Projectstart");

  //金額を変換
  const jpyc1 = ethers.utils.parseUnits(String(inputYen), 18);
  console.log(String(inputYen));

  //metamaskのアドレスからtestSpenderにapprove。設定したJPYC使って良いよ
  //スマートコントラクトのアドレスにJPYCをアプルーブ
  let tx = await JpycSupportWithSinger.approve(testSmartContract, jpyc1);
  console.log("approve JPYC by JPYCWithSigner to testSmartContract");

  //スマートコントラクトのCreateProject関数を実行
  //tx = await JpycSupportWithSinger.createProject( inputToTwId, inputFromTwId, addresses[0], jpyc1);
  await JpycSupportWithSinger.createProject(inputToTwId, inputFromTwId, addresses[0], jpyc1);
  console.log("Create Project!");

  //console.log("jpycAmount()");
  //tx = await JpycSupportWithSinger.jpycAmount();
  //console.log( tx);

}


//☆応援中の人の支援総額。使い道ないかも。
async function projectAllowance(inputToTwId) {
  let tx;
  let decimalTotal;
  const JpycSupportContract2 = await new ethers.Contract(testSmartContract, JpycSupportAbi, provider);

  console.log("projectAllowance is ");
  tx = await JpycSupportContract2.projectAllowance(inputToTwId);
  decimalTotal = ethers.utils.formatUnits(tx, 18);
  console.log(decimalTotal);

}

//☆期限が来たことを示す仮想ボタンを押したら実行したい。
async function projectFinish(inputToTwId, targetAmount) {

  //期限が来たので、プロジェクト終了をスマートコントラクトに通知
  let tx = await JpycSupportWithSinger.projectFinish(inputToTwId, targetAmount);
  console.log("Finish Project!");
  //console.log( tx);

}


//☆最終的な支援総額を表示。使い道ないかも。
async function finishedProjectAllowance(inputToTwId) {

  let tx;
  let decimalTotal;
  const JpycSupportContract2 = await new ethers.Contract(testSmartContract, JpycSupportAbi, provider);
  console.log("finishedProjectAllowance");
  tx = await JpycSupportContract2.finishedProjectAllowance(inputToTwId);
  decimalTotal = ethers.utils.formatUnits(tx, 18);
  console.log(decimalTotal);


  /*document.getElementById("finished").innerHTML
    = `${inputToTwId}が勝手に応援されました!<br>支援総額${decimalTotal}円`;
  */

}

//作りかけ。クラウドファンディングプロジェクトの新規作成
//create new crowd funding project
async function clickNewProject() {
  var toTwIdText = document.getElementById('toTwIdText').value;
  var targetAmount = document.getElementById('targetAmount').value;
  var targetDate = document.getElementById('targetDate').value;
  var url = document.getElementById('url').value;
  console.log(toTwIdText);
  console.log(targetAmount);
  console.log(targetDate);
  console.log(url);

}
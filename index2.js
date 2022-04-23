const testSpender ="0x62164A66E9673d65Ba3AC3BfabE229a1522fa01d";  //テスト用メタマスクアカウント
const testSmartContract = "0x683a7d8417d0a881Dbb9EcDB7c6C31e9c43005d4"; //Rinkebeyのスマートコントラクト

//JPYCのコントラクトアドレス。テストネット。Rinkebey
//JPYC Test Net address
const JPYCAddress = "0xbD9c419003A36F187DAf1273FCe184e1341362C0";
let time ="22/04/24 0111";

let provider;
let providerSC;

let addresses;
let addressesSC;
let signer;
let signerSC;

let JPYCContract;
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


async function myFunctionJPYC(){
  console.log(time);
  

  //ブロックチェーンからデータを持ってきてくれるProviderを生成。
  provider = await new ethers.providers.Web3Provider(window.ethereum);
  providerSC = await new ethers.providers.Web3Provider(window.ethereum);

  //これによりadresses[0]に接続したメタマスクの情報が入るっぽい
  addresses = await ethereum.request({method: 'eth_requestAccounts'});
  addressesSC = await ethereum.request({method: 'eth_requestAccounts'});
  

  //書き込み役singerの設定。メタマスクとの紐付けのことっぽい。
  signer = await provider.getSigner();
  //書き込み役singerの設定。メタマスクとの紐付けのことっぽい。
  signerSC = await providerSC.getSigner();

  //この記載でメタマスクのアドレスと一致していることが確認できた。
  console.log("Wallet address is");
  console.log(addresses[0]);
  //alert(addressesSC[0]);
 


  // The Contract object
  const JPYCContract = await new ethers.Contract(JPYCAddress, JPYCAbi, provider);
  const JpycSupportContract = await new ethers.Contract(testSmartContract, JpycSupportAbi, providerSC);
  
  //Sendするときに戻り値もらうやつ
  let tx;


  //今のコントラクト（JPYCContract）はProviderとつながっているが、Read OnlyなのでSignerとも接続
  JPYCWithSigner = JPYCContract.connect(signer);
  JpycSupportWithSinger = JpycSupportContract.connect(signerSC);
  console.log("JPYCWithSinger define");

  
  console.log("myFunctionJPYC End");
}

//☆此処から先を応援するボタンを押したら実行したい。
async function CreateProject(inputYen, inputToTwId, inputFromTwId){
  

  console.log("Create Projectstart");
  const jpyc1 = ethers.utils.parseUnits(String(inputYen), 18);
  console.log(String(inputYen));
  //metamaskからtestSpenderに送金。テスト完了したのでコメントアウト
  /*
  tx = JPYCWithSigner.transfer(testSpender, jpyc1);
  console.log("send JPYC by JPYCWithSigner");
*/
  //metamaskのアドレスからtestSpenderにapprove。設定したJPYC使って良いよ
  /*
  tx = JPYCWithSigner.approve( testSpender, jpyc1);
  console.log("approve JPYC by JPYCWithSigner to testSpender");
*/
  //スマートコントラクトのアドレスにJPYCをアプルーブ
  let tx = await JPYCWithSigner.approve( testSmartContract, jpyc1);
  console.log("approve JPYC by JPYCWithSigner to testSmartContract");

  //スマートコントラクトのCreateProject関数を実行
  //tx = await JpycSupportWithSinger.createProject( inputToTwId, inputFromTwId, addressesSC[0], jpyc1);
  await JpycSupportWithSinger.createProject( inputToTwId, inputFromTwId, addressesSC[0], jpyc1);
  console.log("Create Project!");

  //console.log("jpycAmount()");
  //tx = await JpycSupportWithSinger.jpycAmount();
  //console.log( tx);
  
}

window.onload = async function(){
  //myFunction();
  //myFunction2();
  await myFunctionJPYC(); //Providerとかの設定

  await CreateProject( 10, "toTwId1", "fromTwId1");  //応援ボタン押したとみなす
  //スマートコントラクトから情報を取得
  const JpycSupportContract2 = await new ethers.Contract(testSmartContract, JpycSupportAbi, providerSC);
  let  tx = await JpycSupportContract2.jpycAmount();
  console.log("jpycAmount is");
  //console.log( ethers.utils.formatUnits(tx, 18));
  console.log( tx);
  //getAllProjectはボツ。
  //tx = await JpycSupportContract2.getAllProject();
  //console.log( tx);

  console.log("projectAllowance");
  tx = await JpycSupportContract2.projectAllowance("toTwId1");
  console.log("tx");
  console.log( tx);
  console.log("decimal");
  let decimalTotal =ethers.utils.formatUnits(tx, 18);
  console.log(decimalTotal );
  
  //await projectAllowance("toTwId1");  //toTwId1の募集中の金額を表示
  //await projectFinish("toTwId1", 0);  //応援ボタン押したとみなす
  //await projectAllowance("toTwId1");  //toTwId1の募集中の金額を表示。0になるはず
  //await finishedProjectAllowance("toTwId1");  //toTwId1の成功した募集中の金額を表示

}


//☆応援中の人の支援総額。使い道ないかも。
async function projectAllowance( inputToTwId){
  let tx;
  console.log("projectAllowance");

}

//☆期限が来たことを示す仮想ボタンを押したら実行したい。
async function projectFinish( inputToTwId, targetAmount){
  
  //期限が来たので、プロジェクト終了をスマートコントラクトに通知
  let tx = await JpycSupportWithSinger.projectFinish( inputToTwId, targetAmount);
  console.log("Finish Project!");
  //console.log( tx);

}


//☆最終的な支援総額を表示。使い道ないかも。
async function finishedProjectAllowance( inputToTwId){
  
  console.log("finishedProjectAllowance");

  //スマートコントラクトから情報を取得
  const JpycSupportContract2 = await new ethers.Contract(testSmartContract, JpycSupportAbi, providerSC);
  let tx = await JpycSupportContract2.finishedProjectAllowance( inputToTwId);
  //let tx = await JpycSupportWithSinger.finishedProjectAllowance( inputToTwId);
  //let tx = JpycSupportWithSinger.projectFinish( inputToTwId);
  console.log("total Supporting Amount is");
  console.log("let");
  console.log(tx);
  console.log("decimals");
  let decimalTotal =ethers.utils.formatUnits(tx, 18);
  console.log(decimalTotal );

  document.getElementById("finished").innerHTML
    = `${inputToTwId}が勝手に応援されました!＜br＞支援総額${decimalTotal}円`;

  
}
/*  
  //一応この送り方で送金できた。
  tx = signer.sendTransaction({
    to: testSpender,
    value: ethers.utils.parseEther("0.01")
  });
  console.log("const tx = signer.sendTransaction");
  */
  /*
  //allowanceがうまく動かないのでコメントアウト。
  balance = JPYCWithSigner.allowance(addresses[0], testSpender);
  balanceDecimal = ethers.utils.formatEther(balance);
  

  console.log("allowance balance");
  console.log(balance);
  console.log("allowance balance Decimal");
  console.log(balanceDecimal);
  */

/*
  //送金した金額のうち、approveした金額をtransferFromで戻したかったけど、別のアドレスのメタマスクに接続しないと無理な気がする
  const jpyc01 = ethers.utils.parseUnits("0.1", 18);
  tx = JPYCWithSigner.transferFrom( addresses[0], testSpender, jpyc01);
  console.log("approve JPYC by JPYCWithSigner to testSpender");
*/
  /*  JPYCContract.approve(testSpender, 100);

  let allowanceAmount = JPYCContract.approve(testSpender, ethers.utils.parseEther('100'));
  let allowanceAmountDecimal = ethers.utils.formatEther(allowanceAmount);
  console.log(allowanceAmountDecimal);
  */

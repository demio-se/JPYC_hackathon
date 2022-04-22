// SPDX-License-Identifier: MIT
//オープンソースのMITライセンスです。ご自由にお使いください

//バージョン指定
pragma solidity ^0.8.0;

//ERC20規格を読み込むための準備
interface IERC20 {
    //標準的なインタフェース
    //function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    //追加で呼び出したい関数を指定しています
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);

   	function decimals() external view returns (uint256);

}



contract JPYC_Example {

    //上で定義したERC20規格を呼び出すための仕組み(インタフェース)です
    //IERC20 public jpyc;

    //貯金箱持ち主のアドレスです
    address owner;
    //JPYCのインターフェイス。JPYCのスマートコントラクトの関数を呼べるように。
    IERC20 internal jpycInterface;

    constructor(address _jpyc_address) {
         //スマートコントラクトの作成者を貯金箱の持ち主に設定します
         owner = msg.sender;

         //JPYCのスマートコントラクトのアドレスを入力してインターフェイスを作る。これでJPYCの関数呼べる
         jpycInterface = IERC20(_jpyc_address);
         
         //Ethereum NetworkのJPYC
         //jpyc = IERC20(0x2370f9d504c7a6e775bf6e14b3f12846b594cd53);
         
         //Ethereumテストネット RinkebeyのJPYCのコントラクトアドレス
         //jpyc = IERC20(0xbD9c419003A36F187DAf1273FCe184e1341362C0);

         //なんでもトークンさんからのコメント。「コントラクトアドレスのパラメータ調整のうえ、テストネットJPYCを貯金箱にtransferするとよいと思います。」
         //Polygon Network(matic)のJPYC
         //jpyc = IERC20(0x6AE7Dfc73E0dDE2aa99ac063DcF7e8A63265108c);
         
        //_mintが標準的なインターフェースに含まれてないと使えない。
        //_mint( owner, initialSupply);
         
         //xDai NetworkのJPYC
         //jpyc = IERC20(0x417602f4fbdd471A431Ae29fB5fe0A681964C11b);  コメントアウト中
    } 

    //構造体で支援先、支援者の情報をまとめる
    struct Project {
        string toTwID;    //支援される人。お金受け取る人
        string fromTwID;   //支援する人。お金送る人
        address fromAddress;   //支援する人のウォレットアドレス
        uint256 amount;     //支援額。allowanceで取れるので、要らないかも？
    }

    Project[] public allProjects;
    
    //構造体Projectを放り込むmapping projectsの宣言
    mapping (uint256 => Project) public projects;
    
    //引数をプッシュする。ガス発生
    function createProject(string  memory argtoTwID, string memory argfromTwID, address  argfromAddress, uint256  argamount) public {
         Project memory tempProject;
         for(uint256 i=0; i< allProjects.length ; i++) {
             tempProject = allProjects[i];

            //同じ組み合わせがあるか探す    
             if( keccak256(abi.encodePacked(tempProject.toTwID)) == keccak256(abi.encodePacked(argtoTwID))
              && keccak256(abi.encodePacked(tempProject.fromTwID)) == keccak256(abi.encodePacked(argfromTwID))
               && tempProject.fromAddress == argfromAddress)
             {
                //同じ組み合わせなら金額だけ更新してプッシュしないで抜ける
                allProjects[i].amount = argamount;
                return;
             }  
         }
         //ここまで来ているということは同じ組み合わせが無いのでプッシュ
         allProjects.push(Project(argtoTwID, argfromTwID, argfromAddress, argamount));
         return;
    }

    //プロジェクトの期限が到来したら呼ばれる関数。本当は期限の確認もしないといけないが割愛。期限がきたことは呼ぶ側が確認。
    //支援先を探す⇒JPYCのインターフェイスでallowanceの合計金額計算と都度transferFrom⇒allowanceの合計金額をreturn
    //function projectFinish(string memory argtoTwID, uint256 targetAmount) public view returns (uint256) {
    function projectFinish(string memory argtoTwID, uint256 targetAmount) external payable returns (uint256) {
         Project memory tempProject;
         uint256 totalAllowance=0;
         for(uint256 i=0; i< allProjects.length ; i++) {
             tempProject = allProjects[i];

            //引数の支援先を探す    
             if( keccak256(abi.encodePacked(tempProject.toTwID)) == keccak256(abi.encodePacked(argtoTwID)) )
             {                 
                //JPYCでallowanceを呼び出して、トータルallowanceに加算
                totalAllowance += jpycInterface.allowance( tempProject.fromAddress , address(this));
         
             }  
        }
        //支援額が超えているか確認。
        if(totalAllowance >= targetAmount){
            //支援総額が目標金額を超えていた。
            //無駄だけど関数内でProjectの配列作れなかったのでもう一回回してtransferFromを繰り返す
            for(uint256 i=0; i< allProjects.length ; i++) {
                tempProject = allProjects[i];

                //引数の支援先を探す    
                if( keccak256(abi.encodePacked(tempProject.toTwID)) == keccak256(abi.encodePacked(argtoTwID)) )
                {                    
                    //JPYCでtransferFrom
                    jpycInterface.transferFrom( tempProject.fromAddress , address(this), jpycInterface.allowance( tempProject.fromAddress , address(this)));
                    
                }  
            }
            
        }
        else {
            return 0;
            }


    return totalAllowance;
    }

    //名前を確認する関数です
    function getname() public view returns (string memory){
        return jpycInterface.name();
    }

    //シンボル(JPYC)を確認する関数です
    function getsymbol() public view returns (string memory){
        return jpycInterface.symbol();
    }

    //スマートコントラクトに入っている総額を確認する関数です
    function jpycAmount() public view returns (uint) {
        return jpycInterface.balanceOf(address(this)) / 10 ** 18;
    }

    //スマートコントラクトからの送金を許可する関数です
    /*
    function approveJpycFromContract() public {
        jpycInterface.approve( address(this) , jpyc.balanceOf(address(this)) );
    }
    */

    //貯金箱からの出金をする関数です
    /*
    function withdraw_jpyc() public {
        //貯金箱の持ち主だけが呼び出せるように『require』で指定しています
        require(msg.sender == owner);
        //jpyc.transferFrom(address(this) , owner , jpyc.balanceOf(address(this)) );
    }
    */
}

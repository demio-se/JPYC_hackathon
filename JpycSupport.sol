// SPDX-License-Identifier: MIT
//オープンソースのMITライセンスです。ご自由にお使いください

//バージョン指定
pragma solidity ^0.8.0;

//ERC20規格を読み込むための準備
interface IERC20 {
    //標準的なインタフェース
    //function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    //追加で呼び出したい関数を指定しています
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    //function decimals() external view returns (uint256);
}

contract JpycSupport {
    //上で定義したERC20規格を呼び出すための仕組み(インタフェース)です
    //IERC20 public jpyc;

    //貯金箱持ち主のアドレスです
    address owner;
    //JPYCのインターフェイス。JPYCのスマートコントラクトの関数を呼べるように。
    //JPYC Test Net address 0xbD9c419003A36F187DAf1273FCe184e1341362C0
    IERC20 internal jpycInterface;

    event DebugLogEvent(string);

    constructor(address _jpyc_address) {
        //スマートコントラクトの作成者を貯金箱の持ち主に設定します
        owner = msg.sender;

        //JPYCのスマートコントラクトのアドレスを入力してインターフェイスを作る。これでJPYCの関数呼べる
        jpycInterface = IERC20(_jpyc_address);
    }

    //構造体で支援先、支援者の情報をまとめる
    struct Project {
        string toTwID; //People to be supported. People who receive money.
        string fromTwID; //People to support. People who send money.
        address fromAddress; //支援する人のウォレットアドレス
        uint256 amount; //支援額。allowanceで取れるので、要らないかも？と思ったけど送金してもらうことになったので必要
        bool isFinish; //プロジェクトの終了。trueなら終了
    }

    //クラウドファンディング情報の構造体
    struct crowdFandingInfo {
        string identifier; //Cloudfounding identifier
        address founderWalletAddress;
    }

    //寄付情報の構造体.更新はしないで追加と参照だけ。日時やfromTwIDはWebサイトで保持
    struct donationInfo {
        string identifier; //Cloudfounding identifier
        address fromAddress; //people to support's wallet.支援する人のウォレットアドレス
        uint256 amount; //支援額。allowanceで取れるので、要らないかも？と思ったけど送金してもらうことになったので必要
    }

    //構造体の配列でクラウドファンディング情報と寄附情報を管理
    crowdFandingInfo[] public crowdFandingInfos;
    donationInfo[] public donationInfos;

    Project[] public allProjects;

    /// @title createCrowdFanding
    /// @author demio_se
    /// @notice create crowd fanding. push to crowdFandingInfos when argIdentifier is unique.
    /// @dev 
    function createCrowdFanding(
        string memory argIdentifier; //Cloudfounding identifier
        address argFounderWalletAddress;
    ) external payable {
        for (uint256 i = 0; i < crowdFandingInfos.length; i++) {
            if (keccak256(abi.encodePacked(crowdFandingInfos[i].identifier)) ==
                keccak256(abi.encodePacked(argIdentifier)) &&)
                {
                    return; //☆エラーで返したい。how？
                }
        
        }


    }

    //引数をプッシュする。ガス発生
    function createProject(
        string memory argtoTwID,
        string memory argfromTwID,
        address argfromAddress,
        uint256 argamount
    ) external payable {
        uint256 thisAllowance = jpycInterface.allowance(
            argfromAddress,
            address(this)
        );
        for (uint256 i = 0; i < allProjects.length; i++) {
            //toTwIDとfromAddressの同じ組み合わせで未終了があるか探す
            if (
                keccak256(abi.encodePacked(allProjects[i].toTwID)) ==
                keccak256(abi.encodePacked(argtoTwID)) &&
                allProjects[i].fromAddress == argfromAddress &&
                !allProjects[i].isFinish
            ) {
                emit DebugLogEvent("CreateProject 1");

                //fromTwIDが違ったら後優先で上書き
                if (
                    keccak256(abi.encodePacked(allProjects[i].fromTwID)) ==
                    keccak256(abi.encodePacked(argfromTwID))
                ) {
                    allProjects[i].fromTwID = argfromTwID;
                }

                if (allProjects[i].amount == thisAllowance) {
                    //何もしない
                    emit DebugLogEvent("CreateProject 2");
                } else if (allProjects[i].amount < thisAllowance) {
                    //差額を貰う。
                    jpycInterface.transferFrom(
                        argfromAddress,
                        address(this),
                        thisAllowance - allProjects[i].amount
                    );
                    allProjects[i].amount = argamount;
                    emit DebugLogEvent("CreateProject 3");
                } else {
                    //差額を返す
                    jpycInterface.transfer(
                        allProjects[i].fromAddress,
                        allProjects[i].amount - thisAllowance
                    );
                    allProjects[i].amount = argamount;
                    emit DebugLogEvent("CreateProject 4");
                }
                return;
            }
        }
        //ここまで来ているということは同じ組み合わせが無いので配列へ書き込み
        emit DebugLogEvent("CreateProject 5");
        jpycInterface.transferFrom(
            argfromAddress,
            address(this),
            thisAllowance
        );
        emit DebugLogEvent("CreateProject 6");

        allProjects.push(
            Project(
                argtoTwID,
                argfromTwID,
                argfromAddress,
                thisAllowance,
                false
            )
        );
        emit DebugLogEvent("CreateProject 7");

        //approveは接続したメタマスクから呼び出すのが良さそうなのでコメントアウト
        //jpycInterface.approve(msg.sender, argamount);

        return;
    }

    //プロジェクトの期限が到来したら呼ばれる関数。本当は期限の確認もしないといけないが割愛。期限がきたことは呼ぶ側が確認。
    //支援先を探す⇒JPYCのインターフェイスでallowanceの合計金額計算と都度transferFrom⇒allowanceの合計金額をreturn
    //function projectFinish(string memory argtoTwID, uint256 targetAmount) public view returns (uint256) {
    function projectFinish(string memory argtoTwID, uint256 targetAmount)
        external
        payable
        returns (uint256)
    {
        uint256 totalAllowance = 0;

        totalAllowance = projectAllowance(argtoTwID);
        //支援額が超えているか確認。
        //支援総額が目標金額を超えていた。
        //無駄だけど関数内でProjectの配列作れなかったのでもう一回回してtransferFromを繰り返す
        for (uint256 i = 0; i < allProjects.length; i++) {
            //引数の支援先を探す
            if (
                keccak256(abi.encodePacked(allProjects[i].toTwID)) ==
                keccak256(abi.encodePacked(argtoTwID)) &&
                !allProjects[i].isFinish
            ) {
                //送金しててもしてなくてもプロジェクトから削除。配列の削除ができないので、isFinishを更新
                allProjects[i].isFinish = true;
                //目標金額に達しているか確認
                if (totalAllowance >= targetAmount) {
                    //Create時に送金してもらっているので目標金額達成している場合は何もしない
                    //jpycInterface.transferFrom( tempProject.fromAddress , address(this), jpycInterface.allowance( tempProject.fromAddress , address(this)));
                } else {
                    //目標金額に達しなかったので預かったお金を返す
                    jpycInterface.transfer(
                        allProjects[i].fromAddress,
                        allProjects[i].amount
                    );
                    allProjects[i].amount = 0;
                }
            }
        }

        if (totalAllowance >= targetAmount) {
            return totalAllowance / 10**18; //目標金額超えたので総額をreturn。
        }

        return 0; //目標金額未満なので0をReturn
    }

    //現在の総支援額をreturn
    function projectAllowance(string memory argtoTwID)
        public
        view
        returns (uint256)
    {
        uint256 totalAllowance = 0;
        for (uint256 i = 0; i < allProjects.length; i++) {
            //引数の支援先を探す。終わってないもののみ。
            if (
                keccak256(abi.encodePacked(allProjects[i].toTwID)) ==
                keccak256(abi.encodePacked(argtoTwID)) &&
                !allProjects[i].isFinish
            ) {
                //総額を計算
                totalAllowance += allProjects[i].amount;
            }
        }
        return totalAllowance;
    }

    //これまで実際に受けた支援額をreturn
    function finishedProjectAllowance(string memory argtoTwID)
        public
        view
        returns (uint256)
    {
        uint256 totalAllowance = 0;
        for (uint256 i = 0; i < allProjects.length; i++) {
            //引数の支援先を探す。終わったもののみ。
            if (
                keccak256(abi.encodePacked(allProjects[i].toTwID)) ==
                keccak256(abi.encodePacked(argtoTwID)) &&
                allProjects[i].isFinish
            ) {
                //総額を計算
                totalAllowance += allProjects[i].amount;
            }
        }
        return totalAllowance;
    }

    //名前を確認する関数です
    function getname() public view returns (string memory) {
        return jpycInterface.name();
    }

    //シンボル(JPYC)を確認する関数です
    function getsymbol() public view returns (string memory) {
        return jpycInterface.symbol();
    }

    //スマートコントラクトに入っている総額を確認する関数です
    function jpycAmount() public view returns (uint256) {
        return jpycInterface.balanceOf(address(this));
    }

    //
    function transfer(address recipient, uint256 amount)
        internal
        returns (bool)
    {
        jpycInterface.transfer(recipient, amount);
        return true;
    }

    //
    function getAllProject() public view returns (Project[] memory) {
        return allProjects;
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

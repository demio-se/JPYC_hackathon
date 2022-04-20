// ⓪ コンパイラバージョンを指定する
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
}

// ① Contract名を宣言
contract JpycSupport {

    uint num = 0;

    // ③ 構造体の性質を持った配列を変数todosとして定義
    struct stSupporter {
        string fromTwId;
        string wAddress;
        bool isDislose; //自分のツイッターIDを明かすか？
    }

    Todo[] public todos;

    // ④ mappingを宣言
    mapping (uint => address) public todoToOwner;

    // ⑤ mappingを宣言
    mapping (address => uint) public ownerTodoCount;

    // ⑥ Todoを作成する関数 （Gas発生）
    function TodoCreate(string memory _task) public {
        uint id = todos.push( Todo(num, _task, true) ) - 1;
        todoToOwner[id] = msg.sender;
        ownerTodoCount[msg.sender]++;
        num++;
    }

    // ⑦ Todoの状態を完了にする関数 （Gas発生）
    function TodoRemove(uint id) external {
        require(todoToOwner[id] == msg.sender);
        require(todos[id].flag);
        todos[id].flag = false;
    }

    // ⑧ 自分のイーサリアムアドレスに紐づくTodoのidを取得する関数 （ガス代不要）
  	function getTodosByOwner(address owner) external view returns(uint[] memory) {
    	uint[] memory result = new uint[](ownerTodoCount[owner]);
    	uint counter = 0;
    	for (uint i = 0; i < todos.length; i++) {
    		if (todoToOwner[i] == owner){
    			result[counter] = i;
    			counter++;
    		}
    	}
    	return result;
	}

}
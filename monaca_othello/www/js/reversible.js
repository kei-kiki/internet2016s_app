/*----------------------------/
 HTMLとJavaScriptでオセロをつくる
/----------------------------*/    

	/*-- エラーを厳格チェックモードで判定 --*/
	"use strict";

	/*-- 二重配列 --*/
	var WeightData = [
		[ 30,-12,  0, -1, -1,  0, -12,  30],
		[-12,-15, -3, -3, -3, -3, -15, -12],
		[  0, -3,  0, -1, -1,  0,  -3,   0],
		[ -1, -3, -1, -1, -1, -1,  -3,  -1],
		[ -1, -3, -1, -1, -1, -1,  -3,  -1],
		[  0, -3,  0, -1, -1,  0,  -3,   0],
		[-12,-15, -3, -3, -3, -3, -15, -12],
		[ 30,-12,  0, -1, -1,  0, -12,  30],
	];

	/*-- 変数を定義 --*/
	var BLACK = 1, WHITE = 2;
	var data = [];
	var myTurn = false;

/*********** init():初期化関数(bodyタグを読み込んだ時に実行される関数) ***********/
	function init() {
		/*-- 変数bにtable(id名:board)を指定する分を代入 --*/
		var b = document.getElementById("board");

		/*-- 繰り返し文(8回繰り返す) --*/
		for (var i = 0 ; i < 8 ; i++) {
			/*-- 変数trにtrタグを新しくつくる命令文を代入 --*/
			var tr = document.createElement("tr");

			/*-- データのi(0~7)番目の配列は[0, 0, 0, 0, 0, 0, 0, 0] --*/
			data[i] = [0, 0, 0, 0, 0, 0, 0, 0];

			/*-- 繰り返し(8回繰り返す) --*/
			for (var j = 0 ; j < 8 ; j++) {
				/*-- 変数tdにtdタグを新しくつくる命令文を代入 --*/
				var td = document.createElement("td");
					/*-- 作ったtdタグのclass名はcell --*/
					td.className = "cell";
					/*-- 作ったtdタグのid名はcell+i(0~7)+j(0~7) --*/
					td.id = "cell" + i + j;
					/*-- tdをクリックしたら、クコールバック関数を呼び出し --*/
					td.onclick = clicked;
					/*-- trの子ノードリストにtdを追加 --*/
					tr.appendChild(td);
			}
			/*-- table(id名:board)の子ノードリストにtrを追加 --*/
			b.appendChild(tr);
		}

		/*-- 関数put(引数i(座標),j(座標),color(色))を実行 --*/
		put(3, 3, BLACK);
		put(4, 4, BLACK);
		put(3, 4, WHITE);
		put(4, 3, WHITE);

		/*	つまり碁盤はこう。
			[0, 0, 0, 0, 0, 0, 0, 0]
			[0, 0, 0, 0, 0, 0, 0, 0]
			[0, 0, 0, 0, 0, 0, 0, 0]
			[0, 0, 0, 黒, 白, 0, 0, 0]
			[0, 0, 0, 白, 黒, 0, 0, 0]
			[0, 0, 0, 0, 0, 0, 0, 0]
			[0, 0, 0, 0, 0, 0, 0, 0]
			[0, 0, 0, 0, 0, 0, 0, 0]
			[0, 0, 0, 0, 0, 0, 0, 0]	*/

		/*-- 関数update()を実行 --*/
		update();
	}
/*********** init():初期化関数(bodyタグを読み込んだ時に実行される関数) ************/


/*********** 関数　update() ***********************************************/
	function update() {
		/*-- 変数numWhiteとnumBlackを定義, 0を代入 --*/
		var numWhite = 0, numBlack = 0;

		/*-- 繰り返し(8回繰り返す) --*/
		for (var x = 0 ; x < 8 ; x++) {
			/*-- 繰り返し(8回繰り返す) --*/
			for (var y = 0 ; y < 8 ; y++) {

				/*-- もし白だったら白を増やす --*/
				if (data[x][y] == WHITE) {
					numWhite++;
				}
				/*-- もし黒だったら黒を増やす --*/
				if (data[x][y] == BLACK) {
				numBlack++;
				}
			}
		}
		/*-- 枚数カウント部分 --*/
		document.getElementById("numBlack").textContent = numBlack;
		document.getElementById("numWhite").textContent = numWhite;

		/*-- 各変数に、挟める駒があるか調べる関数canFlip()を代入 --*/
		var blackFlip = canFlip(BLACK);
		var whiteFlip = canFlip(WHITE);

		/*-- 最後の勝ち負け判定 --*/
		/*-- もし碁盤がいっぱいになったら --*/
		if (numWhite + numBlack == 64 || (!blackFlip && !whiteFlip)) {
			/*-- 勝ち負けお知らせスペースの指定を変数finmsgに代入 --*/
			var finmsg = document.getElementById("finmessage");
			/*-- 引き分けの場合 --*/
			if (numWhite == numBlack){
				finmsg.innerHTML = "引き分け";
				askreload();
			}
			/*-- 黒の勝ちの場合 --*/
			else if (numWhite < numBlack){
				finmsg.innerHTML = "勝ち";
				askreload();
			}
			/*-- 黒の負けの場合 --*/
			else if (numWhite > numBlack){
				finmsg.innerHTML = "負け";
				askreload();
			}
		}
		/*-- 黒では挟めない場合 --*/
		else if (!blackFlip) {
			showMessage("黒スキップ");
			/*-- 黒の順番は無効 --*/
			myTurn = false;
		}
		/*-- 白では挟めない場合 --*/
		else if (!whiteFlip) {
			showMessage("白スキップ");
			/*-- 黒の順番 --*/
			myTurn = true;
		}
		/*-- 基盤がいっぱいでない場合 --*/
		else {
			/*-- 自分の番を自分の番でなくす(自分が打ったら次は相手の番にする) --*/
			myTurn = !myTurn;
		}
		/*-- もし黒の順番でない場合 --*/
		if (!myTurn) {
			/*-- コンピュータ思考関数think()が1秒後に実行される --*/
			setTimeout(think, 1000);
		}
	}
/*********** 関数　update() ***********************************************/


/*********** 関数　askreload() ********************************************/
	function askreload(){
		var myRet = confirm("もう一度プレイする？");
		if ( myRet == true ){
			window.location.reload();
		}else{
			
		}
	}
/*********** 関数　askreload() ********************************************/


/*********** 関数　howMessage() *******************************************/
	function showMessage(str) {
		/*-- メッセージを引数を代入にする --*/
		document.getElementById("message").textContent = str;
		/*-- 2秒後にメッセージを空にする --*/
		setTimeout(function () {
			document.getElementById("message").textContent = "";
		}, 2000);
	}
/*********** 関数　howMessage() *******************************************/


/*********** 盤上のセルクリック時のコールバック関数　clicked() ********************/
	function clicked(e) {
		/*-- もし黒の番じゃなかったら --*/
		if (!myTurn) {   // PC考え中
			return;
		}
		/*-- 変数定義 --*/
		var id = e.target.id;
		var i = parseInt(id.charAt(4));
		var j = parseInt(id.charAt(5));

		/*-- (i,j)に黒駒をおいたときに駒を挟めるか確認する関数を変数flippedに代入 --*/
		var flipped = getFlipCells(i, j, BLACK)
		if (flipped.length > 0) {
		for (var k = 0 ; k < flipped.length ; k++) {
			/*-- (i,j)にcolor色の駒を置く関数呼び出し --*/
			put(flipped[k][0], flipped[k][1], BLACK);
		}
		/*-- (i,j)にcolor色の駒を置く関数呼び出し --*/
		put(i, j, BLACK);
		/*-- 関数update()呼び出し --*/
		update();
		}
	}
/*********** 盤上のセルクリック時のコールバック関数　clicked() ********************/


/*********** (i,j)にcolor色の駒を置く関数　put() ******************************/
	function put(i, j, color) {
		/*-- 変数定義 --*/
		var c = document.getElementById("cell" + i + j);
		/*-- 丸 --*/
		c.textContent = "●";
		/*-- 白黒 --*/
		c.className = "cell " + (color == BLACK ? "black" : "white");
		/*-- 二重配列dateに格納 --*/
		data[i][j] = color;
	}
/*********** (i,j)にcolor色の駒を置く関数　put() ******************************/


/*********** コンピュータ思考関数　think() *************************************/
	function think() {
		/*-- 変数を定義 --*/
		var highScore = -1000;
		var px = -1, py = -1;
		/*-- 繰り返し文(8回繰り返す) --*/
		for (var x = 0 ; x < 8 ; x++) {
			/*-- 繰り返し文(8回繰り返す) --*/
			for (var y = 0 ; y < 8 ; y++) {
				/*-- 関数を変数に代入 --*/
				var tmpData = copyData();
				var flipped = getFlipCells(x, y, WHITE);
				if (flipped.length > 0) {
					for (var i = 0 ; i < flipped.length ; i++) {
						var p = flipped[i][0];
						var q = flipped[i][1];
						tmpData[p][q] = WHITE;
						tmpData[x][y] = WHITE;
					}
					/*-- 重み付け関数を変数に代入 --*/
					var score = calcWeightData(tmpData);
					if (score > highScore) {
						highScore = score;
						px = x, py = y;
					}
				}
			}
		}

		if (px >= 0 && py >= 0) {
		/*-- (i,j)に駒をおいたときに駒を挟めるか確認する関数を変数に代入 --*/
		var flipped = getFlipCells(px, py, WHITE)
		if (flipped.length > 0) {
			for (var k = 0 ; k < flipped.length ; k++) {
				/*-- (i,j)にcolor色の駒を置く関数呼び出し --*/
				put(flipped[k][0], flipped[k][1], WHITE);
			}
		}
		/*-- (i,j)にcolor色の駒を置く関数呼び出し --*/
		put(px, py, WHITE);
		} 
		/*-- 関数update()呼び出し --*/
		update();
	}
/*********** コンピュータ思考関数　think() *************************************/


/*********** 重み付け計算関数　calcWeightData() *******************************/
	function calcWeightData(tmpData) {
		var score = 0;
		/*-- 繰り返し文(8回繰り返す) --*/
		for (var x = 0 ; x < 8 ; x++) {
			/*-- 繰り返し文(8回繰り返す) --*/
			for (var y = 0 ; y < 8 ; y++) {
				if (tmpData[x][y] == WHITE) {
					/*-- 重み付け --*/
					score += WeightData[x][y];
				}
			}
		}
		/*-- 処理結果を返す --*/
		return score;
	}
/*********** 重み付け計算関数　calcWeightData()　******************************/


/*********** 駒テーブルデータをコピーする関数　copyData() ************************/
	function copyData() {
		/*-- 配列を定義 --*/
		var tmpData = [];
		/*-- 繰り返し文(8回繰り返す) --*/
		for (var x = 0 ; x < 8 ; x++) {
			tmpData[x] = [];
			/*-- 繰り返し文(8回繰り返す) --*/
			for (var y = 0 ; y < 8 ; y++) {
				tmpData[x][y] = data[x][y];
			}
		}
		/*-- 処理結果を返す --*/
		return tmpData;
	}
/*********** 駒テーブルデータをコピーする関数　copyData() ************************/


/*********** 挟める駒があるか確認する関数　canFlip() ****************************/
	function canFlip(color) {
		/*-- 繰り返し文(8回繰り返す) --*/
		for (var x = 0 ; x < 8 ; x++) {
			/*-- 繰り返し文(8回繰り返す) --*/
			for (var y = 0 ; y < 8 ; y++) {
				/*-- (i,j)に駒をおいたときに駒を挟めるか確認する関数を変数に代入 --*/
				var flipped = getFlipCells(x, y, color);
				if (flipped.length > 0) {
					/*-- trueを返す --*/
					return true;
				}
			}
		}
		/*-- falseを返す --*/
		return false;
	}
/*********** 挟める駒があるか確認する関数 canFlip() ****************************/


/*********** (i,j)に駒をおいたときに駒を挟めるか確認する関数 getFlipCells() *******/
	function getFlipCells(i, j, color) {
		/*-- すでに駒がある場合 --*/
		if (data[i][j] == BLACK || data[i][j] == WHITE) { 
			return [];
		}

		/*-- 相手を挟めるか、左上、上、右上、左、右、左下、下、右下と順番に調査 --*/
		/*-- 二重配列の定義 --*/
		var dirs = [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
		/*-- 配列の定義 --*/
		var result = [];
		for (var p = 0 ; p < dirs.length ; p++) {
			/*-- (i,j)に駒をおいたときに(dx,dy)方向で駒を挟めるか確認する関数を変数に代入 --*/
			var flipped = getFlipCellsOneDir(i, j, dirs[p][0], dirs[p][1], color);
			/*-- 1 つまたは複数の文字列を連結 --*/
			result = result.concat(flipped)
		}
		/*-- 処理結果を返す --*/
		return result;
	}
/*********** (i,j)に駒をおいたときに駒を挟めるか確認する関数 getFlipCells() *********/


/* (i,j)に駒をおいたときに(dx,dy)方向で駒を挟めるか確認する関数 getFlipCellsOneDir() */
	function getFlipCellsOneDir(i, j, dx, dy, color) {
		/*-- 変数の定義 --*/
		var x = i + dx;
		var y = j + dy;
		/*-- 配列の定義 --*/
		var fliped = [];

		if (x < 0 || y < 0 || x > 7 || y > 7 ||
			data[x][y] == color || data[x][y] == 0) {
			/*-- 盤外、同色、空ならfalse --*/
			return [];
		}
		/*-- 配列に追加 --*/
		fliped.push([x, y]);

		/*-- trueならば繰り返す --*/
		while (true) {
			x += dx;
			y += dy;
			if (x < 0 || y < 0 || x > 7 || y > 7 || data[x][y] == 0) {
				/*-- 盤外、空ならfalse --*/
				return [];
			}
			/*-- 挟めた場合 --*/
			if (data[x][y] == color) {
				return fliped;
			} else {
				fliped.push([x, y]);
			}
		}
	}
/* (i,j)に駒をおいたときに(dx,dy)方向で駒を挟めるか確認する関数 getFlipCellsOneDir() */
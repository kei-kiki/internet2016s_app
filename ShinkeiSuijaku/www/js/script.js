        "use strict";
        // カード情報を保持している配列のデータシャッフル関数
        Array.prototype.shuffle = function () {
            var i = this.length;
            while (i) {
                var j = Math.floor(Math.random() * i);
                var t = this[--i];
                this[i] = this[j];
                this[j] = t;
            }
            return this;
        }

        // 広域変数
        var timer = NaN/*ゲーム時間*/, score = 0/*点数*/, flipTimer/*カードを裏に戻すときに使用*/, prevCard/*１枚目のカードデータ*/, startTime/*開始時間*/;

        // 初期化関数(プログラムのはじめに１度だけ呼ばれる)
        function init() {
            //テーブル
            var table = document.getElementById("table");
            
            //カード情報保持用の配列
            var cards = [];
            //カード配列に１０種類の数字を２つずつ追加する(神経衰弱なので、各数字２枚ずつ)
            for (var i = 1 ; i <= 10 ; i++) {
                cards.push([i,'c']);//c=クローバ
                cards.push([i,'s']);//s=スペード
                //上記の場合、cards[x][0]にカードの値が保存されcards[x][1]にカードのスーツが保存される
            }
            //カード配列のシャッフル
            cards.shuffle();

            //テーブルに行と列を追加(10種類の数字*2枚ずつなため、行列合計20(=4*5))
            for (var i = 0 ; i < 4 ; i++) {
                var tr = document.createElement("tr");//テーブルの横列を作成
                for (var j = 0 ; j < 5 ; j++) {
                    var td = document.createElement("td");//セル(縦列)を作成
                    //クラス名を変更
                    td.className = "back";//クラスをbackに指定(裏)
                    //i,jを使いカード配列のindexを指定し保存されているデータを各セルに保持させる
                    td.number = cards[i*5+j][0];//二重ループのi,jを使ってindexを1次元化(i*5+j)
                    td.suit = cards[i*5+j][1];
                    td.onclick = flip;//クリック時にflipを呼ぶ
                    tr.appendChild(td);//作成されたセルをtrにアペンド
                }
                table.appendChild(tr);//作成されたtrをテーブルにアペンド
            }

            startTime = new Date();//開始時間の保存
            timer = setInterval(tick, 1000);//以後、一秒おきにtickを呼び出す
        }

        // 経過時間計測用タイマー
        function tick() {
            var now = new Date();//今の時間を保存
            var elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);//今の時間を開始時間から引くことで経過時間を算出
            document.getElementById("time").textContent = elapsed;//html上の時間を上書き
        }
        
        //カードのスーツ,値に対応するイメージのパスをリターンする関数
        function setImage(suit, num){//引数はカードのスーツと値
            var ImgPath = "img/";//全イメージに共通するパス(全ての画像はimgファイルの下にある)
            if(suit=='c'){//スーツがクローバならば
                ImgPath += "c"+num+".png";//スーツ、値に対応した画像のパスをImgPathに追加
            }
            
            else if(suit=='s'){//スーツがスペードならば
                ImgPath += "c"+num+".png";//スーツ、値に対応した画像のパスをImgPathに追加
            }
            ImgPath = "url('"+ImgPath+"')";//背景画像を変更するときの仕様でパスをurl('')の中に入れる
            return ImgPath;//戻り値としてImgPathを返す
        }

        // カード裏返し
        function flip(e/*イベント*/) {
            var src = e.srcElement || e.target;//イベント(この場合はOnclick)が発生したオブジェクト/エレメント(この場合はカード情報を保持させているテーブルのセル)を取得
            if (flipTimer || src.textContent != "") {
                return;
            }

            var num = src.number;//カード(セル)の値を保存
            var suit = src.suit;//カード(セル)のスーツを保存
            src.className = "card";//クラスをcardに変更(表)
            src.style.backgroundImage = setImage(suit, num);//setImageはスーツ,値に対応したイメージのパスを返す
            src.number = num;
            var snd = new Audio("sound/flip.mp3"); //音声データの取得
            snd.play();//音声データを流す
 
            // １枚目が未だめくられていない時
            if (prevCard == null) {//prevCardがnullの場合(データがなにもない場合)
                prevCard = src;//prevCardにsrcと同じデータを保持させる(srcにはclassName,backgroundImage,numberが保持されている)
                return;
                //１枚目をprevCardに保持させる理由としては、２枚目が選ばれた場合に１枚目に選んだカードと比較しなければいけないから
            }

            // 1枚目の値(prevCard.number)が２枚目の値(num)と同じだった場合
            if (prevCard.number == num) {
                var correct = new Audio("sound/correct.mp3");//音声データの取得
                correct.play();//音声データを流す
                if (++score == 10) {//加点後、１０点(終了)か判断
                    var end = new Audio("sound/end.mp3");//音声データの取得
                    end.play();//音声データを流す
                    document.getElementById("TimeLabel").textContent = "クリア時間";//クリア後に”経過時間”を”クリア時間”に変更
                    clearInterval(timer);//timerをストップ
                }
                prevCard = null;//保持してたデータを破棄(prevCardを空に)
                document.getElementById("score").textContent = score;//html上の点数を上書き
                clearTimeout(flipTimer);
            } else {//２枚が同じ値を持っていない場合
                var wrong = new Audio("sound/wrong.mp3"); //音声データの取得
                wrong.play();//音声データを流す
                flipTimer = setTimeout(function () {
                    src.className = "back";//２枚目に表にしたカードを裏にする
                    src.style.backgroundImage = "url('img/back.png')";//2枚目のカードの背景画像を裏面に戻す
                    prevCard.className = "back";//１枚目に表にしたカードを裏にする
                    prevCard.style.backgroundImage  = "url('img/back.png')";//1枚目のカードの背景画像を裏面に戻す
                    prevCard = null;//保持してたデータを破棄(prevCardを空に)
                    flipTimer = NaN;//flipTimerも同様にデータを破棄
                }, 1000);//１秒後に上記にプログラムを実行
            }
        }

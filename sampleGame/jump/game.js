//おにぎりエンジンの読み込み（キャンバスサイズも設定）
OnigiriEngine(700,700);

//ウインドウの読み込みが終わったら処理開始
window.onload	= function(){
	//キャンバスサイズを自動で拡縮する
	onien.autoScale	= true;
	
	//キャンバスを自動でセンター寄せにする
	onien.setCenter	= true;
	
	//fpsの設定
	onien.fps		= 30;
	
	//使う画像・音声ファイルを全てリストアップ
	onien.assetList	= ["img/back.png","img/chip.png","se/good.mp3","se/good.ogg","se/bad.mp3","se/bad.ogg"];
	
	//画像・音声ファイルの読み込みを開始する
	onien.load();
	
	//画像・音声ファイルの読み込みが終わったら処理開始
	onien.canvas.addEventListener("onienLoadFinish",function(){
		
		//--- ゲーム変数（グローバル変数）を用意する
		gamedata			= {};
		gamedata.gamestart	= false;	//ゲームがスタートしているか否か
		gamedata.score		= 0;		//スコア
		gamedata.time		= 30;		//残り時間
		gamedata.run		= true;		//プレイヤーが元気に走れるか否か
		gamedata.canfly		= true;		//プレイヤーがジャンプできるか否か
		gamedata.my			= 0;		//プレイヤーのyの移動量
		gamedata.stopcount	= 0;		//プレイヤーの操作不能残りフレーム
		
		//--- ★レイヤーの設置
		//--- 背景レイヤー を用意する
		var baselayer	= new OeLayer("baselayer");
		baselayer.nonEvent	= true;
		baselayer.addLayer();
		
		//--- スタート画面等用のレイヤー を用意する
		var startlayer	= new OeLayer("startlayer");
		startlayer.addLayer();
		
		//--- キャラクター・アイテム等用のレイヤー を用意する
		var layer1		= new OeLayer("layer1");
		layer1.nonEvent	= true;
		layer1.visible	= false;
		layer1.addLayer();
		
		//--- 得点等やUI用のレイヤー を用意する
		var uilayer		= new OeLayer("uilayer");
		uilayer.visible	= false;
		uilayer.addLayer();
		
		//--- ★画像の設置
		//--- 背景画像 を用意する
		//--------- 一時キャンバスに背景を描画していく
		var tmp			= new OeTmpCanvas(1400,700);
		//--------- 空を描画する
		tmp.draw("img/back.png",0,0,700,700,0,0);
		tmp.draw("img/back.png",0,0,700,700,700,0);
		//--------- 地面を描画していく
		for(var i=0; i<2; i++){
			for(var j=0; j<20; j++){
				tmp.draw("img/chip.png",140+i*70,70,70,70,j*70,560+i*70);
			}
		}
		//--------- 背景画像をレイヤーに追加する
		var baseimg		= new OeSprite(tmp.canvas,0,0,1400,700,0);
		baseimg.add("baselayer");
		
		//--- プレイヤーキャラ を用意する
		var player		= new OeSprite("img/chip.png",20,490,70,70,0);
		player.col		= [33,55,16,51,9,41,19,21,33,13,45,21,54,35,53,50];
		player.add("layer1");
		
		//--- ★テキスト・ボタンの設置
		//--- スタートボタン を用意する
		var startbutton	= new OeText("スタート",200,330);
		startbutton.w			= 300;
		startbutton.h			= 80;
		startbutton.back		= "white";
		startbutton.size		= 50;
		startbutton.paddingLeft	= 50;
		startbutton.paddingTop	= 15;
		startbutton.add("startlayer");
		
		//--- 得点テキスト を用意する
		var scoretext		= new OeText("SCORE:"+gamedata.score,10,10);
		scoretext.nonEvent	= true;
		scoretext.add("uilayer");
		
		//--- 残り時間テキスト を用意する
		var timetext		= new OeText("TIME:"+gamedata.time,580,10);
		timetext.nonEvent	= true;
		timetext.add("uilayer");
		
		//--- ★イベントの設定
		//--- キャラクター等用のレイヤー のイベントを設定する
		layer1.enterframe	= function(){
			//ゲームがスタートしていれば処理を実行する
			if(gamedata.gamestart){
				if(onien.frame%8 == 0){
					//アイテムを発生させる
					if(Math.floor(Math.random()*100)>70 && gamedata.time >= 6){
						//ハート を作成して設置する
						var y			= Math.floor(Math.random()*350)+70;
						var item		= new OeSprite("img/chip.png",700,y,70,70,4);
						item.col		= [36,60,11,47,5,25,18,11,35,22,50,10,63,22,57,46];
						
						//ハート のイベントを設定する
						item.enterframe	= function(){
							if(gamedata.gamestart){
								//プレイヤーと接触したら消してスコアアップ
								if(item.colCheck(player) && gamedata.run){
									item.del();
									onien.se.start("se/good");
									gamedata.score	+= 10;
									scoretext.text	= "SCORE:" + gamedata.score;
								}
								//画面から消えたらdelしておく
								if(item.x<-70){
									item.del();
								}
								//ハート を左にスクロールする
								item.x	-= 5;
							}
						}
						//ハート をレイヤーに追加
						item.add("layer1");
						
					}else if(Math.floor(Math.random()*100)<10 && gamedata.time >= 6){
						//うんち を発生させる
						var y			= Math.floor(Math.random()*350)+70;
						var unun		= new OeSprite("img/chip.png",700,y,70,70,5);
						unun.col		= [32,62,15,60,6,47,16,37,14,29,28,22,31,15,41,8,42,22,52,32,49,39,58,51,48,63];
						
						//うんち のイベントを設定する
						unun.enterframe	= function(){
							if(gamedata.gamestart){
								//プレイヤーと接触したら消してスコアダウン
								//さらにプレイヤーの元気なくして操作不能に
								if(unun.colCheck(player)){
									unun.del();
									onien.se.start("se/bad");
									gamedata.score	-= 10;
									scoretext.text	= "SCORE:"+gamedata.score;
									gamedata.run	= false;
									gamedata.stopcount	= 30;
								}
								//画面から消えたらdelしておく
								if(unun.x<-70){
									unun.del();
								}
								//うんち を左にスクロールする
								unun.x	-= 5;
							}
						}
						//うんち をレイヤーに追加
						unun.add("layer1");
					}		 
							 
				}
			}
		}
		
		//--- UI用のレイヤー のイベントを設定する
		uilayer.mousedown	= function(){
			//ゲームがスタートしていれば処理を実行する
			if(gamedata.gamestart){
				if(gamedata.canfly && gamedata.run){
					//プレイヤーが元気で、ジャンプできるならジャンプする
					gamedata.my	= -16;
				}
			}
		}
		
		uilayer.mouseup		= function(){
			//ゲームがスタートしていれば処理を実行する
			if(gamedata.gamestart){
				gamedata.my	= 16;
			}
		}
		
		//--- 背景画像 のイベントを設定する
		baseimg.enterframe	= function(){
			//ゲームがスタートしていれば処理を実行する
			if(gamedata.gamestart){
				//背景画像が左へスクロールする処理
				baseimg.x	-= 4;
				if(baseimg.x <= -700){baseimg.x = 0;}
			}
		}
		
		//--- プレイヤーキャラ を設定する
		player.enterframe	= function(){
			//ゲームがスタートしていれば処理を実行する
			if(gamedata.gamestart){
				if(gamedata.run && gamedata.my == 0){
					//プレイヤーが元気で、地面にいる場合は、走るモーションをする
					if(this.coma == 0 && onien.frame%3 == 0){
						this.coma	= 1;
					}else if(onien.frame%3 == 0){
						this.coma	= 0;
					}
				}else if(gamedata.run){
					//プレイヤーが元気で、地面にいない場合は、ジャンプ中の画像にする
					this.coma		= 2;
				}else{
					//プレイヤーが元気じゃない場合は操作不能（点滅状態）
					//操作不能の残り時間カウント開始
					this.coma		= 3;
					gamedata.stopcount--;
					
					if(gamedata.stopcount%3 == 0){
						this.opacity	= 0.9;
					}
					if(gamedata.stopcount%3 == 1){
						this.opacity	= 0.5;
					}
					if(gamedata.stopcount <= 0){
						gamedata.run	= true;
						gamedata.stopcount	= 0;
						this.opacity	= 1;
					}
				}
				
				//ジャンプ処理
				if(gamedata.canfly && gamedata.my < 0){
					//ジャンプで上に移動している間の処理
					this.y	+= gamedata.my;
				}
				if(gamedata.my > 0){
					//ジャンプで下に移動している間の処理
					this.y	+= gamedata.my;
					gamedata.canfly	= false;
				}
				if(this.y <= 70){
					//天上に達したら下に移動する
					gamedata.my		= 16;
					gamedata.canfly	= false;
				}
				if(this.y >= 490){
					//地面に着いたら停止
					gamedata.my		= 0;
					this.y			= 490;
					gamedata.canfly	= true;
				}
				
			}
		}
		
		//--- スタートボタン のイベントを設定する
		startbutton.mousedown	= function(){
			startbutton.back	= "gray";
		}
		
		startbutton.mouseleave	= function(){
			startbutton.back	= "white";
		}
		
		startbutton.mouseup		= function(){
			startbutton.back	= "white";
			
			//ゲーム変数の初期化
			gamedata.score		= 0;
			gamedata.time		= 30;
			gamedata.run		= true;
			gamedata.canfly		= true;
			gamedata.my			= 0;
			scoretext.text		= "SCORE:"+gamedata.score;
			timetext.text		= "TIME:"+gamedata.time;
			
			//ゲームのスタート処理をする
			startlayer.visible	= false;	//スタート画面を隠す
			layer1.visible		= true;		//キャラクター等用レイヤーを表示する
			uilayer.visible		= true;		//得点などやUI用のレイヤーを表示する
			gamedata.gamestart	= true;		//ゲーム本編スタート
		}
		
		//--- 残り時間テキスト のイベントを設定する
		timetext.enterframe		= function(){
			//ゲームがスタートしていれば処理を実行する
			if(gamedata.gamestart){
				//１秒ごとに残り時間を１減らしていく
				if(onien.frame%onien.fps == 0){
					gamedata.time--;
					timetext.text	= "TIME:" + gamedata.time;
					
					//残り時間が無くなったらゲーム終了処理
					if(gamedata.time <= 0){
						gamedata.gamestart	= false;
						startbutton.text	= "もう１回";
						startlayer.visible	= true;
						
					}
				}
			}
		}
		
		//★★★ゲーム起動★★★
		onien.start();
	});
};
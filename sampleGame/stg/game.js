//おにぎりエンジンの読み込み（キャンバスサイズも設定）
OnigiriEngine(700,700);

//ウインドウの読み込みが終わったら処理開始
window.onload	= function(){
	//キャンバスサイズを自動で拡縮するならtrue、しないならfalse
	onien.autoScale	= true;
	
	//キャンバスを自動でセンター寄せにするならtrue、しないならfalse
	onien.setCenter	= true;
	
	//fpsの設定
	onien.fps		= 30;
	
	//使う画像・音声ファイルを全てリストアップ
	onien.assetList	= ["img/back.png","img/chip.png","img/shot.png","img/boss.png"];
	
	//画像・音声ファイルの読み込みを開始する
	onien.load();
	
	//画像・音声ファイルの読み込みが終わったら処理開始
	onien.canvas.addEventListener("onienLoadFinish",function(){
		
		//--- ゲーム変数（グローバル変数）を用意する
		gamedata			= {};
		gamedata.gamestart	= false;	// ゲームがスタートしているか否か
		gamedata.life		= 3;		// プレイヤーのライフ
		gamedata.mx			= 0;		// プレイヤーのxの移動量
		gamedata.my			= 0;		// プレイヤーのyの移動量
		gamedata.move		= false;	// プレイヤーが移動中か否か
		gamedata.cx			= null;		// クリック位置x
		gamedata.cy			= null;		// クリック位置y
		gamedata.time		= 0;		// ゲームがスタートしてからの時間
		gamedata.nodamage	= null;		// プレイヤーの無敵時間
		gamedata.enemys		= {};		// 敵のスプライトを収納する連想配列
		gamedata.lifes		= [];		// プレイヤーのライフのスプライトを収納する配列
		
		//--- ゲーム変数に、敵を作る機能を追加する
		gamedata.MakeEnemy	= function(type,x,y){
			// 敵を作成する
			var enemy			= new OeSprite("img/chip.png",x,y,70,70,type);
			
			// 敵が消滅する時のカウント用の変数
			enemy.delcount		= 99;
			
			// typeによってコリジョン設定を変える
			if(type==2){
				enemy.col		= [31,63,11,52,5,27,22,11,45,7,61,23,61,43,54,57];
			}else{
				enemy.col		= [47,62,18,64,18,54,9,40,11,18,36,8,56,20,62,42,51,51];
			}
			
			// 敵にイベントを設定する
			enemy.enterframe	= function(){
				// 見た目によって動きを変える
				if(this.coma == 2){
					this.y		+= 4;
				}else{
					this.y		+= 4;
					if(this.x > player.x){
						this.x	-= 4;
					}else{
						this.x	+= 4;
					}
				}
				
				// 画面外に出たら消える
				if(this.x > 770 || this.x < -70 || this.y > 770 || this.y < -70){
					this.del();
					delete gamedata.enemys[this.id];
				}
				
				// 消滅カウントが3以下になっていれば消滅カウント開始
				if(this.delcount <= 3){
					// 消滅カウントしていく
					this.delcount--;
					// 見た目を爆発画像に
					this.coma	= 5;
					// カウント0で消滅する
					if(this.delcount == 0){
						this.del();
						delete gamedata.enemys[i];
					}
				}
				
				// 敵のショットを出す
				if(onien.frame%20 == 0){
					// 敵のショットを生成する
					var enemyshot	= new OeSprite("img/shot.png",this.x+27,this.y+70,16,16,2);
					enemyshot.col	= [5,1,5,14,11,14,11,1];
					// 敵のショットのイベントを設定
					enemyshot.enterframe	= function(){
						// 下へ動いていく
						this.y	+= 8;
						// プレイヤーと接触したら…
						if(this.colCheck(player) || player.colCheck(this)){
							// プレイヤーが無敵状態じゃなければ…
							if(gamedata.nodamage == null){
								// ショットを削除して
								this.del();
								// プレイヤーの無敵状態を設定して
								gamedata.nodamage	= 30;
								// プレイヤーのライフを減らす
								gamedata.life--;
								gamedata.lifes[gamedata.life].del();
								// プレイヤーのライフがゼロならゲームオーバー処理
								if(gamedata.life <= 0){
									gamedata.gamestart	= false;
									
									// ゲームオーバーテキストの表示
									var cleartext	= new OeText("GAME OVER ...",150,200);
									cleartext.color	= "white";
									cleartext.size	= 60;
									cleartext.add("uilayer");
								}
							}
							
						}
					}
					// 敵のショットをレイヤーに追加する
					enemyshot.add("layer1");
				}
				
			}
			
			return enemy;
		}
		
		//--- ★レイヤーの設置
		//--- 背景レイヤー を用意する
		var baselayer		= new OeLayer("baselayer");
		baselayer.nonEvent	= false;
		baselayer.addLayer();
		
		//--- スタート画面等用のレイヤー を用意する
		var startlayer	= new OeLayer("startlayer");
		startlayer.addLayer();
		
		//--- キャラクター等用のレイヤー を用意する
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
		var tmp				= new OeTmpCanvas(700,1400);
		tmp.draw("img/back.png",0,0,700,700,0,0);
		tmp.draw("img/back.png",0,0,700,700,0,700);
		
		//--------- 背景画像をレイヤーに追加する
		var baseimg			= new OeSprite(tmp.canvas,0,-700);
		baseimg.add("baselayer");
		
		//--- プレイヤーキャラ を用意する
		var player			= new OeSprite("img/chip.png",315,600,70,70,0);
		player.col			= [50,52,19,51,7,37,32,8,58,36];
		player.add("layer1");
		
		//--- ライフ表示を用意する
		for(var i=0; i<gamedata.life; i++){
			var heart		= new OeSprite("img/chip.png",i*70+10,10,70,70,4);
			gamedata.lifes[i]	= heart;
			gamedata.lifes[i].add("uilayer");
		}
		
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
		
		//--- ★イベントの設定
		//--- キャラクター等用のレイヤー のイベントを設定する
		layer1.enterframe	= function(){
			//ゲームがスタートしていなければ処理しない
			if(!gamedata.gamestart){return;}
			
			//時間を進める
			gamedata.time++;
			
			//時間によって敵を発生させる
			if(gamedata.time == 10){
				var enemy	= gamedata.MakeEnemy(3,50,-70);
				enemy.add("layer1");
				gamedata.enemys[enemy.id]	= enemy;
			}
			
			if(gamedata.time == 25){
				var enemy	= gamedata.MakeEnemy(3,600,-70);
				enemy.add("layer1");
				gamedata.enemys[enemy.id]	= enemy;
			}
			
			if(gamedata.time == 100){
				var enemy	= gamedata.MakeEnemy(2,100,-70);
				enemy.add("layer1");
				gamedata.enemys[enemy.id]	= enemy;
				
				var enemy	= gamedata.MakeEnemy(2,200,-70);
				enemy.add("layer1");
				gamedata.enemys[enemy.id]	= enemy;
				
				var enemy	= gamedata.MakeEnemy(2,300,-70);
				enemy.add("layer1");
				gamedata.enemys[enemy.id]	= enemy;
				
				var enemy	= gamedata.MakeEnemy(2,400,-70);
				enemy.add("layer1");
				gamedata.enemys[enemy.id]	= enemy;
				
				var enemy	= gamedata.MakeEnemy(2,500,-70);
				enemy.add("layer1");
				gamedata.enemys[enemy.id]	= enemy;
			}
			
			// 時間になったらボスを発生させる
			if(gamedata.time == 300){
				// ボスの画像などの用意
				var boss	= new OeSprite("img/boss.png",250,-140,210,140,0);
				boss.mx			= 4;	// ボスの移動量
				boss.life		= 15;	// ボスのライフ
				boss.delcount	= 999;	// 無敵状態カウント
				boss.col		= [15,86,4,102,4,123,16,112,23,125,40,113,51,125,67,110,89,129,114,112,129,127,150,113,167,126,187,113,197,125,202,100,189,86,173,42,142,22,102,14,60,25,29,46];
				// ボスのイベントの設定をする
				boss.enterframe	= function(){
					// まずは下に移動していき
					if(boss.y <= 80){
						boss.y	+= 4;
					}
					// ある程度下に移動したら横移動を繰り返す
					if(boss.y > 80){
						// 無敵状態カウントを設定する
						if(boss.delcount == 999){boss.delcount	= 99;}
						
						// 縦の位置は固定
						boss.y	= 80;
						
						// 横移動を繰り返す処理
						if(boss.x >= 400 && boss.mx > 0){
							boss.mx	= -4;
						}
						if(boss.x <= 100 && boss.mx < 0){
							boss.mx	= 4;
						}
						
						// 移動を実行
						boss.x	+= boss.mx;
					}
					// ボスに攻撃が当たったら（無敵状態カウントが始まったら）
					if(boss.delcount <= 3){
						// 無敵状態カウントを減らしていき、見た目は半透明にする
						boss.delcount--;
						boss.opacity	= 0.5;
						
						// 無敵状態カウントが終わったら
						if(boss.delcount == 0){
							// 無敵状態カウントをリセットし、見た目は不透明に
							boss.delcount	= 99;
							boss.opacity	= 1;
							// ライフを減らす
							boss.life--;
							// ライフがゼロになったら
							if(boss.life <= 0){
								// ボス消滅
								boss.del();
								delete gamedata.enemys["boss"];
								
								// ゲームクリア処理
								gamedata.gamestart	= false;
								
								// クリアテキストを表示
								var cleartext	= new OeText("CLEAR!!",150,200);
								cleartext.color	= "white";
								cleartext.size	= 100;
								cleartext.add("uilayer");
								
							}
						}
					}
					
					// 定期的に弾を発射する
					if(onien.frame%20 == 0){
						// ３つ同時に発射する
						for(var i=0; i<3; i++){
							// 弾の画像などの設定をする
							var bossshot	= new OeSprite("img/shot.png",this.x+i*70,this.y+140,16,16,3);
							bossshot.col	= [5,1,5,14,11,14,11,1];
							// 弾のイベント設定を行う
							bossshot.enterframe	= function(){
								// 下に移動していく
								this.y	+= 8;
								// 接触判定を行う
								if(this.colCheck(player) || player.colCheck(this)){
									// プレイヤーが無敵状態じゃなければ
									if(gamedata.nodamage == null){
										// ショットを削除して
										this.del();
										// プレイヤーの無敵状態を設定して
										gamedata.nodamage	= 30;
										// プレイヤーのライフを減らす
										gamedata.life--;
										gamedata.lifes[gamedata.life].del();
										// プレイヤーのライフがゼロならゲームオーバー処理
										if(gamedata.life <= 0){
											gamedata.gamestart	= false;
											
											// ゲームオーバーテキストを表示
											var cleartext	= new OeText("GAME OVER ...",150,200);
											cleartext.color	= "white";
											cleartext.size	= 60;
											cleartext.add("uilayer");
										}
									}
								}
							}
							// 弾をレイヤーに追加する
							bossshot.add("layer1");
						}
					}
				}
				
				// ボスをレイヤーに追加する
				boss.add("layer1");
				gamedata.enemys["boss"]	= boss;
			}
			
		}
		
		//--- UI用のレイヤー のイベントを設定する
		uilayer.mousedown	= function(e,clickX,clickY){
			//ゲームがスタートしていなければ処理しない
			if(!gamedata.gamestart){return;}
			
			//移動フラグ　オン
			gamedata.move	= true;
			
			//クリック位置更新
			gamedata.cx		= clickX;
			gamedata.cy		= clickY;
			
			//プレイヤー移動計算
			if((clickX-player.x) > 16){
				gamedata.mx	= 16;
			}
			if((clickX-player.x) < -16){
				gamedata.mx	= -16;
			}
			if((clickX-player.x) >= -16 && (clickX-player.x) <= 16){
				gamedata.mx	= 0;
			}
			if((clickY-player.y) > 16){
				gamedata.my	= 16;
			}
			if((clickY-player.y) < -16){
				gamedata.my	= -16;
			}
			if((clickY-player.y) >= -16 && (clickY-player.y) <= 16){
				gamedata.my	= 0;
			}
		}
		
		uilayer.mousemove	= function(e,clickX,clickY){
			//ゲームがスタートしていなければ処理しない
			if(!gamedata.gamestart){return;}
			
			//クリック位置更新
			gamedata.cx		= clickX;
			gamedata.cy		= clickY;
			
			//移動フラグがオンの場合に処理をする
			if(gamedata.move){
				//プレイヤー移動計算
				if((clickX-player.x) > 16){
					gamedata.mx	= 16;
				}
				if((clickX-player.x) < -16){
					gamedata.mx	= -16;
				}
				if((clickX-player.x) >= -16 && (clickX-player.x) <= 16){
					gamedata.mx	= 0;
				}
				if((clickY-player.y) > 16){
					gamedata.my	= 16;
				}
				if((clickY-player.y) < -16){
					gamedata.my	= -16;
				}
				if((clickY-player.y) >= -16 && (clickY-player.y) <= 16){
					gamedata.my	= 0;
				}
			}
		}
		
		uilayer.mouseup		= function(e,clickX,clickY){
			//ゲームがスタートしていなければ処理しない
			if(!gamedata.gamestart){return;}
			
			//クリック位置初期化
			gamedata.cx		= null;
			gamedata.cy		= null;
			
			//プレイヤー移動変数初期化
			gamedata.mx		= 0;
			gamedata.my		= 0;
			gamedata.move	= false;
		}
		
		//--- 背景画像 のイベントを設定する
		baseimg.enterframe	= function(){
			//ゲームがスタートしていなければ処理しない
			if(!gamedata.gamestart){return;}
			
			//背景画像がスクロールする処理
			baseimg.y	+= 4;
			if(baseimg.y >= 0){baseimg.y = -700;}
			
		}
		
		//--- プレイヤーキャラ のイベントを設定する
		player.enterframe	= function(){
			//ゲームがスタートしていなければ処理しない
			if(!gamedata.gamestart){return;}
			
			//移動が完了している部分は移動量を0にする
			if(gamedata.mx > 0 && gamedata.cx < player.x){
				gamedata.mx	= 0;
			}
			if(gamedata.mx < 0 && gamedata.cx > player.x){
				gamedata.mx	= 0;
			}
			if(gamedata.my > 0 && gamedata.cy < player.y){
				gamedata.my	= 0;
			}
			if(gamedata.my < 0 && gamedata.cy > player.y){
				gamedata.my	= 0;
			}
			
			//移動する
			if(gamedata.mx!=0 || gamedata.my!=0){
				this.x	+= gamedata.mx;
				this.y	+= gamedata.my;
			}
			
			//アニメーション
			if(onien.frame%3 == 0 && this.coma == 0){
				this.coma	= 1;
			}else if(onien.frame%3 == 0){
				this.coma	= 0;
			}
			
			//ショットする
			if(onien.frame%6 == 0){
				//弾を生成する
				var shot	= new OeSprite("img/shot.png",player.x+27,player.y-16,16,16,0);
				shot.col	= [0,0,0,16,16,16,16,0];
				//弾にイベントを設定する
				shot.enterframe	= function(){
					//上へ移動する
					this.y	-= 8;
					//敵の数だけ接触判定の処理をする
					for(var i in gamedata.enemys){
						//敵とぶつかっていたら（かつ、その敵がまだ生きていたら）
						if(gamedata.enemys[i].colCheck(this) == true && gamedata.enemys[i].delcount == 99){
							//敵を消す
							this.del();
							gamedata.enemys[i].delcount	= 3;
						}
					}
					//画面外に出たら消える
					if(this.y <= -16){
						this.del();
					}
				}
				//弾をレイヤーに追加
				shot.add("layer1");
			}
			
			//無敵状態であるならば
			if(gamedata.nodamage != null){
				//無敵状態の残りカウントを減らす
				gamedata.nodamage--;
				//プレイヤーを点滅させる
				this.opacity	= 0.5;
				if(onien.frame%3 == 0 && this.opacity == 0.5){
					this.opacity	= 0.7;
				}else if (onien.frame%3 == 0){
					this.opacity	= 0.5;
				}
				//無敵状態のカウントが終われば
				if(gamedata.nodamage <= 0){
					//無敵状態を解除
					gamedata.nodamage = null;
					//不透明度を元に戻す
					this.opacity	= 1;
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
			gamedata.time		= 0;
			
			//ゲームのスタート処理をする
			startlayer.visible	= false;	//スタート画面を隠す
			layer1.visible		= true;		//キャラクター等用レイヤーを表示する
			uilayer.visible		= true;		//得点などやUI用のレイヤーを表示する
			gamedata.gamestart	= true;		//ゲーム本編スタート
		}
		
		//ゲーム開始
		onien.start();
	});
};
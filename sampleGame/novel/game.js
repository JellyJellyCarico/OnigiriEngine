//おにぎりエンジンの読み込み（キャンバスサイズも設定）
OnigiriEngine(700,700);

//ウインドウの読み込みが終わったら処理開始
window.onload	= function(){
	//キャンバスサイズを自動で拡縮するならtrue、しないならfalse
	onien.autoScale	= true;
	
	//キャンバスを自動でセンター寄せにするならtrue、しないならfalse
	onien.setCenter	= true;
	
	//fpsの設定
	onien.fps		= 12;
	
	//使う画像・音声ファイルを全てリストアップ
	onien.assetList	= ["img/back1.png","img/back2.png","img/dou.png","img/hidari.png","img/kami_sita.png","img/kami_ue.png","img/kao.png","img/kuti.png","img/me.png","img/migi.png"];
	
	//画像・音声ファイルの読み込みを開始する
	onien.load();
	
	//画像・音声ファイルの読み込みが終わったら処理開始
	onien.canvas.addEventListener("onienLoadFinish",function(){
		//--- ゲーム変数（グローバル変数）の用意
		gamedata		= {};
		gamedata.count	= 0;	// ストーリー進行度
		gamedata.time	= 0;	// 待ち時間カウント
		
		//--- ★レイヤーの設置
		//--- 背景レイヤー を用意する
		var baselayer	= new OeLayer("baselayer");
		baselayer.nonEvent	= true;
		baselayer.addLayer();
		
		//--- キャラクター表示用レイヤー を用意する
		var layer1		= new OeLayer("layer1");
		layer1.nonEvent	= true;
		layer1.addLayer();
		
		//--- 選択肢表示用レイヤー を用意する
		var uilayer		= new OeLayer("uilayer");
		uilayer.visible	= false;
		uilayer.addLayer();
		
		//--- メッセージ表示用レイヤー を用意する
		var meslayer	= new OeLayer("meslayer");
		meslayer.addLayer();
		
		//--- ★画像の設置
		//--- 背景画像 を用意する
		//--------- 一時キャンバスに背景を描画していく
		var tmp			= new OeTmpCanvas(700,1400);
		tmp.draw("img/back1.png",0,0,700,700,0,700);
		tmp.draw("img/back2.png",0,0,700,700,0,0);
		
		//--------- 背景画像をレイヤーに追加する
		var backimg		= new OeSprite(tmp.canvas,0,-700,700,1400,0);
		backimg.add("baselayer");
		
		//--- キャラクターの立ち絵 を用意する
		var chara		= new OePriani("talk","chara1",0,0,true);
		chara.add("layer1");
		
		//--- ★ボタンの設置
		//--- 選択肢ボタン１ を用意する
		var select1		= new OeText("そうなんだ",0,300);
		select1.w		= 250;
		select1.h		= 60;
		select1.back	= "white";
		select1.paddingLeft	= 10;
		select1.paddingTop	= 16;
		select1.add("uilayer");
		
		//--- 選択肢ボタン２ を用意する
		var select2		= new OeText("でも使いにくそう",0,380);
		select2.w		= 250;
		select2.h		= 60;
		select2.back	= "white";
		select2.paddingLeft	= 10;
		select2.paddingTop	= 16;
		select2.add("uilayer");
		
		//--- ★メッセージの設置
		var mes			= new OeMessage(100,500,500,150,"white","▼","big");
		mes.opacity		= 0.9;
		mes.paddingLeft	= 20;
		mes.paddingTop	= 20;
		mes.waitX		= 470;
		mes.waitY		= 120;
		mes.waitSpeed	= 2;
		mes.firstColor	= "pink";
		mes.add("meslayer");
		
		//--- ★イベントの設定
		//--- 選択肢ボタン１ のイベントを設定する
		select1.mousedown	= function(){
			select1.back	= "gray";
		}
		select1.mouseleave	= function(){
			select1.back	= "white";
		}
		select1.mouseup		= function(){
			select1.back	= "white";
			// ゲーム進行度を変更する
			gamedata.count	= 3;
			// メッセージレイヤを表示する
			mes.visible		= true;
		}
		
		//--- 選択肢ボタン２ のイベントを設定する
		select2.mousedown	= function(){
			select2.back	= "gray";
		}
		select2.mouseleave	= function(){
			select2.back	= "white";
		}
		select2.mouseup		= function(){
			select2.back	= "white";
			// ゲーム進行度を変更する
			gamedata.count	= 4;
			// メッセージレイヤを表示する
			mes.visible		= true;
		}
		
		//--- 背景レイヤー のenterframeでゲーム進行する
		baselayer.enterframe	= function(){
			//--- ゲーム進行度0の時
			if(gamedata.count == 0){
				gamedata.count	= 1;	//とりあえず1にしておく
				
				// 表示するテキストを配列で設定
				var text	= ["リッテ/ はじめまして！","リッテ/ メッセージクラスを使うと…","リッテ/ こんなかんじでノベルゲームっぽく/ 作ることもできます！"];
				
				// ページが変更した時のイベント設定
				mes.pagechange	= function(page){
					// ページごとにキャラクターの動作を変更する
					if(page == 1){chara.change("push");}
					if(page == 2){chara.change("happy");}
				}
				// 全ての文章の表示が終わった時のイベント設定
				mes.end			= function(){
					// ゲーム進行度を進めて選択肢を表示する
					gamedata.count	= 2;
					uilayer.visible	= true;
				}
				
				// メッセージレイヤに文章を表示する
				mes.open(text,"select");
			}
			
			//--- ゲーム進行度3の時
			if(gamedata.count == 3){
				gamedata.count	= 1;	//とりあえず1にしておく
				
				// 選択肢を非表示にする
				uilayer.visible	= false;
				
				// キャラクターの動作を変更する
				chara.change("push");
				
				// 表示するテキストを配列で設定
				var text	= ["リッテ/ そうなんです！","リッテ/ でもログとかもないし、/ 結構使いにくい感じなので…","リッテ/ あんまりおすすめしません！"];
				
				// ページが変更した時のイベント設定
				mes.pagechange	= function(page){
					// ページごとにキャラクターの動作を変更する
					if(page == 1){chara.change("talk");}
					if(page == 2){chara.change("push");}
				}
				// 全ての文章の表示が終わった時のイベント設定
				mes.end			= function(){
					// キャラクターの動作を変更して、ゲーム進行度を進める
					chara.change("wait");
					gamedata.count	= 5;
				}
				
				// メッセージレイヤに文章を表示する
				mes.open(text,"end");
			}
			
			//--- ゲーム進行度4の時
			if(gamedata.count == 4){
				gamedata.count	= 1;	//とりあえず1にしておく
				
				// 選択肢を非表示にする
				uilayer.visible	= false;
				
				// キャラクターの動作を変更する
				chara.change("push");
				
				// 表示するテキストを配列で設定
				var text	= ["リッテ/ 大当たりです！！","リッテ/ ログとかもないし、/ 結構使いにくい感じなので…","リッテ/ あんまりおすすめしません！"];
				
				// ページが変更した時のイベント設定
				mes.pagechange	= function(page){
					// ページごとにキャラクターの動作を変更する
					if(page == 1){chara.change("talk");}
					if(page == 2){chara.change("push");}
				}
				// 全ての文章の表示が終わった時のイベント設定
				mes.end			= function(){
					// キャラクターの動作を変更して、ゲーム進行度を進める
					chara.change("wait");
					gamedata.count	= 5;					
				}
				
				// メッセージレイヤに文章を表示する
				mes.open(text,"end");
			}
			
			//--- ゲーム進行度5の時
			if(gamedata.count == 5){
				// 背景を下にスクロール
				backimg.y	+= 20;
				
				// 背景のスクロールが終わったら
				if(backimg.y >= 0){
					backimg.y	= 0;
					
					// ゲーム進行度を進めて、待ち時間を設定する
					gamedata.count	= 6;
					gamedata.time	= 10;
				}
			}
			
			//--- ゲーム進行度6の時
			if(gamedata.count == 6){
				// 待ち時間カウントダウン
				gamedata.time--;
				
				// 待ち時間が終わったら
				if(gamedata.time <= 0){
					gamedata.count	= 1;	//とりあえず1にしておく
					
					// キャラクターの動作を変更する
					chara.change("talk");
					
					// 表示するテキストを配列で設定
					var text	= ["リッテ/ 夜になったので…","リッテ/ そろそろ帰りますね！","リッテ/ またお会いできる日を/ 楽しみにしてます！"];
					
					// ページが変更した時のイベント設定
					mes.pagechange	= function(page){
						if(page == 2){chara.change("happy");}
					}
					// 全ての文章の表示が終わった時のイベント設定
					mes.end			= function(){
						// キャラクターの削除
						chara.del();
					}
					
					// メッセージレイヤに文章を表示する
					mes.open(text,"end");
				}
			}
		}
		
		
		//ゲーム開始
		onien.start();
	});
};
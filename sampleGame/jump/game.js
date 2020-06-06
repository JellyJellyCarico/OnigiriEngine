//おにぎりエンジンの読み込み
OnigiriEngine(700,700);

//変数の設定
MiniGame			= {};
MiniGame.start		= false;	// ゲーム本編がスタートしているか
MiniGame.run		= true;		// 走れるか
MiniGame.my			= 0;		// 上昇下降数値
MiniGame.canfly		= true;		// 飛べるか
MiniGame.score		= 0;		// 点数
MiniGame.time		= 30;		// 制限時間（秒）
MiniGame.highscore	= 0;		// ハイスコア
MiniGame.stopCount	= 0;

//ウインドウの読み込みが終わったら処理開始
window.onload	= function(){
	//自動でキャンバスサイズを拡縮するかの設定
	onien.autoScale	= true;
	
	//使う画像などはここでリストアップ
	onien.assetList	= ["img/back.png","img/chip.png","img/button.png","img/restart.png"];
	
	//アセットの読み込み
	onien.load();
	
	//アセットを読み込み終わったら処理開始
	onien.canvas.addEventListener("onienLoadFinish",function(){
		//---　レイヤーの設置
		var back		= new OeLayer("back");
		back.nonEvent	= true;
		back.addLayer();
		
		var layer1	= new OeLayer("layer1");
		layer1.visible	= false;
		layer1.addLayer();
		
		var ui		= new OeLayer("ui");
		ui.visible	= false;
		ui.addLayer();
		
		var system	= new OeLayer("system");
		system.addLayer();
		
		//---　背景の設置
		var backImg	= [];
		for(var i=0; i<2; i++){
			backImg[i]	= new OeSprite(onien.asset["img/back.png"],i*700,0);
			backImg[i].add("back");
		}
		
		var block	= [];
		for(var y=0; y<3; y++){
			block[y]	= [];
			for(var x=0; x<20; x++){
				var coma	= 6;
				if(y>0){coma = 7;}
				block[y][x]	= new OeSprite(onien.asset["img/chip.png"],x*70,y*70+490,70,70,coma);
				block[y][x].add("back");
			}
		}
		
		back.enterframe	= function(){
			if(!MiniGame.start){return;}
			back.x	-= 5;
			if(back.x <= -700){
				back.x	= 0;
			}
		}
		
		//---　スタート画面・フィニッシュ画面の設置
		var startText		= new OeText("START",180,300);
		startText.size		= "100px";
		startText.nonEvent	= true;
		startText.add("system");
		
		var highText		= new OeText("HIGH SCORE:"+MiniGame.highscore,10,660);
		highText.size		= "30px";
		highText.add("system");
		
		var restartButton	= new OeSprite(onien.asset["img/restart.png"],170,450,360,120,0);
		restartButton.visible	= false;
		restartButton.count		= 0;
		restartButton.mousedown		= function(){
			restartButton.coma		= 1;
		}
		restartButton.mouseup		= function(){
			restartButton.coma		= 0;
			restartButton.visible	= false;
			resultText.visible		= false;
			startText.text			= "START";
		}
		restartButton.mouseleave	= function(){
			restartButton.coma		= 0;
		}
		restartButton.add("system");
		
		var resultText		= new OeText("RESULT:"+MiniGame.score,260,200);
		resultText.size		= "30px";
		resultText.visible	= false;
		resultText.add("system");
		
		system.click	= function(){
			if(!MiniGame.start && startText.text=="START"){
				MiniGame.score	= 0;
				MiniGame.time	= 30;
				scoreText.text	= "SCORE:" + MiniGame.score;
				timeText.text	= "TIME:" + MiniGame.time;
				
				MiniGame.start	= true;
				layer1.visible	= true;
				ui.visible		= true;
				system.visible	= false;
			}
		}
		
		//---　ボタンの設置
		var button	= new OeSprite(onien.asset["img/button.png"],560,560,120,120,0);
		ui.mousedown	= function(){
			if(!MiniGame.start){return;}
			if(MiniGame.canfly && MiniGame.run){
				MiniGame.my	= -16;
			}
			button.coma	= 1;
		}
		ui.mouseup		= function(){
			if(!MiniGame.start){return;}
			MiniGame.my	= 16;
			button.coma	= 0;
		}
		button.add("ui");
		
		//---　得点の設置
		var scoreText	= new OeText("SCORE:0",10,10);
		scoreText.size	= "30px";
		scoreText.add("ui");
		
		//---　残り時間の設置
		var timeText	= new OeText("TIME:"+MiniGame.time,560,10);
		timeText.size	= "30px";
		timeText.enterframe	= function(){
			if(!MiniGame.start){return;}
			if(onien.frame%16 == 0){
				MiniGame.time--;
				timeText.text	= "TIME:" + MiniGame.time;
				if(MiniGame.time <= 0){
					//フィニッシュ処理
					MiniGame.start = false;
					startText.text			= "FINISH";
					system.visible			= true;
					restartButton.visible	= true;
					resultText.text			= "RESULT:" + MiniGame.score;
					if(MiniGame.score > MiniGame.highscore){
						MiniGame.highscore	= MiniGame.score;
						resultText.text		+= "　NEW!";
					}
					highText.text		= "HIGH SCORE:" + MiniGame.highscore;
					resultText.visible		= true;
					
					MiniGame.run		= true;
					MiniGame.my			= 0;
					MiniGame.canfly		= true;
					
					layer1.visible	= false;
					layer1.delAllObject();
					MiniGame.player	= MiniGame.playerSet();
					MiniGame.player.add("layer1");
					
					ui.visible		= false;
					button.coma		= 0;
				}
			}
		}
		timeText.add("ui");
		
		MiniGame.player	= MiniGame.playerSet();
		MiniGame.player.add("layer1");
		
		//---　アイテムの設置
		layer1.enterframe	= function(){
			if(!MiniGame.start){return;}
			if(onien.frame%8==0){
				if(Math.floor(Math.random()*100)>70 && MiniGame.time >= 10){
					var y			= Math.floor(Math.random()*350)+70;
					var item		= new OeSprite(onien.asset["img/chip.png"],700,y,70,70,4);
					item.col		= [36,60,11,47,5,25,18,11,35,22,50,10,63,22,57,46];
					item.enterframe	= function(){
						if(!MiniGame.start){return;}
						if(item.colCheck(MiniGame.player) && MiniGame.run){
							item.del();
							MiniGame.score += 10;
							scoreText.text	= "SCORE:" + MiniGame.score;
						}
						item.x -= 5;
					}
					item.add("layer1");
				}else if(Math.floor(Math.random()*100)<10 && MiniGame.time >= 10){
					var y			= Math.floor(Math.random()*350)+70;
					var unun		= new OeSprite(onien.asset["img/chip.png"],700,y,70,70,5);
					unun.col		= [32,62,15,60,6,47,16,37,14,29,28,22,31,15,41,8,42,22,52,32,49,39,58,51,48,63];
					unun.enterframe	= function(){
						if(!MiniGame.start){return;}
						if(unun.colCheck(MiniGame.player)){
							unun.del();
							MiniGame.score	-= 10;
							scoreText.text	= "SCORE:" + MiniGame.score;
							MiniGame.run	= false;
							MiniGame.stopCount	= 16;
						}
						unun.x	-= 5;
					}
					unun.add("layer1");
				}
			}
		}
		
		//---ゲーム開始
		onien.start();
	});
};

MiniGame.playerSet	= function(){
	var player	= new OeSprite(onien.asset["img/chip.png"],50,420,70,70,0);
	player.col	= [33,55,16,51,9,41,19,21,33,13,45,21,54,35,53,50];
	player.enterframe	= function(){
		if(!MiniGame.start){return;}
		//モーション
		if(MiniGame.run && MiniGame.my==0){
			if(this.coma	== 0 && onien.frame%2 == 0){
				this.coma	= 1;
			}else if(onien.frame%2 == 0){
				this.coma = 0;
			}
		}else if(MiniGame.run){
			this.coma	= 2;
		}else{
			this.coma	= 3;
			MiniGame.stopCount--;
			
			if(MiniGame.stopCount%3 == 0){
				this.opacity	= 0.9;
			}
			if(MiniGame.stopCount%3 == 1){
				this.opacity	= 0.5;
			}
			
			if(MiniGame.stopCount <= 0){
				MiniGame.run		= true;
				MiniGame.stopCount	= 0;
				this.opacity	= 1;
			}
		}
		//ジャンプフラグ
		if(MiniGame.my < 0 && MiniGame.canfly){
			this.y	+= MiniGame.my;
		}
		if(MiniGame.my > 0){
			this.y	+= MiniGame.my;
			MiniGame.canfly		= false;
		}
		if(this.y <= 70){
			MiniGame.my			= 16;
			MiniGame.canfly		= false;
		}
		if(this.y >= 420){
			MiniGame.my			= 0;
			this.y	= 420;
			MiniGame.canfly		= true;
		}
	}
	return player;
}
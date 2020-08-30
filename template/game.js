//おにぎりエンジンの読み込み（キャンバスサイズも設定）
OnigiriEngine(500,500);

//ウインドウの読み込みが終わったら処理開始
window.onload	= function(){
	//キャンバスサイズを自動で拡縮するならtrue、しないならfalse
	onien.autoScale	= true;
	
	//キャンバスを自動でセンター寄せにするならtrue、しないならfalse
	onien.setCenter	= true;
	
	//fpsの設定
	onien.fps		= 16;
	
	//使う画像・音声ファイルを全てリストアップ
	onien.assetList	= ["img/xxx.png","sound/xxx.ogg"];
	
	//画像・音声ファイルの読み込みを開始する
	onien.load();
	
	//画像・音声ファイルの読み込みが終わったら処理開始
	onien.canvas.addEventListener("onienLoadFinish",function(){
		//ここにゲームのモロモロの処理を書いていく
		
		//主な流れとしては
		//　・レイヤー作成してaddLayer！
		//　・スプライトなどを作成してaddでレイヤーに追加！
		//　・スプライトなどにenterframeやclickなどのイベントを追加していく！
		
		//ゲーム開始
		onien.start();
	});
};
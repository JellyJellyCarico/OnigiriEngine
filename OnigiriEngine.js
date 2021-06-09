/*

OnigiriEngine Ver1.1.0c（作業中）

https://jellyjelly.site/onien/
Copyright Carico

*/

function OnigiriEngine(w,h){
	//onienがすでにある時はリセットする
	try{
		if(onien){onien.end();}
	}catch(e){
	}
	
	//onienに関係するもの全部入れるぞ
	onien			= {};
	
	//プラットフォーム情報を判定して代入
	var plat		= navigator.userAgent;
	if(plat.indexOf("iPhone")!=-1 || plat.indexOf("iPad")!=-1 || plat.indexOf("iPod")!=-1){
		onien.platform	= "i";
	}else if(plat.indexOf("Android")!=-1){
		onien.platform	= "android";
	}else if(plat.indexOf("Windows")!=-1){
		onien.platform	= "win";
	}else if(plat.indexOf("Mac")!=-1){
		onien.platform	= "mac";
	}else{
		onien.platform	= "nazo";
	}
	
	//fpsは1秒のうちに何フレーム入れるか。frameは現在のフレーム数
	onien.fps		= 16;
	onien.frame		= 0;
	
	//canvasとcontextを取得
	onien.canvas	= document.getElementById("onigiri_canvas");
	onien.ctx		= onien.canvas.getContext("2d");
	
	//ゲームキャンバスの大きさ
	if(w==null){w=500;}
	if(h==null){h=500;}
	onien.w			= w;
	onien.h			= h;
	
	//自動キャンバスサイズ拡縮調整をするかしないか
	onien.autoScale	= true;
	
	//キャンバスをセンター寄せにするかしないか
	onien.setCenter	= false;
	
	//アセット用の準備
	//assetListに入れたものをload関数で読み込む
	//そんでassetに入れていく。assetSetは読み込んだ数。
	onien.assetList	= [];
	onien.asset		= {};
	onien.assetSet	= 0;
	
	//アセットを読み込み終わったか
	onien.ready		= false;
	
	//レイヤー用の準備
	onien.layer		= {};
	
	//レイヤーにオブジェクトを追加するときに固有のID番号を振るためのカウント
	onien.idcount	= 0;
	
	//BGM再生用
	onien.bgm		= {};
	onien.bgm.buf	= [null,null,null];
	onien.bgm.vol	= 0.5;
	
	//効果音再生用
	onien.se		= {};
	onien.se.buf	= [null,null,null];
	onien.se.vol	= 0.5;
	
	//★BGMを再生する関数（nameには拡張子を除いた音声ファイル名を入れる）
	onien.bgm.start	= function(name,buf){
		var b		= buf?buf:0;
		var audio	= new Audio();
		
		//他のBGMを再生中なら止めてからnullにしておく
		if(onien.bgm.buf[b] != null){
			onien.bgm.buf[b].pause();
			onien.bgm.buf[b].currentTime	= 0;
			onien.bgm.buf[b]				= null;
		}
		
		//再生する
		if(onien.asset[name + ".wav"] && audio.canPlayType("audio/wav")!=""){
			//wavファイルを再生
			onien.bgm.buf[b]		= onien.asset[name + ".wav"];
			onien.bgm.buf[b].volume	= onien.bgm.vol;
			onien.bgm.buf[b].play();
		}else if(onien.asset[name + ".mp3"] && audio.canPlayType("audio/mpeg")!=""){
			//mp3ファイルを再生
			onien.bgm.buf[b]		= onien.asset[name + ".mp3"];
			onien.bgm.buf[b].volume	= onien.bgm.vol;
			onien.bgm.buf[b].play();
		}else if(onien.asset[name + ".ogg"] && audio.canPlayType("audio/ogg")!=""){
			//oggファイルを再生
			onien.bgm.buf[b]		= onien.asset[name + ".ogg"];
			onien.bgm.buf[b].volume	= onien.bgm.vol;
			onien.bgm.buf[b].play();
		}else if(onien.asset[name + ".m4a"] && audio.canPlayType("audio/mp4")!=""){
			//oggファイルを再生
			onien.bgm.buf[b]		= onien.asset[name + ".m4a"];
			onien.bgm.buf[b].volume	= onien.bgm.vol;
			onien.bgm.buf[b].play();
		}
		
		//リピート再生させるためのやつ
		if(onien.bgm.buf[b] != null){
			onien.bgm.buf[b].addEventListener("ended",function(){
				onien.bgm.buf[b].pause();
				onien.bgm.buf[b].currentTime = 0;
				onien.bgm.buf[b].play();
			});
		}
		
	}
	
	//★BGMを停止する関数
	onien.bgm.stop	= function(buf){
		var b	= buf?buf:0;
		onien.bgm.buf[b].pause();
		onien.bgm.buf[b].currentTime	= 0;
		onien.bgm.buf[b]				= null;
	}
	
	//★効果音を再生する関数（nameには拡張子を除いた音声ファイル名を入れる）
	onien.se.start	= function(name,buf){
		var b		= buf?buf:0;
		var audio	= new Audio();
		
		//他の効果音を再生中なら止めてnullにする
		if(onien.se.buf[b] != null){
			onien.se.buf[b].pause();
			onien.se.buf[b].currentTime	= 0;
			onien.se.buf[b]				= null;
		}
		
		//再生する
		if(onien.asset[name + ".wav"] && audio.canPlayType("audio/wav")!=""){
			//wavファイルを再生
			onien.se.buf[b]		= onien.asset[name + ".wav"];
			onien.se.buf[b].volume	= onien.se.vol;
			onien.se.buf[b].play();
		}else if(onien.asset[name + ".mp3"] && audio.canPlayType("audio/mpeg")!=""){
			//wavファイルを再生
			onien.se.buf[b]		= onien.asset[name + ".mp3"];
			onien.se.buf[b].volume	= onien.se.vol;
			onien.se.buf[b].play();
		}else if(onien.asset[name + ".ogg"] && audio.canPlayType("audio/ogg")!=""){
			//wavファイルを再生
			onien.se.buf[b]		= onien.asset[name + ".ogg"];
			onien.se.buf[b].volume	= onien.se.vol;
			onien.se.buf[b].play();
		}else if(onien.asset[name + ".m4a"] && audio.canPlayType("audio/mp4")!=""){
			//wavファイルを再生
			onien.se.buf[b]		= onien.asset[name + ".m4a"];
			onien.se.buf[b].volume	= onien.se.vol;
			onien.se.buf[b].play();
		}
		
		//再生が終わったらnullにしておく
		if(onien.se.buf[b] != null){
			onien.se.buf[b].addEventListener("ended",function(){
				onien.se.buf[b]				= null;
			});
		}
		
	}
	
	//★効果音を停止する関数
	onien.se.stop	= function(buf){
		var b	= buf?buf:0;
		if(onien.se.buf[b] != null){
			try{
				onien.se.buf[b].pause();
				onien.se.buf[b].currentTime	= 0;
			}catch(e){
				
			}
			onien.se.buf[b]				= null;
		}
	}
	
	//★レイヤーを追加する関数
	onien.addLayer	= function(layer){
		onien.layer[layer.name]			= layer;
		
	}
	
	//★スプライトなどを追加する関数
	onien.addObj	= function(ele,layerName){
		ele.layer	= layerName;
		ele.id		= ele.type + "_" + onien.idcount;
		onien.idcount++;
		onien.layer[layerName].content[ele.id]	= ele;
		onien.layer[layerName].sortList.push({"id":ele.id,"y":ele.y});
		//onien.layer[layerName].sortStart();
	}
	
	//★スプライトなどを削除する関数
	onien.delObj	= function(ele){
		try{
			if(ele.type == "P"){
				onien.priani.deletePriani(ele.chara);
			}
			
			var layerName	= ele.layer;
			for(var i in onien.layer[layerName].sortList){
				if(onien.layer[layerName].sortList[i].id == ele.id){
					delete onien.layer[layerName].sortList[i];
				}
			}
			delete onien.layer[layerName].content[ele.id];
			//onien.layer[layerName].sortStart();
		}catch(e){
			console.log("スプライトなど削除時にエラー");
		}
	}
	
	//★レイヤーを削除する関数
	onien.delLayer	= function(layer){
		try{
			delete onien.layer[layer];
		}catch(e){
			console.log("レイヤー削除時にエラー");
		}
	}
	
	//★接触判定（オブジェクトの中心点距離で判定）
	onien.contactCheck	= function(one,obj,distance){
		if(!distance){
			distance	= one.w;
		}
		
		var kekka	= false;
		
		var myLayer	= one.layer;
		var myX		= one.x + onien.layer[myLayer].x;
		var myY		= one.y + onien.layer[myLayer].y;
		var myW		= one.w;
		var myH		= one.h;
		
		myX	= myX + Math.floor(myW/2);
		myY	= myY + Math.floor(myH/2);
		
		var obLayer	= obj.layer;
		var obX		= obj.x + onien.layer[obLayer].x;
		var obY		= obj.y + onien.layer[obLayer].y;
		var obW		= obj.w;
		var obH		= obj.h;
		
		obX	= obX + Math.floor(obW/2);
		obY	= obY + Math.floor(obH/2);
		
		var d	= Math.sqrt((obX-myX)*(obX-myX) + (obY-myY)*(obY-myY));
		
		if(d <= distance){
			kekka = true;
		}
		
		if(one.scale!=1 || obj.scale!=1){
			kekka	= false;
		}
		
		if(one.scaleX!=null || one.scaleY!=null || one.rotate!=null || obj.scaleX!=null || obj.scaleY!=null || obj.rotate!=null){
			kekka	= false;
		}
		
		return kekka;
	}
	
	//★接触判定（コリジョン設定を使用して判定）
	onien.colCheck	= function(one,obj,x,y){
		var kekka	= false;
		
		var xxx	= x?x:one.x;
		var yyy	= y?y:one.y;
		
		if(one.col.length%2 == 0 && obj.col.length%2 == 0){
			var lx	= onien.layer[one.layer].x;
			var ly	= onien.layer[one.layer].y;
			onien.ctx.save();
			
			onien.ctx.beginPath();
			onien.ctx.moveTo(one.col[0]+xxx+lx,one.col[1]+yyy+ly);
			for(var i=2; (i+1)<one.col.length; i+=2){
				onien.ctx.lineTo(one.col[i]+xxx+lx,one.col[i+1]+yyy+ly);
			}
			
			
			var olx	= onien.layer[obj.layer].x;
			var oly	= onien.layer[obj.layer].y;
			
			for(var i=0; (i+1)<obj.col.length; i+=2){
				if(onien.ctx.isPointInPath(obj.col[i]+obj.x+olx,obj.col[i+1]+obj.y+oly)){
					kekka = true;
				}
			}
			
			onien.ctx.closePath();
			//onien.ctx.fill();
			onien.ctx.restore();
		}
		
		if(one.scale!=1 || obj.scale!=1){
			kekka	= false;
		}
		
		if(one.scaleX!=null || one.scaleY!=null || one.rotate!=null || obj.scaleX!=null || obj.scaleY!=null || obj.rotate!=null){
			kekka	= false;
		}
		
		return kekka;
	}
	
	//★assetListを読み込む関数（colorはロード中に表示される「Loading」の文字色）
	onien.load		= function(color,backcolor){
		//キャンバスのサイズを設定
		onien.canvas.width	= onien.w;
		onien.canvas.height	= onien.h;
		
		//自動キャンバス調整がオンの場合
		if(onien.autoScale){
			
			// スマホの場合はサイズを測るものを用意する
			if(onien.platform=="i" || onien.platform=="android"){
				onien.mobimg	= document.createElement("div");
				onien.mobimg.style.position	= "absolute";
				onien.mobimg.style.left		= "0px";
				onien.mobimg.style.top		= "0px";
				onien.mobimg.style.backgroundColor	= "rgba(0,0,0,0)";
				onien.mobimg.style.width	= "100%";
				onien.mobimg.style.height	= "100%";
				onien.mobimg.style.zIndex	= 0;
				onien.canvas.style.zIndex	= 1;
				document.body.appendChild(onien.mobimg);
			}
			
			//キャンバスサイズを自動調整する関数を作る
			onien.setScreen	= function(){
				
				var sW		= innerWidth;
				var sH		= innerHeight;
				
				// スマホ用の設定
				if(onien.platform=="i" || onien.platform=="android"){
					sW		= onien.mobimg.clientWidth;
					sH		= onien.mobimg.clientHeight;
				}
				
				var cW		= onien.w;
				var cH		= onien.h;
				var scale	= 1;
				
				var sP		= sW/sH;
				var cP		= cW/cH;
				
				if(sP > cP){
					scale	= sH/cH;
				}else{
					scale	= sW/cW;
				}
				
				onien.canvas.style.width			= scale * onien.w + "px";
				onien.canvas.style.height			= scale * onien.h + "px";
				
				// センター寄せがオンの場合
				if(onien.setCenter){
					var left = 0;
					if(sW - scale*onien.w > 0){
						left	= (sW - (scale*onien.w))/2;
					}
					
					onien.canvas.style.position	= "absolute";
					onien.canvas.style.left		= left + "px";
				}
				
			}
			
			onien.setScreen();
			
			onien.windowEvent = function(){
				if(onien.autoScale == true){
					onien.setScreen();
				}
			};
			
			//ウィンドウサイズが変わったらそれに合わせる
			window.addEventListener("resize",onien.windowEvent);
			
			//オリエンテーションが変わったらそれに合わせる
			window.addEventListener("orientationchange",onien.windowEvent);
		}
		
		if(onien.assetList.length > 0){
			
			//1つずつ読み込んでいく
			for(var i in onien.assetList){
				//画像ファイルの読み込み処理
				if(onien.assetList[i].indexOf(".png")!=-1 || onien.assetList[i].indexOf(".jpg")!=-1 || onien.assetList[i].indexOf(".gif")!=-1){
					onien.asset[onien.assetList[i]]	= new Image;
					onien.asset[onien.assetList[i]].src	= onien.assetList[i];
					onien.asset[onien.assetList[i]].onload	= function(){
						onien.assetSet++;
					}
				}
				
				//WAVEファイルの読み込み処理
				if(onien.assetList[i].indexOf(".wav")!=-1){
					onien.asset[onien.assetList[i]]	= new Audio();
					var audio	= onien.asset[onien.assetList[i]];
					if(audio.canPlayType("audio/wav")!=""){
						audio.src	= onien.assetList[i];
						audio.load();
						audio.addEventListener("canplaythrough",function(){
							onien.assetSet++;
						});
					}else{
						onien.assetSet++;
					}
				}
				
				//MP3ファイルの読み込み処理
				if(onien.assetList[i].indexOf(".mp3")!=-1){
					onien.asset[onien.assetList[i]]	= new Audio();
					var audio	= onien.asset[onien.assetList[i]];
					if(audio.canPlayType("audio/mpeg")!=""){
						audio.src	= onien.assetList[i];
						audio.load();
						audio.addEventListener("canplaythrough",function(){
							onien.assetSet++;
						});
					}else{
						onien.assetSet++;
					}
				}
				
				//OGGファイルの読み込み処理
				if(onien.assetList[i].indexOf(".ogg")!=-1){
					onien.asset[onien.assetList[i]]	= new Audio();
					var audio	= onien.asset[onien.assetList[i]];
					if(audio.canPlayType("audio/ogg")!=""){
						audio.src	= onien.assetList[i];
						audio.load();
						audio.addEventListener("canplaythrough",function(){
							onien.assetSet++;
						});
					}else{
						onien.assetSet++;
					}
				}
				
				//AACファイルの読み込み処理
				if(onien.assetList[i].indexOf(".m4a")!=-1){
					onien.asset[onien.assetList[i]]	= new Audio();
					var audio	= onien.asset[onien.assetList[i]];
					if(audio.canPlayType("audio/mp4")!=""){
						audio.src	= onien.assetList[i];
						audio.load();
						audio.addEventListener("canplaythrough",function(){
							onien.assetSet++;
						});
					}else{
						onien.assetSet++;
					}
				}
				
			}
			
			//読み込みチェック用タイマーを設置
			onien.loadTimer	= setInterval(function(){
				if(onien.assetList.length == onien.assetSet){
					//読み込み終わったらonienLoadFinishを発火してreadyをtrueに。タイマーは消去。
					onien.loadfinishEvent	= new CustomEvent("onienLoadFinish");
					onien.canvas.dispatchEvent(onien.loadfinishEvent);
					
					onien.ready	= true;
					console.log("Load Finished");
					clearInterval(onien.loadTimer);
					delete onien.loadTimer;
				}else{
					//読み込み中は「Loading...」と表示しておく
					var per		= Math.floor((onien.assetSet/onien.assetList.length)*100);
					console.log("Loading..." + per + "%");
					onien.ctx.clearRect(0,0,onien.w,onien.h);
					onien.ctx.save();
					onien.ctx.fillStyle	= backcolor?backcolor:"black";
					onien.ctx.fillRect(0,0,onien.w,onien.h);
					onien.ctx.font		= "30px sans-serif";
					onien.ctx.fillStyle = color?color:"white";
					onien.ctx.textBaseline	= "top";
					onien.ctx.textAlign		= "center";
					onien.ctx.fillText("Loading..." + per + "%",onien.w/2,onien.h/2);
					onien.ctx.restore();
				}
			},60);
		}
	}
	
	//★ゲームをスタートする（タイマーが動き出す）
	onien.start	= function(){
		//enterframe処理
		var second	= Math.floor(1000/onien.fps);
		onien.enterframeTimer	= setInterval(function(){
			try{
				onien.enterframeFunction();
			}catch(e){
				
			}
		},second);
		
		onien.enterframeFunction = function(){
			if(onien.ready == true){
				//準備が出来ていたら動作開始
				
				//まずは前の画面を消す
				onien.ctx.clearRect(0,0,onien.canvas.width,onien.canvas.height);
				
				//各レイヤーの処理
				for(var i in onien.layer){
					if(onien.layer[i].visible==true){
						//レイヤーが表示ならレイヤー内の描写・操作を行う
						for(var j in onien.layer[i].sortList){
							//sortListの並び順で描画する
							var thisid	= onien.layer[i].sortList[j].id;
							var img		= onien.layer[i].content[thisid];
							//オブジェクトが表示なら描写・操作を行う
							if(img.visible==true){
								//オブジェクトがスプライトなら描画処理
								if(img.type	== "S"){
									if(typeof(img.src) != "object"){
										img.src		= onien.asset[img.src];
									}
									
									var dx		= img.x + onien.layer[i].x;
									var dy		= img.y + onien.layer[i].y;
									var countX	= Math.floor(img.src.width/img.w);
									var countY	= Math.floor(img.src.height/img.h);
									var cx		= img.coma%countX * img.w;
									var cy		= Math.floor(img.coma/countX) * img.h;
									
									var inScreen	= true;
									if(((dx+img.w)<0) || (dx>onien.w) || ((dy+img.h)<0) || (dy>onien.h)) {
										inScreen = false;
									}
									if(img.scaleX!=null || img.scaleY!=null || img.rotate!=null){
										inScreen = true;
									}
									
									if(inScreen){
										onien.ctx.save();
										
										if(img.scaleX!=null || img.scaleY!=null || img.rotate!=null){
											onien.ctx.translate(dx+(img.w/2),dy+(img.h/2));
											if(img.scaleX!=null && img.scaleY!=null){
												onien.ctx.scale(img.scaleX,img.scaleY);
											}else{
												onien.ctx.scale(img.scale,img.scale);
											}
											if(img.rotate!=null){
												onien.ctx.rotate(img.rotate*(Math.PI/180));
											}
											onien.ctx.translate(-(dx+(img.w/2)),-(dy+(img.h/2)));
										}

										onien.ctx.globalAlpha	= img.opacity;

										onien.ctx.drawImage(img.src,cx,cy,img.w,img.h,dx,dy,img.w,img.h);
										onien.ctx.restore();
									}
									
								}
								//オブジェクトがHTMLタグなら
								if(img.type == "H"){
									img.obj.style.visibility = "visible";
									
									if(img.x != null || img.y != null){
										img.obj.style.position = "absolute";
									}
									if(img.x != null){
										if(img.autoPosition == true){
											img.positionSet();
											img.obj.style.left		= img.autoX+"px";
										}else{
											img.obj.style.left		= img.x+"px";
										}
									}
									if(img.y != null){
										if(img.autoPosition == true){
											img.positionSet();
											img.obj.style.top		= img.autoY+"px";
										}else{
											img.obj.style.top		= img.y+"px";
										}
									}
									if(img.w != null || img.autoScale == true){
										if(img.autoScale == true){
											img.scaleSet();
											img.obj.style.width		= img.autoW+"px";
										}else{
											img.obj.style.width		= img.w+"px";
										}
									}
									if(img.h != null || img.autoScale == true){
										if(img.autoScale == true){
											img.scaleSet();
											img.obj.style.height	= img.autoH+"px";
										}else{
											img.obj.style.height	= img.h+"px";
										}
									}
									if(img.fontsize != null || img.autoScale == true){
										if(img.autoScale == true){
											img.scaleSet();
											img.obj.style.fontSize	= img.autoF+"px";
										}else{
											img.obj.style.fontSize	= img.fontsize+"px";
										}
									}
								}
								//オブジェクトがぷりアニなら
								if(img.type == "P"){
									onien.priani.drawPriani(img.chara,img.x,img.y);
								}
								//オブジェクトがテキストなら
								if(img.type == "T"){
									var dx		= img.x + onien.layer[i].x;
									var dy		= img.y + onien.layer[i].y;
									onien.ctx.save();
									
									onien.ctx.globalAlpha = img.opacity;
									
									if(img.back != null){
										onien.ctx.fillStyle		= img.back;
										onien.ctx.fillRect(dx,dy,img.w,img.h);
									}
									
									if(img.src != null){
										if(typeof(img.src) == "object"){
										}else{
											img.src		= onien.asset[img.src];
										}
										onien.ctx.drawImage(img.src,dx,dy,img.w,img.h);
									}
									
									
									if(isNaN(img.size) == false){
										img.size	= img.size + "px";
									}
									
									onien.ctx.fillStyle		= img.color;
									onien.ctx.font			= img.size + " " + img.family;
									onien.ctx.textAlign		= "left";
									onien.ctx.textBaseline	= "top";
									onien.ctx.fillText(img.text,dx+img.paddingLeft,dy+img.paddingTop);
									onien.ctx.restore();
								}
								//オブジェクトがメッセージなら
								if(img.type == "M"){
									var dx		= img.x + onien.layer[i].x;
									var dy		= img.y + onien.layer[i].y;
									onien.ctx.save();
									
									onien.ctx.globalAlpha = img.opacity;
									
									//メッセージ背景描写
									if(img.src != null){
										if(typeof(img.src) == "object"){
										}else{
											img.src		= onien.asset[img.src];
										}
										onien.ctx.drawImage(img.src,dx,dy,img.w,img.h);
									}else{
										onien.ctx.fillStyle		= img.back;
										
										onien.ctx.beginPath();
										onien.ctx.moveTo(dx+img.radius,dy+img.radius);
										onien.ctx.arc(dx+img.radius,dy+img.radius,img.radius,(180*Math.PI/180),(270*Math.PI/180));
										onien.ctx.fill();
										
										onien.ctx.beginPath();
										onien.ctx.moveTo(dx+(img.w-img.radius),dy+img.radius);
										onien.ctx.arc(dx+(img.w-img.radius),dy+img.radius,img.radius,(-90*Math.PI/180),(0*Math.PI/180));
										onien.ctx.fill();
										
										onien.ctx.beginPath();
										onien.ctx.moveTo(dx+(img.w-img.radius),dy+(img.h-img.radius));
										onien.ctx.arc(dx+(img.w-img.radius),dy+(img.h-img.radius),img.radius,(0*Math.PI/180),(90*Math.PI/180));
										onien.ctx.fill();
										
										onien.ctx.beginPath();
										onien.ctx.moveTo(dx+img.radius,dy+(img.h-img.radius));
										onien.ctx.arc(dx+img.radius,dy+(img.h-img.radius),img.radius,(90*Math.PI/180),(180*Math.PI/180));
										onien.ctx.fill();
										
										onien.ctx.fillRect(dx+img.radius,dy,img.w-img.radius*2,img.radius);
										onien.ctx.fillRect(dx+img.radius,dy+img.radius,img.w-img.radius*2,img.h-img.radius*2);
										onien.ctx.fillRect(dx+img.radius,dy+img.radius+(img.h-img.radius*2),img.w-img.radius*2,img.radius);
										onien.ctx.fillRect(dx,dy+img.radius,img.radius,img.h-img.radius*2);
										onien.ctx.fillRect(dx+img.w-img.radius,dy+img.radius,img.radius,img.h-img.radius*2);
										
									}
									
									
									if(isNaN(img.size) == false){
										img.size	= img.size + "px";
									}
									
									onien.ctx.fillStyle		= img.color;
									onien.ctx.font			= img.size + " " + img.family;
									onien.ctx.textAlign		= "left";
									onien.ctx.textBaseline	= "top";
									
									for(var lines=img.text.split(img.newLine), i=0, l=lines.length; l>i; i++){
										var line	= lines[i];
										var addY	= 0;
										if(i){
											addY += img.lineHeight * i;
										}
										if(i==0){
											onien.ctx.fillStyle = img.firstColor;
										}else{
											onien.ctx.fillStyle		= img.color;
										}
										onien.ctx.fillText(line,dx+img.paddingLeft,dy+img.paddingTop+addY);
									}
									
									if(img.wait == true){
										if(onien.frame%img.waitSpeed == 0){
											img.waitCount++;
											if(img.waitCount>3){img.waitCount = 0;}
										}
										onien.ctx.drawImage(img.waitCanvas,img.waitCount*img.waitCanvas.height,0,img.waitCanvas.height,img.waitCanvas.height,dx+img.waitX,dy+img.waitY,img.waitCanvas.height,img.waitCanvas.height);
									}
									
									onien.ctx.restore();
									
									//メッセージ表示用のenterframe実行
									img.mesEnterFrame();
								}
								
								//オブジェクトのenterframe処理
								try{
									if(img.enterframe){
										img.enterframe();
									}
								}catch(e){
									
								}
							}else{
								//オブジェクトがHTMLタグなら
								if(img.type == "H"){
									img.obj.style.visibility = "hidden";
								}
							}
						}
						//レイヤーのenterframe処理
						try{
							onien.layer[i].enterframe();
						}catch(e){
							
						}
					}else{
						//レイヤーが非表示ならHTMLタグを非表示にしておくぞ
						for(var j in onien.layer[i].content){
							var img		= onien.layer[i].content[j];
							if(img.type == "H"){
								img.obj.style.visibility	= "hidden";
							}
						}
					}
				}
				
				//フレームナンバーを増やす
				onien.frame++;
				
			}
		};
		
		//PCかスマホで追加するイベントを変更する
		if(onien.platform != "i" && onien.platform != "android"){
			//PC用の処理
			
			onien.pcEvent = function(e){
				var e		= e;
				var clickX	= e.pageX;
				var clickY	= e.pageY;
				var r		= e.target.getBoundingClientRect();
				var rx		= r.left;
				var ry		= r.top;
				clickX		= clickX - rx;
				clickY		= clickY - ry;
				
				clickX		= Math.floor((onien.w/r.width)*clickX);
				clickY		= Math.floor((onien.h/r.height)*clickY);
				
				if(e.type == "click"){
					onien.eventClickCheck(e,clickX,clickY,"click");
				}
				if(e.type == "mousedown"){
					onien.eventClickCheck(e,clickX,clickY,"mousedown");
				}
				if(e.type == "mouseup"){
					onien.eventClickCheck(e,clickX,clickY,"mouseup");
				}
				if(e.type == "mousemove"){
					onien.eventClickCheck(e,clickX,clickY,"mousemove");
					onien.eventClickCheck(e,clickX,clickY,"mouseleave","canvasleave");
				}
				if(e.type == "mouseleave"){
					onien.eventClickCheck(e,clickX,clickY,"mouseleave","trueleave");
				}
				
			};
			
			//clickイベント追加
			onien.canvas.addEventListener("click",onien.pcEvent);
			
			//mousedownイベント追加
			onien.canvas.addEventListener("mousedown",onien.pcEvent);
			
			//mouseupイベント追加
			onien.canvas.addEventListener("mouseup",onien.pcEvent);
			
			//mousemoveイベント追加
			onien.canvas.addEventListener("mousemove",onien.pcEvent);
			
			//mouseleaveイベント追加
			onien.canvas.addEventListener("mouseleave",onien.pcEvent);
			
		}else{
			//スマホ用の処理
			
			onien.notpcEvent = function(e){
				var e		= e;
				var clickX	= 0;
				var clickY	= 0;
				e.preventDefault();
				try{
					var ob		= e.changedTouches[0];
					var x		= ob.pageX;
					var y		= ob.pageY;
					var r		= ob.target.getBoundingClientRect();
					var rx		= r.left;
					var ry		= r.top;
					x			= x - rx;
					y			= y - ry;
					clickX		= (onien.w/r.width)*x;
					clickY		= (onien.h/r.height)*y;
				}catch(error){
					
				}
				
				var clickX2	= -999;
				var clickY2	= -999;
				try{
					var ob		= e.changedTouches[1];
					var x		= ob.pageX;
					var y		= ob.pageY;
					var r		= ob.target.getBoundingClientRect();
					var rx		= r.left;
					var ry		= r.top;
					x			= x - rx;
					y			= y - ry;
					clickX2		= (onien.w/r.width)*x;
					clickY2		= (onien.h/r.height)*y;
				}catch(error){
					
				}
				
				if(e.type == "touchend"){
					onien.eventClickCheck(e,clickX,clickY,"click",null,0);
					onien.eventClickCheck(e,clickX,clickY,"mouseup",null,0);

					if(clickX2 != -999 && clickY2 != -999){
						onien.eventClickCheck(e,clickX2,clickY2,"click",null,1);
						onien.eventClickCheck(e,clickX2,clickY2,"mouseup",null,1);
					}
				}
				if(e.type == "touchstart"){
					onien.eventClickCheck(e,clickX,clickY,"mousedown",null,0);

					if(clickX2 != -999 && clickY2 != -999){
						onien.eventClickCheck(e,clickX2,clickY2,"mousedown",null,1);
					}
				}
				if(e.type == "touchmove"){
					onien.eventClickCheck(e,clickX,clickY,"mousemove",null,0);
					onien.eventClickCheck(e,clickX,clickY,"mouseleave","canvasleave",0);

					if(clickX2 != -999 && clickY2 != -999){
						onien.eventClickCheck(e,clickX2,clickY2,"mousemove",null,1);
						onien.eventClickCheck(e,clickX2,clickY2,"mouseleave","canvasleave",1);
					}
				}
				
			};
			
			//touchendイベント追加
			onien.canvas.addEventListener("touchend",onien.notpcEvent);
			
			//touchstartイベント追加
			onien.canvas.addEventListener("touchstart",onien.notpcEvent);
			
			//touchmoveイベント追加
			onien.canvas.addEventListener("touchmove",onien.notpcEvent);
			
		}
		
	};
	
	//★ゲームの完全終了処理（タイマー切ってonienを消す）
	onien.end	= function(){
		onien.ready = false;
		
		clearInterval(onien.enterframeTimer);
		
		onien.ctx.clearRect(0,0,onien.w,onien.h);
		
		for(var i in onien.bgm.buf){
			if(onien.bgm.buf[i]!=null){
				onien.bgm.buf[i].pause();
				onien.bgm.buf[i] = null;
			}
		}
		for(var i in onien.se.buf){
			if(onien.se.buf[i]!=null){
				onien.se.buf[i].pause();
				onien.se.buf[i] = null;
			}
		}
		
		window.removeEventListener("resize",onien.windowEvent);
		window.removeEventListener("orientationchange",onien.windowEvent);
		
		onien.canvas.removeEventListener("click",onien.pcEvent);
		onien.canvas.removeEventListener("mousedown",onien.pcEvent);
		onien.canvas.removeEventListener("mouseup",onien.pcEvent);
		onien.canvas.removeEventListener("mousemove",onien.pcEvent);
		onien.canvas.removeEventListener("mouseleave",onien.pcEvent);
		onien.canvas.removeEventListener("touchend",onien.notpcEvent);
		onien.canvas.removeEventListener("touchstart",onien.notpcEvent);
		onien.canvas.removeEventListener("touchmove",onien.notpcEvent);
		
		onien = null;
		dataPriani	= {};
	}
	
	//★クリック系のイベント処理
	onien.eventClickCheck	= function(e,clickX,clickY,mode,mouseleaveMode,touchnum){
		// イベントチェック用の並び替え
		var key = [];
		for(var i in onien.layer){
			key.unshift(i);
		}

		//各レイヤーの処理
		for(var ii=0; ii<key.length; ii++){
			var i = key[ii];
			//イベントをつける場合は各オブジェクトの発火確認
			if(onien.layer[i].nonEvent == false && onien.layer[i].visible == true){
				//イベントの並び順の逆の順でソートして処理していく
				var eventSort = [];
				for(var k in onien.layer[i].sortList){
					eventSort.push(onien.layer[i].sortList[k].id);
				}
				eventSort = eventSort.reverse();
				
				//各オブジェクトの処理
				for(var j in eventSort){
					var thisid	= eventSort[j];
					var obj	= onien.layer[i].content[thisid];
					//イベントをつける場合は発火確認
					if(obj.nonEvent == false){
						//スプライト・ぷりアニの場合
						if(obj.type != "H" && obj.visible == true){
							var objX	= obj.x + onien.layer[obj.layer].x;
							var objY	= obj.y + onien.layer[obj.layer].y;
							
							var objX2	= objX + obj.w;
							var objY2	= objY + obj.h;
							
							//クリック位置に該当オブジェクトがあれば発火
							if(obj[mode] && objX <= clickX && clickX <= objX2 && objY <= clickY && clickY <= objY2 && mode != "mouseleave"){
								try{
									obj[mode](e,clickX,clickY,touchnum);
									break;
								}catch(e){
									
								}
							}
							
							//mouseleaveの場合は該当オブジェクトが無ければ発火
							if(obj[mode] && mode == "mouseleave" && mouseleaveMode == "trueleave"){
								try{
									obj[mode](e,clickX,clickY,touchnum);
								}catch(e){
									
								}
							}
							if(!(objX <= clickX && clickX <= objX2 && objY <= clickY && clickY <= objY2) && obj[mode] && mode == "mouseleave" && mouseleaveMode == "canvasleave"){
								try{
									//console.log("leave")
									obj[mode](e,clickX,clickY,touchnum);
								}catch(e){
									
								}
							}
						}
					}
				}
				//レイヤー自体にも発火確認
				var objX	= onien.layer[i].x;
				var objY	= onien.layer[i].y;
				
				var objX2	= objX + onien.layer[i].w;
				var objY2	= objY + onien.layer[i].h;
				
				//クリック位置に該当レイヤーがあれば発火
				if(objX <= clickX && clickX <= objX2 && objY <= clickY && clickY <= objY2 && onien.layer[i].visible == true && mode != "mouseleave" && onien.layer[i][mode]){
					try{
						onien.layer[i][mode](e,clickX,clickY,touchnum);
					}catch(e){
						
					}
				}
				
				if(onien.layer[i][mode] && mode == "mouseleave" && mouseleaveMode == "trueleave" && onien.layer[i].visible == true){
					try{
						onien.layer[i][mode](e,clickX,clickY,touchnum);
					}catch(e){
						
					}
				}
				
				if(!(objX <= clickX && clickX <= objX2 && objY <= clickY && clickY <= objY2) && onien.layer[i].visible == true && mode == "mouseleave" && mouseleaveMode == "canvasleave" && onien.layer[i][mode]){
					try{
						onien.layer[i][mode](e,clickX,clickY,touchnum);
					}catch(e){
						
					}
				}
						
			}
		}
		
		
	};
	
	//★ぷりアニ機能追加
	onien.priani			= {};
	onien.priani.setting	= function(){
		onien.priani.dataPriani			= dataPriani;
		onien.priani.charaPriani		= {};
		onien.priani.framePriani		= {};
		onien.priani.charaListPriani	= {};
		
	};
	onien.priani.loadPriani	= function(fl,charaName,charaX,charaY,refrain){
		onien.priani.charaListPriani[charaName]	= true;
		onien.priani.charaPriani[charaName]			= {};
		
		var chara	= onien.priani.charaPriani[charaName];
		
		chara.fl		= fl;
		chara.x			= charaX;
		chara.y			= charaY;
		chara.opacity		= [];
		
		if(refrain){
			chara.refrain	= refrain;
		}else{
			chara.refrain	= true;
		}
		chara.data		= {};
		chara.data.id		= onien.priani.dataPriani[fl].id;
		chara.data.dir		= onien.priani.dataPriani[fl].dir;
		chara.data.cvWidth	= onien.priani.dataPriani[fl].cvWidth;
		chara.data.cvHeight	= onien.priani.dataPriani[fl].cvHeight;
		chara.data.src		= [];
		chara.data.x		= [];
		chara.data.y		= [];
		chara.data.aX		= [];
		chara.data.aY		= [];
		chara.data.w		= [];
		chara.data.h		= [];
		chara.data.timeline	= {};
		chara.data.timeline.point	= [];
		chara.data.timeline.pp		= [];
		chara.data.timeline.r		= [];
		chara.data.timeline.sX		= [];
		chara.data.timeline.sY		= [];
		chara.data.timeline.tlX		= [];
		chara.data.timeline.tlY		= [];
		chara.data.timeline.al		= [];
		chara.data.timeline.page	= [];
		for(var sno=0; sno < onien.priani.dataPriani[fl].src.length; sno++){
			chara.data.src[sno]	= onien.priani.dataPriani[fl].src[sno];
			chara.data.x[sno]	= onien.priani.dataPriani[fl].x[sno];
			chara.data.y[sno]	= onien.priani.dataPriani[fl].y[sno];
			chara.data.aX[sno]	= onien.priani.dataPriani[fl].aX[sno];
			chara.data.aY[sno]	= onien.priani.dataPriani[fl].aY[sno];
			chara.data.w[sno]	= onien.priani.dataPriani[fl].w[sno];
			chara.data.h[sno]	= onien.priani.dataPriani[fl].h[sno];
			
			chara.data.timeline.pp[sno]		= [];
			chara.data.timeline.r[sno]		= [];
			chara.data.timeline.sX[sno]		= [];
			chara.data.timeline.sY[sno]		= [];
			chara.data.timeline.tlX[sno]	= [];
			chara.data.timeline.tlY[sno]	= [];
			chara.data.timeline.al[sno]		= [];
			chara.data.timeline.page[sno]	= [];
			
			for(var tno=0; tno < onien.priani.dataPriani[fl].timeline.point.length; tno++){
				chara.data.timeline.point[tno]		= onien.priani.dataPriani[fl].timeline.point[tno];
				chara.data.timeline.pp[sno][tno]	= onien.priani.dataPriani[fl].timeline.pp[sno][tno];
				chara.data.timeline.r[sno][tno]	= onien.priani.dataPriani[fl].timeline.r[sno][tno];
				chara.data.timeline.sX[sno][tno]	= onien.priani.dataPriani[fl].timeline.sX[sno][tno];
				chara.data.timeline.sY[sno][tno]	= onien.priani.dataPriani[fl].timeline.sY[sno][tno];
				chara.data.timeline.tlX[sno][tno]	= onien.priani.dataPriani[fl].timeline.tlX[sno][tno];
				chara.data.timeline.tlY[sno][tno]	= onien.priani.dataPriani[fl].timeline.tlY[sno][tno];
				chara.data.timeline.al[sno][tno]	= onien.priani.dataPriani[fl].timeline.al[sno][tno];
				chara.data.timeline.page[sno][tno]	= onien.priani.dataPriani[fl].timeline.page[sno][tno];
			}
		}
		
		
		onien.priani.framePriani[charaName]	= -1;
	};
	onien.priani.drawPriani	= function(charaName,xxx,yyy){
		var chara		= onien.priani.charaPriani[charaName];
		var fl			= chara.fl;
		var data		= chara.data;
		
		chara.x		= xxx;
		chara.y		= yyy;
		
		onien.priani.framePriani[charaName]++;
		
		if(onien.priani.framePriani[charaName] >= data.timeline.point.length){
			onien.priani.framePriani[charaName]		= 0;
			if(chara.data.timeline.point[0] == 99){
				onien.priani.framePriani[charaName]	= 1;
			}
			if(chara.refrain != true){
				onien.priani.framePriani[charaName]	= data.timeline.point.length - 1;
			}
		}
		
		for(var i=0; i<chara.data.src.length; i++){
			onien.ctx.save();
			
			var r	= chara.data.timeline.r[i][onien.priani.framePriani[charaName]]*Math.PI/180;
			var x	= data.x[i]-(data.w[i]/2) + chara.x;
			var y	= data.y[i]-(data.h[i]/2) + chara.y;
			
			onien.ctx.translate(data.timeline.tlX[i][onien.priani.framePriani[charaName]],data.timeline.tlY[i][onien.priani.framePriani[charaName]]);
			
			onien.ctx.globalAlpha	= data.timeline.al[i][onien.priani.framePriani[charaName]];
			
			onien.ctx.translate(x+data.aX[i],y+data.aY[i]);
			onien.ctx.rotate(r);
			onien.ctx.translate(-(x+data.aX[i]),-(y+data.aY[i]));
			
			onien.ctx.translate(x+data.aX[i],y+data.aY[i]);
			onien.ctx.scale(data.timeline.sX[i][onien.priani.framePriani[charaName]],data.timeline.sY[i][onien.priani.framePriani[charaName]]);
			onien.ctx.translate(-(x+data.aX[i]),-(y+data.aY[i]));
			
			onien.ctx.drawImage(onien.asset[data.dir + "/" + data.src[i]],data.w[i]*data.timeline.page[i][onien.priani.framePriani[charaName]],0,data.w[i],data.h[i],x,y,data.w[i],data.h[i]);
			
			
			
			onien.ctx.restore();
		}
	}
	onien.priani.changePriani	= function(fl,charaName,refrain){
		if(!onien.priani.charaPriani[charaName]){return}
		var charaX		= onien.priani.charaPriani[charaName].x;
		var charaY		= onien.priani.charaPriani[charaName].y;
		var thisFrame	= onien.priani.framePriani[charaName];
		var rrr			= refrain?refrain:true;
		
		onien.priani.loadPriani(fl,charaName,charaX,charaY,rrr);
		
	}
	onien.priani.deletePriani	= function(charaName){
		if(onien.priani.charaPriani[charaName]){
			delete onien.priani.charaPriani[charaName];
			delete onien.priani.framePriani[charaName];
			delete onien.priani.charaListPriani[charaName];
		}
	}
	
	onien.priani.setting();
}

//スプライトクラス
class OeSprite{
	constructor(src,x,y,w,h,coma){
		if(typeof(src) == "object"){
			this.src		= src;
		}else{
			this.src		= onien.asset[src];
		}
		this.x			= x?x:0;
		this.y			= y?y:0;
		this.w			= w?w:src.width;
		this.h			= h?h:src.height;
		this.coma		= coma?coma:0;
		this.visible	= true;
		this.type		= "S";
		this.nonEvent	= false;
		this.col		= [0,0,this.w,0,this.w,this.h,0,this.h];
		this.scale		= 1;
		this.scaleX		= null;
		this.scaleY		= null;
		this.opacity	= 1;
		this.rotate		= null;
	}
	
	//接触判定（オブジェクトの中心点距離で判定）
	contactCheck(obj,distance){
		return onien.contactCheck(this,obj,distance);
	}
	
	//接触判定（コリジョン設定を使用して判定）
	colCheck(obj,x,y){
		return onien.colCheck(this,obj,x,y);
	}
	
	//自分を追加
	add(layerName){
		onien.addObj(this,layerName);
	}
	
	//自分を削除
	del(){
		onien.delObj(this);
	}
}

//レイヤークラス
class OeLayer{
	constructor(name,x,y,w,h){
		this.name		= name;
		this.visible	= true;
		this.content	= {};
		this.x			= x?x:0;
		this.y			= y?y:0;
		this.w			= w?w:onien.w;
		this.h			= h?h:onien.h;
		this.nonEvent	= false;
		
		this.sortList	= [];
		this.sortType	= "big";
	}
	
	//レイヤーの中身の並び順をソートする
	sortStart(){
		for(var i in this.sortList){
			this.sortList[i].y	= this.content[this.sortList[i].id].y;
		}
		var sortType	= this.sortType
		if(sortType == "big"){
			//idが大きい番号の方が上にくる
			this.sortList	= this.sortList.sort((a,b) => {return a.id.split("_")[1] - b.id.split("_")[1]});
		}else if(sortType == "small"){
			//idが小さい番号の方が上にくる
			this.sortList	= this.sortList.sort((a,b) => {return b.id.split("_")[1] - a.id.split("_")[1]});
		}else{
			//yが大きい方が上にくる
			this.sortList	= this.sortList.sort((a,b) => {return a.y - b.y});
		}
	}
	
	//自分を追加
	addLayer(){
		onien.addLayer(this);
	}
	
	//自分を削除
	delLayer(){
		onien.delLayer(this.name);
	}
	
	//自分の中身のオブジェクトを全て削除
	delAllObject(){
		onien.layer[this.name].content	= {};
		onien.layer[this.name].sortList	= [];
	}
}

//htmlタグクラス
class OeHtmlTag{
	constructor(id,on,off){
		this.id			= id;
		this.obj		= document.getElementById(id);
		this.visible	= true;
		this.type		= "H";
		//this.obj.style.visibility = "visible";
		this.buttonOn	= on?on:null;
		this.buttonOff	= off?off:null;
		this.x			= null;
		this.y			= null;
		this.w			= null;
		this.h			= null;
		this.fontsize	= null;
		this.autoPosition	= false;
		this.autoScale		= false;
		this.autoX		= null;
		this.autoY		= null;
		this.autoW		= null;
		this.autoH		= null;
		this.autoF		= null;
		
		//buttonOnの設定がある場合はイベントセット
		if(this.buttonOn != null){
			var that	= this;

			if(onien.platform != "i" && onien.platform != "android"){
				//PC用
				this.obj.addEventListener("mousedown",function(e){
					if(that.buttonOn){
						that.obj.src	= onien.asset[that.buttonOn].src;
					}

					try{
						that.mousedown(e);
					}catch(e){

					}
				});

				this.obj.addEventListener("mouseup",function(e){
					if(that.buttonOff){
						that.obj.src	= onien.asset[that.buttonOff].src;
					}

					try{
						that.mouseup(e);
					}catch(e){

					}
				});

				this.obj.addEventListener("mouseleave",function(e){
					if(that.buttonOff){
						that.obj.src	= onien.asset[that.buttonOff].src;
					}

					try{
						that.mouseleave(e);
					}catch(e){

					}
				});

				this.obj.addEventListener("mousemove",function(e){
					try{
						that.mousemove(e);
					}catch(e){

					}
				});
			}else{
				//スマホ用
				this.obj.addEventListener("touchstart",function(e){
					e.preventDefault();

					if(that.buttonOn){
						that.obj.src	= onien.asset[that.buttonOn].src;
					}


					try{
						that.mousedown(e);
					}catch(e){

					}
				});

				this.obj.addEventListener("touchend",function(e){
					e.preventDefault();

					if(that.buttonOff){
						that.obj.src	= onien.asset[that.buttonOff].src;
					}

					try{
						that.mouseup(e);
					}catch(e){

					}
				});

				this.obj.addEventListener("touchcancel",function(e){
					e.preventDefault();

					if(that.buttonOff){
						that.obj.src	= onien.asset[that.buttonOff].src;
					}

					try{
						that.mouseleave(e);
					}catch(e){

					}
				});

				this.obj.addEventListener("touchmove",function(e){
					e.preventDefault();

					try{
						that.mousemove(e);
					}catch(e){

					}
				});
			}
		}
		
		
	}
	
	//自分を追加
	add(layerName){
		onien.addObj(this,layerName);
	}
	
	//自分を削除
	del(){
		onien.delObj(this);
	}
	
	//位置自動調整
	positionSet(){
		var sW		= innerWidth;
		var sH		= innerHeight;

		if(onien.mobimg){
			if(onien.platform == "i" || onien.platform=="android"){
				sW		= onien.mobimg.clientWidth;
				sH		= onien.mobimg.clientHeight;
			}
		}

		var cW		= onien.w;
		var cH		= onien.h;
		var scale	= 1;

		var sP		= sW/sH;
		var cP		= cW/cH;

		if(sP > cP){
			//横長
			scale	= sH/cH;
		}else{
			//縦長
			scale	= sW/cW;
		}
		
		if(onien.setCenter){
			var left	= (sW - (scale*onien.w))/2;
			this.autoX	= scale * this.x + left;
		}else{
			this.autoX	= scale * this.x;
		}
		this.autoY	= scale * this.y;
	}
	
	//サイズ自動調整
	scaleSet(){
		if(this.w	== null){
			this.w = this.obj.scrollWidth?this.obj.scrollWidth:100;
		}
		if(this.h	== null){
			this.h = this.obj.scrollHeight?this.obj.scrollHeight:100;
		}
		if(this.fontsize == null){
			this.fontsize = this.obj.style.fontSize?this.obj.style.fontSize:20;
		}
		
		var sW		= innerWidth;
		var sH		= innerHeight;

		if(onien.mobimg){
			if(onien.platform == "i" || onien.platform=="android"){
				sW		= onien.mobimg.clientWidth;
				sH		= onien.mobimg.clientHeight;
			}
		}

		var cW		= onien.w;
		var cH		= onien.h;
		var scale	= 1;

		var sP		= sW/sH;
		var cP		= cW/cH;

		if(sP > cP){
			//横長
			scale	= sH/cH;
		}else{
			//縦長
			scale	= sW/cW;
		}
		
		this.autoW	= scale * this.w;
		this.autoH	= scale * this.h;
		this.autoF	= scale * this.fontsize;
	}
}

//ぷりアニクラス
class OePriani{
	constructor(prianiId,chara,x,y,refrain){
		this.prianiId	= prianiId;
		this.chara		= chara;
		this.x			= x?x:0;
		this.y			= y?y:0;
		this.refrain	= refrain?refrain:true;
		this.visible	= true;
		this.type		= "P";
		this.nonEvent	= false;
		
		onien.priani.loadPriani(prianiId,chara,x,y,refrain);
		
		this.w			= onien.priani.dataPriani[prianiId].cvWidth;
		this.h			= onien.priani.dataPriani[prianiId].cvHeight;
		
		this.col		= [0,0,this.w,0,this.w,this.h,0,this.h];
		this.scale		= 1;
		this.opacity	= 1;
	}
	
	//接触判定（オブジェクトの中心点距離で判定）
	contactCheck(obj,distance){
		return onien.contactCheck(this,obj,distance);
	}
	
	//接触判定（コリジョン設定を使用して判定）
	colCheck(obj,x,y){
		return onien.colCheck(this,obj,x,y);
	}
	
	//アニメーションチェンジ
	change(prianiId,refrain){
		this.prianiId	= prianiId;
		this.refrain	= refrain?refrain:true;
		onien.priani.changePriani(prianiId,this.chara,refrain);
	}
	
	//自分を追加
	add(layerName){
		onien.addObj(this,layerName);
	}
	
	//自分を削除
	del(){
		onien.delObj(this);
	}
}

//文字クラス
class OeText{
	constructor(text,x,y){
		this.text		= text;
		this.x			= x?x:0;
		this.y			= y?y:0;
		this.w			= 100;
		this.h			= 100;
		this.visible	= true;
		this.type		= "T";
		this.nonEvent	= false;
		
		this.size		= "24px";
		this.color		= "black";
		this.family		= "sans-serif";
		
		this.back		= null;
		this.src		= null;
		this.paddingLeft	= 0;
		this.paddingTop		= 0;
		
		this.opacity	= 1;
		
	}
	
	//自分を追加
	add(layerName){
		onien.addObj(this,layerName);
	}
	
	//自分を削除
	del(){
		onien.delObj(this);
	}
}

//一時キャンバスクラス
class OeTmpCanvas{
	constructor(w,h){
		var canvas		= document.createElement('canvas');
		canvas.width	= w?w:100;
		canvas.height	= h?h:100;
		this.canvas		= canvas;
		this.context	= this.canvas.getContext('2d');
	}
	
	draw(src,cutx,cuty,cutw,cuth,putx,puty){
		if(typeof(src) != "object"){
			src		= onien.asset[src];
		}
		
		this.context.save();
		this.context.drawImage(src,cutx,cuty,cutw,cuth,putx,puty,cutw,cuth);
		this.context.restore();
	}
}

//メッセージクラス
class OeMessage{
	constructor(x,y,w,h,waitcolor,waitmark,waitsize){
		this.x			= x?x:0;
		this.y			= y?y:0;
		this.w			= w?w:500;
		this.h			= h?h:200;
		this.visible	= true;
		this.type		= "M";
		this.nonEvent	= false;
		
		this.size		= "24px";
		this.color		= "white";
		this.family		= "sans-serif";
		
		this.back		= "black";
		this.src		= null;
		this.paddingLeft	= 10;
		this.paddingTop		= 10;
		
		this.radius		= 20;
		this.opacity	= 1;
		this.text		= "";
		
		this.newLine	= "/";
		this.lineHeight	= 35;
		this.waitX		= this.w-30;
		this.waitY		= this.h-20;
		this.wait		= false;
		this.firstColor	= "white";
		this.waitSpeed	= 1;
		this.waitCount	= 0;
		
		this.textlist	= null;
		this.mode		= null;
		this.speed		= 1;
		this.page		= 0;
		this.textlength	= 0;
		this.textcount	= 0;
		this.textstart	= false;
		this.closecount	= 0;
		
		this.end		= function(){};
		this.endcount	= 2;
		
		this.pagechange	= function(page){};
		
		//クリック待ち画像を生成
		var big			= waitsize?waitsize:"small";
		var canvas		= document.createElement('canvas');
		if(big == "small"){
			canvas.width	= 64;
			canvas.height	= 16;
		}else if(big == "big"){
			canvas.width	= 128;
			canvas.height	= 32;
		}else{
			canvas.width	= 256;
			canvas.height	= 64;
		}
		this.waitCanvas	= canvas;
		this.waitCtx	= this.waitCanvas.getContext('2d');
		
		var mark = waitmark?waitmark:"●";
		
		this.waitCtx.fillStyle	= waitcolor?waitcolor:"white";
		
		this.waitCtx.textAlign		= "left";
		this.waitCtx.textBaseline	= "top";
		if(big == "small"){
			this.waitCtx.font		= "6px sans-serif";
			this.waitCtx.fillText(mark,5,5);
			this.waitCtx.font		= "8px sans-serif";
			this.waitCtx.fillText(mark,16+4,4);
			this.waitCtx.font		= "10px sans-serif";
			this.waitCtx.fillText(mark,32+3,3);
			this.waitCtx.font		= "8px sans-serif";
			this.waitCtx.fillText(mark,48+4,4);
		}else if(big == "big"){
			this.waitCtx.font		= "16px sans-serif";
			this.waitCtx.fillText(mark,5,5);
			this.waitCtx.font		= "18px sans-serif";
			this.waitCtx.fillText(mark,32+4,4);
			this.waitCtx.font		= "20px sans-serif";
			this.waitCtx.fillText(mark,64+3,3);
			this.waitCtx.font		= "18px sans-serif";
			this.waitCtx.fillText(mark,96+4,4);
		}else{
			this.waitCtx.font		= "32px sans-serif";
			this.waitCtx.fillText(mark,5,5);
			this.waitCtx.font		= "34px sans-serif";
			this.waitCtx.fillText(mark,64+4,4);
			this.waitCtx.font		= "36px sans-serif";
			this.waitCtx.fillText(mark,128+3,3);
			this.waitCtx.font		= "34px sans-serif";
			this.waitCtx.fillText(mark,192+4,4);
		}
		
	}
	
	//メッセージを表示する
	open(texts,mode){
		this.visible	= true;
		this.textlist	= texts;
		this.text		= "";
		this.mode		= mode?mode:"end";
		this.page		= 0;
		this.textcount	= 0;
		this.textlength = this.textlist[0].length;
		this.textstart	= true;
		this.closecount	= this.mode;
	}
	
	//メッセージ用のenterframe関数
	mesEnterFrame(){
		if(this.speed != 0){
			if(this.textstart && onien.frame%this.speed==0){
				this.text += this.textlist[this.page].charAt(this.textcount);
				this.textcount++;
				
				if(this.textcount > this.textlist[this.page].length+1){
					this.textstart	= false;
					
					if(this.mode == "end"){
						this.wait		= true;
					
						this.mouseup = function(){
							if(this.page+1 >= this.textlist.length){
								this.visible	= false;
								try{
									this.end();
								}catch(e){
									
								}
							}else{
								this.page		+= 1;
								this.text		= "";
								this.textcount	= 0;
								this.textlength = this.textlist[this.page].length;
								this.wait		= false;
								this.textstart	= true;
								try{
									this.pagechange(this.page);
								}catch(e){
									
								}
							}
							this.mouseup = null;
							onien.layer[this.layer].mouseup = null;
						}
						
						var that = this;
						onien.layer[this.layer].mouseup = function(){
							if(that.page+1 >= that.textlist.length){
								that.visible	= false;
								try{
									that.end();
								}catch(e){
									
								}
							}else{
								that.page		+= 1;
								that.text		= "";
								that.textcount	= 0;
								that.textlength = that.textlist[that.page].length;
								that.wait		= false;
								that.textstart	= true;
								try{
									that.pagechange(that.page);
								}catch(e){
									
								}
							}
							that.mouseup = null;
							onien.layer[that.layer].mouseup = null;
						}
					}else if(this.mode == "select"){
						if(this.page+1 < this.textlist.length){
							this.wait		= true;
							
							this.mouseup = function(){
								this.page		+= 1;
								this.text		= "";
								this.textcount	= 0;
								this.textlength = this.textlist[this.page].length;
								this.wait		= false;
								this.textstart	= true;
								
								try{
									this.pagechange(this.page);
								}catch(e){
									
								}
								
								this.mouseup = null;
								onien.layer[this.layer].mouseup = null;
							}
							
							var that = this;
							onien.layer[this.layer].mouseup = function(){
								that.page		+= 1;
								that.text		= "";
								that.textcount	= 0;
								that.textlength = that.textlist[that.page].length;
								that.wait		= false;
								that.textstart	= true;
								
								try{
									that.pagechange(that.page);
								}catch(e){
									
								}
								
								that.mouseup = null;
								onien.layer[that.layer].mouseup = null;
							}
						}else{
							try{
								this.end();
							}catch(e){
								
							}
						}
					}else{
						this.closecount--;
						
					}
					
					
				}
			}else if(this.mode != "end" && this.mode != "select" && this.closecount!=0 && onien.frame%this.speed==0){
				this.closecount--;
				if(this.closecount <= 0){
					if(this.page+1 >= this.textlist.length){
						this.visible	= false;
						this.closecount	= 0;
						try{
							this.end();
						}catch(e){
							
						}
					}else{
						this.page		+= 1;
						this.text		= "";
						this.textcount	= 0;
						this.textlength = this.textlist[this.page].length;
						this.wait		= false;
						this.textstart	= true;
						this.closecount	= this.mode;
						
						try{
							this.pagechange(this.page);
						}catch(e){
							
						}
					}
				}
			}
		}else{
			this.text = this.textlist[this.page];
			
			if(this.mode == "end"){
				this.wait		= true;
				
				this.mouseup = function(){
					if(this.page+1 >= this.textlist.length){
						this.visible	= false;
						try{
							this.end();
						}catch(e){
							
						}
					}else{
						this.page		+= 1;
						this.text		= "";
						this.wait		= false;
						
						try{
							this.pagechange(this.page);
						}catch(e){
							
						}
					}
					this.mouseup = null;
					onien.layer[this.layer].mouseup = null;
				}
				
				var that = this;
				onien.layer[this.layer].mouseup = function(){
					if(that.page+1 >= that.textlist.length){
						that.visible	= false;
						try{
							that.end();
						}catch(e){
							
						}
					}else{
						that.page		+= 1;
						that.text		= "";
						that.wait		= false;
						
						try{
							that.pagechange(that.page);
						}catch(e){
							
						}
					}
					that.mouseup = null;
					onien.layer[that.layer].mouseup = null;
				}
			}else if(this.mode == "select"){
				if(this.page+1 < this.textlist.length){
					this.wait		= true;

					this.mouseup = function(){
						this.page		+= 1;
						this.text		= "";
						this.wait		= false;
						
						try{
							this.pagechange(this.page);
						}catch(e){
							
						}
						
						this.mouseup = null;
						onien.layer[this.layer].mouseup = null;
					}
					
					var that = this;
					onien.layer[this.layer].mouseup = function(){
						that.page		+= 1;
						that.text		= "";
						that.wait		= false;
						
						try{
							that.pagechange(that.page);
						}catch(e){
							
						}
						
						that.mouseup = null;
						onien.layer[that.layer].mouseup = null;
					}
				}else if(this.textstart){
					if(this.endcount == 0){
						this.textstart = false;
						try{
							this.end();
						}catch(e){

						}
					}else{
						this.endcount--;
					}
					
				}
			}else{
				this.closecount--;
				if(this.closecount <= 0){
					if(this.page+1 >= this.textlist.length){
						this.visible	= false;
						this.closecount	= 0;
						try{
							this.end();
						}catch(e){
							
						}
					}else{
						this.page		+= 1;
						this.text		= "";
						this.wait		= false;
						this.closecount	= this.mode;
						try{
							this.pagechange(this.page);
						}catch(e){
							
						}
					}
				}
			}
		}
		
	}
	
	//自分を追加
	add(layerName){
		onien.addObj(this,layerName);
	}
	
	//自分を削除
	del(){
		onien.delObj(this);
	}
}

//ぷりアニ用のデータセット
dataPriani	= {};
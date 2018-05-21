class GameCanvas {
	/**
	*
	*/
	constructor() {
		this.canvas = document.getElementById("ctx");
		this.context = this.canvas.getContext("2d");
		
		window.addEventListener('resize',() => { this.resizeCanvas(); });
		
		this.resizeCanvas();
		
		this.background = new Image();
		this.background.src = '/resources/images/background/purple.jpg';

		this.sun = new Image();
		this.sun.src = '/resources/images/planets/sun.png';

		this.planet1 = new Image();
		this.planet1.src = '/resources/images/planets/aurelia.png';
		
		this.stars1 = new Image();
		this.stars1.src = '/resources/images/background/stars1.png';
		this.stars2 = new Image();
		this.stars2.src = '/resources/images/background/stars2.png';
		
		this.ship1 = new Image();
		this.ship1.src = '/resources/images/spaceships/test/ship1.png';
		
		this.jet1 = new Image();
		this.jet1.src = '/resources/images/spaceships/jets/jet1-yellow.png';
	}
	/**
	*
	*/
	resizeCanvas() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.canvas.style.width = window.innerWidth + 'px';
		this.canvas.style.height = window.innerHeight + 'px';
	}
	/**
	*
	*/
	drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {
	    if (arguments.length === 2) {
	        x = y = 0;
	        w = ctx.canvas.width;
	        h = ctx.canvas.height;
	    }
	
	    // default offset is center
	    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
	    offsetY = typeof offsetY === "number" ? offsetY : 0.5;
	
	    // keep bounds [0.0, 1.0]
	    if (offsetX < 0) offsetX = 0;
	    if (offsetY < 0) offsetY = 0;
	    if (offsetX > 1) offsetX = 1;
	    if (offsetY > 1) offsetY = 1;
	
	    var iw = img.width,
	        ih = img.height,
	        r = Math.min(w / iw, h / ih),
	        nw = iw * r,   // new prop. width
	        nh = ih * r,   // new prop. height
	        cx, cy, cw, ch, ar = 1;
	
	    // decide which gap to fill    
	    if (nw < w) ar = w / nw;                             
	    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
	    nw *= ar;
	    nh *= ar;
	
	    // calc source rectangle
	    cw = iw / (nw / w);
	    ch = ih / (nh / h);
	
	    cx = (iw - cw) * offsetX;
	    cy = (ih - ch) * offsetY;
	
	    // make sure source rectangle is valid
	    if (cx < 0) cx = 0;
	    if (cy < 0) cy = 0;
	    if (cw > iw) cw = iw;
	    if (ch > ih) ch = ih;
	
	    // fill image in dest. rectangle
	    ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
	}
	/**
	*
	*/
	paint(data) {
		var viewportX = window.innerWidth / 2;
		var viewportY = window.innerHeight / 2;
		
		if (!game.client.loggedIn) {
			if (!this.filterSet) {
				//this.context.filter = 'saturate(20)';
//				this.filterSet = true;
			}
		}
		
		// Repaint canvas. Move to own function
		this.context.font= "12px Arial";
		this.context.fillStyle = '#000000';
		
		var currentPlayer = false;
		for(var i = 0 ; i < data.length; i++) {
			if (data[i].id == game.client.id) {
				currentPlayer = data[i];
			}
		}
		
		var cameraX = -100;
		var cameraY = 0;
		if (currentPlayer) {
			cameraX = currentPlayer.x - viewportX;
			cameraY = currentPlayer.y - viewportY;
		}
		
		// this.context.drawImage(this.background,0,0,window.innerWidth,window.innerHeight);
		this.drawImageProp(this.context,this.background,0,0,window.innerWidth,window.innerHeight);
		
		this.context.drawImage(this.stars1,-cameraX * 0.1,-cameraY * 0.1);
		this.context.drawImage(this.stars2,-cameraX * 0.4,-cameraY * 0.4);
		
		// game.drawSprite(game.sprites["spr_stars01"], viewportX + (game.camera.x / 1.05), viewportY + (game.camera.y / 1.05));
		// game.drawSprite(game.sprites["spr_stars02"], viewportX + (game.camera.x / 1.1), viewportY + (game.camera.y / 1.1));
		
		// this.context.save();
		// this.context.translate(window.innerWidth / 2,window.innerHeight / 2);
		
		this.context.save();
		this.context.translate(100 - cameraX,100 - cameraY);
		this.context.drawImage(this.planet1,0,0);
		this.context.restore();
		
		this.context.save();
		this.context.translate(3700 - cameraX,3700 - cameraY);
		this.context.drawImage(this.sun,0,0);
		this.context.restore();

		for(var i = 0 ; i < data.length; i++) {
			var shipImage = this.ship1;
			var jetImage = this.jet1;
			
			this.context.save();

			this.context.translate(data[i].x - cameraX,data[i].y - cameraY);
			
			this.context.translate(shipImage.width / 2,shipImage.height / 2);
			
			this.context.rotate(data[i].angle);
			
			if (data[i].isThrusting) {
				this.context.drawImage(jetImage,-(shipImage.width / 2) + 12,(shipImage.height / 2) - 10);
			}
			else if (data[i].isReversing) {
				this.context.save();
				this.context.scale(1,-1);
				this.context.drawImage(jetImage,-16,16,(jetImage.width / 2),(jetImage.height / 2));
				this.context.drawImage(jetImage,-2,16,(jetImage.width / 2),(jetImage.height / 2));
				this.context.restore();
			}
			
			this.context.drawImage(shipImage,-(shipImage.width / 2),-(shipImage.height / 2));
			
			if (game.client.loggedIn) {
				this.context.rotate(-data[i].angle);
				this.context.fillStyle = '#000000';
				this.context.fillText(data[i].name,-9,shipImage.height + 11);
				this.context.fillStyle = '#FFFFFF';
				this.context.fillText(data[i].name,-10,shipImage.height + 10);
			}
			
			this.context.restore();
		}
		
		if (game.client.loggedIn) {
			this.context.fillStyle = '#FFFFFF';
			this.context.font= "16px Arial";
			
			if (isNaN(currentPlayer.y) || isNaN(currentPlayer.x)) {
				this.context.fillText('0:0',window.innerWidth - 100,window.innerHeight - 100);
			}
			else {
				this.context.fillText(Math.round(currentPlayer.x / 100) + ':' + Math.round(currentPlayer.y / 100),window.innerWidth - 100,window.innerHeight - 100);
			}
			// CameraX and Y can probably be moved onto the camera object, then we don't have to pass them around
			this.paintMiniMap(cameraX,cameraY);
			// game.gui.miniMap.paint(this.context,cameraX,cameraY);
		}
	}
	paintMiniMap(cameraX,cameraY) {
		this.context.save();
		var miniMapWidth = 200;
		var miniMapHeight = 200;
		var miniMapScale = 0.05;
		
		this.context.translate(window.innerWidth - miniMapWidth,0);
		

		this.context.fillStyle = '#000000';
		this.context.fillRect(window.innerWidth - miniMapWidth,0,miniMapWidth,miniMapHeight);
		this.context.globalAlpha = 0.8;
		this.drawImageProp(this.context,this.background,0,0,miniMapWidth,miniMapHeight);
		this.context.globalAlpha = 1;
		
		// this.context.translate(10 - cameraX,10 - cameraY);
		this.context.drawImage(this.planet1,10 - (cameraX * miniMapScale),10 - (cameraY * miniMapScale),this.planet1.width * miniMapScale,this.planet1.height * miniMapScale);
		this.context.restore();
	}
}
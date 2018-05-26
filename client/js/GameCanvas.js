class GameCanvas {
	/**
	*
	*/
	constructor() {
		this.canvas = document.getElementById("ctx");
		this.context = this.canvas.getContext("2d");
		
		this.zoomLevel = 1;
		
		window.addEventListener('resize',() => { this.resizeCanvas(); });
		
		this.resizeCanvas();
		
		this.background = new Image();
		this.background.src = '/resources/images/background/purple.jpg';

		this.sun = new Image();
		this.sun.src = '/resources/images/planets/sun.png';
		
		this.laser = new Image();
		this.laser.src = '/resources/images/lasers/laser1.png';

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
		
		this.context.save();
		
		// Repaint canvas. Move to own function
		this.context.font= "12px Arial";
		this.context.fillStyle = '#000000';
		
		var currentPlayer = false;
		for(var i = 0 ; i < data.length; i++) {
			if (game.client.loggedIn && data[i].id == game.client.id) {
				currentPlayer = data[i];
			}
		}
		var realCameraX = -100;
		var realCameraY = 0;
		var cameraX = realCameraX;
		var cameraY = realCameraY;

		if (currentPlayer) {
			realCameraX = currentPlayer.x - viewportX;
			realCameraY = currentPlayer.y - viewportY;
			cameraX = currentPlayer.x - viewportX / this.zoomLevel;
			cameraY = currentPlayer.y - viewportY / this.zoomLevel;
		}
		
		// this.context.drawImage(this.background,0,0,window.innerWidth,window.innerHeight);
		this.drawImageProp(this.context,this.background,0,0,window.innerWidth,window.innerHeight);
		
		this.context.drawImage(this.stars1,-cameraX * 0.1,-cameraY * 0.1);
		this.context.drawImage(this.stars2,-cameraX * 0.4,-cameraY * 0.4);
		
		this.context.scale(this.zoomLevel,this.zoomLevel);
		
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
			if (data[i].type == 'LASER') {
				var laserImage = this.laser;
				

				this.context.save();
	
				this.context.translate(data[i].x - cameraX,data[i].y - cameraY);
				
				this.context.rotate(data[i].angle);
				
				this.context.drawImage(laserImage,-(laserImage.width / 2),-(laserImage.height / 2));
				
				
				this.context.restore();
			}
			else if (data[i].type == 'PLAYER') {
				var shipImage = this.ship1;
				var jetImage = this.jet1;
				
				this.context.textAlign = 'center';
				
				this.context.save();
	
				this.context.translate(data[i].x - cameraX,data[i].y - cameraY);
				
				// this.context.translate(shipImage.width / 2,shipImage.height / 2);
				
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
				/*
				this.context.beginPath();
				this.context.arc(0,0,30,0,2*Math.PI);
				this.context.fill();
				this.context.closePath();
				*/
				
				this.context.drawImage(shipImage,-(shipImage.width / 2),-(shipImage.height / 2));
				
				if (game.client.loggedIn) {
					this.context.rotate(-data[i].angle);
					// this.context.fillStyle = '#000000';
					// this.context.fillText(data[i].name,-9,shipImage.height + 11);
					// this.context.fillStyle = '#FFFFFF';
					// this.context.fillText(data[i].name,-10,shipImage.height + 10);
					
					this.context.fillStyle = '#FFFFFF';
					this.context.strokeStyle = '#000000';
					this.context.lineWidth = 3;
					this.context.miterLimit = 2;
					this.context.strokeText(data[i].name,0,shipImage.height + 10);
					this.context.fillText(data[i].name,0,shipImage.height + 10);
					
					this.context.translate(-50,0);
					
					this.context.fillStyle = '#FFFFFF';
					this.context.fillRect(0,shipImage.height + 20,(data[i].health > 0 ? data[i].health : 0),10);
					
					var healthBarGradient = this.context.createLinearGradient(0,0,100,0);
					healthBarGradient.addColorStop(0,'#5c0304');
					// healthBarGradient.addColorStop(0.5,'#98010d');
					healthBarGradient.addColorStop(1,'#98010d');
					
					this.context.fillStyle = healthBarGradient;
					this.context.fillRect(0,shipImage.height + 20,(data[i].health > 0 ? data[i].health : 0),10);

					this.context.strokeStyle  = '#000000';
					this.context.lineWidth = 1;
					this.context.strokeRect(0,shipImage.height + 20,100,10);
					
				}
				this.context.restore();
			}
		}
		this.context.restore();
		
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
			this.paintMiniMap(realCameraX,realCameraY);
			// game.gui.miniMap.paint(this.context,cameraX,cameraY);
		}
		
		
	}
	paintMiniMap(cameraX,cameraY) {
		this.context.save();
		
		var miniMapWidth = 250;
		var miniMapHeight = 250;
		var miniMapScale = 0.05;
		
		this.context.translate(window.innerWidth - miniMapWidth,0);
		
		// this.context.scale(1 + 1 * this.zoomLevel,1 + 1 * this.zoomLevel);
		

		this.context.fillStyle = '#000000';
		this.context.fillRect(window.innerWidth - miniMapWidth,0,miniMapWidth,miniMapHeight);
		this.context.globalAlpha = 0.8;
		this.drawImageProp(this.context,this.background,0,0,miniMapWidth,miniMapHeight);
		this.context.globalAlpha = 1;
		
		// this.context.translate(10 - cameraX,10 - cameraY);
		// this.context.drawImage(this.planet1,10 + (miniMapWidth / 2) - (cameraX * miniMapScale),10 + (miniMapHeight / 2) - (cameraY * miniMapScale),this.planet1.width * miniMapScale,this.planet1.height * miniMapScale);
		this.context.drawImage(this.planet1,(miniMapWidth / 2) - 40 - (cameraX * miniMapScale),(miniMapHeight / 2) - 40 - (cameraY * miniMapScale),this.planet1.width * miniMapScale,this.planet1.height * miniMapScale);
		this.context.restore();
	}
}
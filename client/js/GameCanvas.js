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
		
		document.body.style.backgroundImage = 'url("/resources/images/background/purple.jpg")';

		this.sun = new Image();
		this.sun.src = '/resources/images/planets/sun.png';
		
		this.laser = new Image();
		this.laser.src = '/resources/images/lasers/laser1.png';

		this.planet1 = new Image();
		this.planet1.src = '/resources/images/planets/planet2.png'; // Earth-like for Aurelia
		
		this.planet2 = new Image();
		this.planet2.src = '/resources/images/planets/planet3.png'; // Desert for Nexus
		
		this.planet3 = new Image();
		this.planet3.src = '/resources/images/planets/aurelia.png'; // Original for Frontier
		
		this.stars1 = new Image();
		this.stars1.src = '/resources/images/background/stars1.png';
		this.stars2 = new Image();
		this.stars2.src = '/resources/images/background/stars2.png';
		
		this.ship1 = new Image();
		this.ship1.src = '/resources/images/spaceships/test/ship1.png';
		
		this.traderShip = new Image();
		this.traderShip.src = '/resources/images/spaceships/test/ship1.png';
		
		this.jet1 = new Image();
		this.jet1.src = '/resources/images/spaceships/jets/jet1-yellow.png';
		
		// System transition effect
		this.transitionEffect = {
			active: false,
			progress: 0,
			duration: 2, // seconds
			fromSystem: null,
			toSystem: null
		};
		
		this.paint();
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
	drawScaledPlanet(image, x, y, name, maxWidth = 400) {
		if (!image || !image.complete) return;
		
		// Calculate scale to fit within maxWidth
		var scale = Math.min(maxWidth / image.width, 1);
		var width = image.width * scale;
		var height = image.height * scale;
		
		// Draw the planet
		this.context.save();
		this.context.translate(x, y);
		this.context.drawImage(image, 0, 0, width, height);
		
		// Add planet name
		this.context.fillStyle = '#ffffff';
		this.context.strokeStyle = '#000000';
		this.context.lineWidth = 3;
		this.context.font = '16px Arial';
		this.context.textAlign = 'center';
		this.context.strokeText(name, width / 2, height + 20);
		this.context.fillText(name, width / 2, height + 20);
		
		this.context.restore();
	}
	
	drawScaledSun(image, x, y, name, maxWidth = 600) {
		if (!image || !image.complete) return;
		
		// Calculate scale to fit within maxWidth
		var scale = Math.min(maxWidth / image.width, 1);
		var width = image.width * scale;
		var height = image.height * scale;
		
		// Draw the sun
		this.context.save();
		this.context.translate(x, y);
		this.context.drawImage(image, 0, 0, width, height);
		
		// Add sun name with yellow tint
		this.context.fillStyle = '#ffff88';
		this.context.strokeStyle = '#000000';
		this.context.lineWidth = 3;
		this.context.font = '18px Arial';
		this.context.textAlign = 'center';
		this.context.strokeText(name, width / 2, height + 25);
		this.context.fillText(name, width / 2, height + 25);
		
		this.context.restore();
	}
	
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
	createOffscreenCanvas(width,height) {
		var offScreenCanvas = document.createElement('canvas');
		offScreenCanvas.width = width;
		offScreenCanvas.height = height;
		return offScreenCanvas; //return canvas element
	}
	drawAndCacheOffscreenCanvas(image,key) {
		if (!this.canvasCache) {
			this.canvasCache = {};
		}
		if (!this.canvasCache[key]) {
			var canvas = this.createOffscreenCanvas(image.width,image.height);
			canvas.getContext('2d').drawImage(image,0,0);
			this.canvasCache[key] = canvas;
		}
		return this.canvasCache[key];
	}
	/**
	*
	*/
	paint() {
		stats.begin();
		
		var data = game.network.lastDataReceived;
		
		if (data) {
			var viewportX = window.innerWidth / 2;
			var viewportY = window.innerHeight / 2;
			
			this.context.save();
			this.context.beginPath();
			
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
			// this.drawImageProp(this.context,this.background,0,0,window.innerWidth,window.innerHeight);
			this.context.clearRect(0,0,window.innerWidth,window.innerHeight);
			
			// this.context.drawImage(this.stars1,-cameraX * 0.1,-cameraY * 0.1);
			// this.context.drawImage(this.stars2,-cameraX * 0.4,-cameraY * 0.4);
			
			this.context.scale(this.zoomLevel,this.zoomLevel);
			
			// game.drawSprite(game.sprites["spr_stars01"], viewportX + (game.camera.x / 1.05), viewportY + (game.camera.y / 1.05));
			// game.drawSprite(game.sprites["spr_stars02"], viewportX + (game.camera.x / 1.1), viewportY + (game.camera.y / 1.1));
			
			// this.context.save();
			// this.context.translate(window.innerWidth / 2,window.innerHeight / 2);
			
			// Planet 1 - Aurelia
			this.drawScaledPlanet(this.planet1, 100 - cameraX, 100 - cameraY, 'Aurelia');
			
			// Planet 2 - Nexus
			this.drawScaledPlanet(this.planet2, 2500 - cameraX, 1200 - cameraY, 'Nexus');
			
			// Planet 3 - Frontier
			this.drawScaledPlanet(this.planet3, 1500 - cameraX, 2800 - cameraY, 'Frontier');
			
			// Sun - using a larger max width since suns are typically bigger
			this.drawScaledSun(this.sun, 3700 - cameraX, 3700 - cameraY, 'Sol', 600);
	
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
				else if (data[i].type == 'TRADER') {
					var traderImage = this.traderShip;
					var jetImage = this.jet1;
					
					this.context.textAlign = 'center';
					
					this.context.save();
		
					this.context.translate(data[i].x - cameraX,data[i].y - cameraY);
					
					this.context.rotate(data[i].angle);
					
					if (data[i].isThrusting) {
						this.context.drawImage(jetImage,-(traderImage.width / 2) + 12,(traderImage.height / 2) - 10);
					}
					else if (data[i].isReversing) {
						this.context.save();
						this.context.scale(1,-1);
						this.context.drawImage(jetImage,-16,16,(jetImage.width / 2),(jetImage.height / 2));
						this.context.drawImage(jetImage,-2,16,(jetImage.width / 2),(jetImage.height / 2));
						this.context.restore();
					}
					
					// Tint trader ship differently (greenish)
					this.context.save();
					this.context.globalCompositeOperation = 'multiply';
					this.context.fillStyle = '#80ff80';
					this.context.fillRect(-(traderImage.width / 2), -(traderImage.height / 2), traderImage.width, traderImage.height);
					this.context.globalCompositeOperation = 'source-over';
					this.context.restore();
					
					this.context.drawImage(traderImage,-(traderImage.width / 2),-(traderImage.height / 2));
					
					if (game.client.loggedIn) {
						this.context.rotate(-data[i].angle);
						
						this.context.fillStyle = '#80ff80';
						this.context.strokeStyle = '#000000';
						this.context.lineWidth = 2;
						this.context.miterLimit = 2;
						this.context.strokeText(data[i].name,0,traderImage.height + 10);
						this.context.fillText(data[i].name,0,traderImage.height + 10);
					}
					this.context.restore();
				}
				else if (data[i].type == 'EXPLOSION') {
					// Draw explosion particles
					if (data[i].particles && data[i].particles.length > 0) {
						this.context.save();
						
						for (let particle of data[i].particles) {
							this.context.save();
							this.context.translate(particle.x - cameraX, particle.y - cameraY);
							
							// Create gradient for particle glow effect
							var gradient = this.context.createRadialGradient(0, 0, 0, 0, 0, particle.size);
							gradient.addColorStop(0, `rgba(255, 200, 0, ${particle.alpha})`);
							gradient.addColorStop(0.5, `rgba(255, 100, 0, ${particle.alpha * 0.8})`);
							gradient.addColorStop(1, `rgba(255, 0, 0, ${particle.alpha * 0.3})`);
							
							this.context.fillStyle = gradient;
							this.context.beginPath();
							this.context.arc(0, 0, particle.size, 0, Math.PI * 2);
							this.context.fill();
							
							this.context.restore();
						}
						
						this.context.restore();
					}
				}
			else if (data[i].type == 'STARGATE') {
				// Draw star gate
				this.context.save();
				this.context.translate(data[i].x - cameraX, data[i].y - cameraY);
				
				// Animated rotating portal effect
				var time = Date.now() / 1000;
				this.context.rotate(time * 0.5);
				
				// Outer ring
				var gradient = this.context.createRadialGradient(0, 0, 0, 0, 0, data[i].radius);
				gradient.addColorStop(0, 'rgba(0, 100, 255, 0)');
				gradient.addColorStop(0.7, 'rgba(0, 150, 255, 0.3)');
				gradient.addColorStop(0.9, 'rgba(100, 200, 255, 0.8)');
				gradient.addColorStop(1, 'rgba(200, 255, 255, 1)');
				
				this.context.fillStyle = gradient;
				this.context.beginPath();
				this.context.arc(0, 0, data[i].radius, 0, Math.PI * 2);
				this.context.fill();
				
				// Inner swirl
				this.context.rotate(-time * 1.5);
				var gradient2 = this.context.createRadialGradient(0, 0, 0, 0, 0, data[i].radius * 0.7);
				gradient2.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
				gradient2.addColorStop(0.5, 'rgba(100, 150, 255, 0.4)');
				gradient2.addColorStop(1, 'rgba(0, 50, 200, 0)');
				
				this.context.fillStyle = gradient2;
				this.context.beginPath();
				this.context.arc(0, 0, data[i].radius * 0.7, 0, Math.PI * 2);
				this.context.fill();
				
				// Label
				this.context.restore();
				this.context.save();
				this.context.translate(data[i].x - cameraX, data[i].y - cameraY);
				this.context.fillStyle = '#80ccff';
				this.context.strokeStyle = '#000000';
				this.context.lineWidth = 2;
				this.context.font = '14px Arial';
				this.context.textAlign = 'center';
				this.context.strokeText('Star Gate', 0, data[i].radius + 20);
				this.context.fillText('Star Gate', 0, data[i].radius + 20);
				
				this.context.restore();
			}
			else if (data[i].type == 'SPACESTATION') {
				// Draw space station
				this.context.save();
				this.context.translate(data[i].x - cameraX, data[i].y - cameraY);
				this.context.rotate(data[i].angle);
				
				// Main body - octagonal shape
				this.context.fillStyle = '#666666';
				this.context.strokeStyle = '#333333';
				this.context.lineWidth = 2;
				
				var size = 40;
				var sides = 8;
				this.context.beginPath();
				for (var j = 0; j < sides; j++) {
					var angle = (j / sides) * Math.PI * 2;
					var x = Math.cos(angle) * size;
					var y = Math.sin(angle) * size;
					if (j === 0) {
						this.context.moveTo(x, y);
					} else {
						this.context.lineTo(x, y);
					}
				}
				this.context.closePath();
				this.context.fill();
				this.context.stroke();
				
				// Central hub
				this.context.fillStyle = '#444444';
				this.context.beginPath();
				this.context.arc(0, 0, size * 0.4, 0, Math.PI * 2);
				this.context.fill();
				
				// Solar panels/arms
				this.context.strokeStyle = '#888888';
				this.context.lineWidth = 4;
				for (var k = 0; k < 4; k++) {
					var armAngle = (k / 4) * Math.PI * 2;
					this.context.beginPath();
					this.context.moveTo(0, 0);
					this.context.lineTo(Math.cos(armAngle) * size * 1.5, Math.sin(armAngle) * size * 1.5);
					this.context.stroke();
					
					// Solar panel at end
					this.context.save();
					this.context.translate(Math.cos(armAngle) * size * 1.5, Math.sin(armAngle) * size * 1.5);
					this.context.rotate(armAngle + Math.PI / 2);
					this.context.fillStyle = '#224488';
					this.context.fillRect(-15, -5, 30, 10);
					this.context.restore();
				}
				
				// Add some lights
				this.context.fillStyle = '#ffff00';
				for (var l = 0; l < sides; l++) {
					var lightAngle = (l / sides) * Math.PI * 2;
					var lightX = Math.cos(lightAngle) * size * 0.8;
					var lightY = Math.sin(lightAngle) * size * 0.8;
					this.context.beginPath();
					this.context.arc(lightX, lightY, 2, 0, Math.PI * 2);
					this.context.fill();
				}
				
				// Station name
				this.context.rotate(-data[i].angle);
				this.context.fillStyle = '#cccccc';
				this.context.font = '12px Arial';
				this.context.textAlign = 'center';
				this.context.fillText('Station ' + data[i].planetName, 0, size + 25);
				
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
		
		if (game.client.loggedIn && game.debugMessage && game.debugMessage.length > 0) {
			this.context.fillText(game.debugMessage,window.innerWidth - 1000,window.innerHeight - 50);
		}
		
		// System transition effect
		if (this.transitionEffect.active) {
			var elapsed = (Date.now() - this.transitionEffect.startTime) / 1000;
			this.transitionEffect.progress = Math.min(elapsed / this.transitionEffect.duration, 1);
			
			// Fade to white then back
			var alpha = 0;
			if (this.transitionEffect.progress < 0.5) {
				alpha = this.transitionEffect.progress * 2;
			} else {
				alpha = (1 - this.transitionEffect.progress) * 2;
			}
			
			this.context.save();
			this.context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
			this.context.fillRect(0, 0, window.innerWidth, window.innerHeight);
			
			// Blur effect
			if (alpha > 0) {
				this.context.filter = `blur(${alpha * 20}px)`;
			}
			
			// System name display
			if (alpha > 0.3) {
				this.context.filter = 'none';
				this.context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
				this.context.font = '48px Arial';
				this.context.textAlign = 'center';
				var systemName = this.transitionEffect.progress < 0.5 ? 
					'Leaving ' + this.transitionEffect.fromSystem :
					'Entering ' + this.transitionEffect.toSystem;
				this.context.fillText(systemName, window.innerWidth / 2, window.innerHeight / 2);
			}
			
			this.context.restore();
			
			if (this.transitionEffect.progress >= 1) {
				this.transitionEffect.active = false;
			}
		}
		
		window.requestAnimationFrame(() => { this.paint() },this.canvas);
		stats.end();
	}
	paintMiniMap(cameraX,cameraY) {
		this.context.save();
		
		var miniMapWidth = 206;
		var miniMapHeight = 206;
		var miniMapScale = 0.05;
		
		this.context.translate(window.innerWidth - miniMapWidth,0);
		
		this.context.rect(0,0,miniMapWidth,miniMapHeight);
		this.context.clip();
		
		this.context.fillStyle = '#000000';
		this.context.fillRect(window.innerWidth - miniMapWidth,0,miniMapWidth,miniMapHeight);
		this.context.globalAlpha = 0.8;
		this.drawImageProp(this.context,this.background,0,0,miniMapWidth,miniMapHeight);
		this.context.globalAlpha = 1;
		
		this.context.drawImage(this.planet1,(miniMapWidth / 2) - 40 - (cameraX * miniMapScale),(miniMapHeight / 2) - 40 - (cameraY * miniMapScale),this.planet1.width * miniMapScale,this.planet1.height * miniMapScale);
		this.context.restore();
	}
}
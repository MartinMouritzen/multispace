class Client {
	getParameterByName(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}
	/**
	*
	*/
	init() {
		this.canvas = document.getElementById("ctx");
		this.context = this.canvas.getContext("2d");
		
		this.chatting = false;
		
		this.playersInZone = {};

		this.socket = io();
		
		this.listenForInput();
		this.listenForEvents();
		
		window.addEventListener('resize',() => { this.resizeCanvas(); });

		this.background = new Image();
		this.background.src = '/client/resources/images/background/purple.jpg';

		this.sun = new Image();
		this.sun.src = '/client/resources/images/planets/sun.png';

		this.planet1 = new Image();
		this.planet1.src = '/client/resources/images/planets/aurelia.png';
		
		this.stars1 = new Image();
		this.stars1.src = '/client/resources/images/background/stars1.png';
		this.stars2 = new Image();
		this.stars2.src = '/client/resources/images/background/stars2.png';
		
		this.ship1 = new Image();
		this.ship1.src = '/client/resources/images/spaceships/test/ship1.png';
		
		this.jet1 = new Image();
		this.jet1.src = '/client/resources/images/spaceships/jets/jet1-yellow.png';
		
		this.resizeCanvas();
		
		this.socket.emit('login', { name: this.getParameterByName('username') });
	}
	resizeCanvas() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.canvas.style.width = window.innerWidth + 'px';
		this.canvas.style.height = window.innerHeight + 'px';
	}
	startChat() {
		this.chatting = true;
	}
	stopChat() {
		this.chatting = false;
	}
	stopAllMovement() {
		this.socket.emit('keyPress',{ inputId:'all', state: false } );
	}
	/**
	*
	*/
	listenForInput() {
		document.onkeydown = (event) => {
			if(event.keyCode === 27 && this.chatting) {
				document.getElementById('chatInput').style.display = 'none';
				document.getElementById('chatInput').value = '';
				document.getElementById('chatInput').blur();
				stopChat();
			}
			if(event.keyCode === 13) {
				if (this.chatting) {
					var message = document.getElementById('chatInput').value;
					if (message.length > 0) {
						this.socket.emit('chatMessage',{ message: message });
						document.getElementById('chatInput').style.display = 'none';
						document.getElementById('chatInput').value = '';
						document.getElementById('chatInput').blur();
					}
					this.stopChat();
				}
				else {
					this.stopAllMovement();
					document.getElementById('chatInput').style.display = 'block';
					document.getElementById('chatInput').focus();
					this.startChat();
				}
			}
			if (!this.chatting) {
				if(event.keyCode === 68) {
					this.socket.emit('keyPress',{ inputId:'right', state:true } );
				}
				else if(event.keyCode === 83) {
					this.socket.emit('keyPress',{ inputId:'down', state: true } );
				}
				else if(event.keyCode === 65) {
					this.socket.emit('keyPress',{ inputId:'left', state: true});
				}
				else if(event.keyCode === 87) {
					this.socket.emit('keyPress',{ inputId:'up', state: true});
				}
			}
		}
		document.onkeyup = (event) => {
			if (!this.chatting) {
				if(event.keyCode === 68) { // D
					this.socket.emit('keyPress',{ inputId:'right',state: false } );
				}
				else if(event.keyCode === 83) {
					this.socket.emit('keyPress',{ inputId:'down', state:false } );
				}
				else if(event.keyCode === 65) {
					this.socket.emit('keyPress',{ inputId:'left',state:false } );
				}
				else if(event.keyCode === 87) {
					this.socket.emit('keyPress',{ inputId:'up',state:false } );
				}
			}
		}
	}
	/**
	*
	*/
	listenForEvents() {
		this.socket.on('loginCompleted',(data) => {
			this.id = data.id;
		});
		this.socket.on('newPositions',(data) => {
			this.paint(data);
		});
		this.socket.on('chatMessage',(data) => {
			var chatMessage = document.createElement('DIV');
			var chatUser = document.createElement('DIV');
			var chatText = document.createElement('DIV');
			
			chatMessage.className = 'chatMessage';
			chatUser.className = 'chatUser';
			chatText.className = 'chatText';
			
			chatUser.innerHTML = data.user + ':';
			chatText.innerHTML = data.message;
			
			chatMessage.appendChild(chatUser);
			chatMessage.appendChild(chatText);
			
			document.getElementById('chatMessages').appendChild(chatMessage);
			
			document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
		});
		
		
	}
	/**
	*
	*/
	paint(data) {
		var viewportX = window.innerWidth / 2;
		var viewportY = window.innerHeight / 2;
		
		// Repaint canvas. Move to own function
		this.context.font= "12px Arial";
		this.context.fillStyle = '#000000';
		
		var currentPlayer = false;
		for(var i = 0 ; i < data.length; i++) {
			if (data[i].id == this.id) {
				currentPlayer = data[i];
			}
		}
		var cameraX = currentPlayer.x - viewportX;
		var cameraY = currentPlayer.y - viewportY;
		
		this.context.drawImage(this.background,0,0);
		
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
			
			this.context.rotate(-data[i].angle);
			this.context.fillStyle = '#000000';
			this.context.fillText(data[i].name,-9,shipImage.height + 11);
			this.context.fillStyle = '#FFFFFF';
			this.context.fillText(data[i].name,-10,shipImage.height + 10);
			
			this.context.restore();
		}
		this.context.fillStyle = '#FFFFFF';
		this.context.font= "16px Arial";
		
		if (isNaN(currentPlayer.y) || isNaN(currentPlayer.x)) {
			this.context.fillText('0:0',window.innerWidth - 100,window.innerHeight - 100);
		}
		else {
			this.context.fillText(Math.round(currentPlayer.x / 100) + ':' + Math.round(currentPlayer.y / 100),window.innerWidth - 100,window.innerHeight - 100);
		}
		
		// this.context.restore();
	}
}
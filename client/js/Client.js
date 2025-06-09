class Client {
	constructor() {
		this.loggedIn = false;
	}
	/**
	*
	*/
	init() {
		var socket = io();
		
		window.game = new Game();
		
		game.gui = {};
		game.gui.chat = new Chat();
		game.network = new Network();
		game.network.socket = socket;
		game.gui.miniMap = new MiniMap();
		game.input = new Input();
		game.client = this;
		game.gameCanvas = new GameCanvas();
		game.debugMessage = '';
		
		this.playersInZone = {};
		
		this.listenForEvents();
		
		game.network.lastDataReceived = false;
		
		var username = Tools.getParameterByName('username');
		
		// Check localStorage for saved username first
		if (!username) {
			username = localStorage.getItem('gameUsername');
		}
		
		if (username && username.length > 2) {
			this.loggedIn = true;
			game.network.socket.emit('login', { name: username });
		}
		else {
			Login.fadeInSplash();
		}
		window.onblur = () => { this.stopAllMovement() };
		
		document.addEventListener("mousewheel",(event) => { this.handleMouseWheel(event); }, false);
	}
	/**
	*
	*/
	handleMouseWheel(event) {
		if (event.deltaY > 0) {
			game.gameCanvas.zoomLevel -= 0.1;
		}
		else {
			game.gameCanvas.zoomLevel += 0.1;
		}
		if (game.gameCanvas.zoomLevel > 2.0) {
			game.gameCanvas.zoomLevel = 2.0;
		}
		else if (game.gameCanvas.zoomLevel < 0.1) {
			game.gameCanvas.zoomLevel = 0.1;
		}
	}
	stopAllMovement() {
		game.network.socket.emit('keyPress',{ inputId:'all', state: false } );
	}
	/**
	*
	*/
	doLogin() {
		
	}
	/**
	*
	*/
	listenForEvents() {
		game.network.socket.on('loginCompleted',(data) => {
			this.loggedIn = true;
			$('.gameLogoSplash').fadeOut('slow');
			this.id = data.id;
			
			// Save username to localStorage for future sessions
			if (data.username) {
				localStorage.setItem('gameUsername', data.username);
			}
			
			game.gui.chat.addChatMessage('System','Welcome to Primordial Prophecy. Chat by pressing enter.','#8084cc','#8084cc');
			game.input.listenForInput();
			game.gui.chat.showChat();
		});
		game.network.socket.on('syncPositions',(data) => {
			for(var i = 0 ; i < data.length; i++) {
				if (data[i].type == 'PLAYER') {
					
				}
			}
			game.network.lastDataReceived = data;
		});
		game.network.socket.on('chatMessage',(data) => {
			game.gui.chat.addChatMessage(data.user,data.message);
		});
		game.network.socket.on('playerLoggedOut',(data) => {
			console.log('log out');
			game.gui.chat.addChatMessage('System',data.name + ' logged out!');
		});
		game.network.socket.on('newPlayer',(data) => {
			console.log('log in');
			game.gui.chat.addChatMessage('System',data.name + ' logged in!');
		});
		game.network.socket.on('debug',(data) => {
			game.debugMessage = data;
		});
		game.network.socket.on('systemTransition',(data) => {
			// Trigger transition effect
			game.gameCanvas.transitionEffect.active = true;
			game.gameCanvas.transitionEffect.progress = 0;
			game.gameCanvas.transitionEffect.fromSystem = data.from;
			game.gameCanvas.transitionEffect.toSystem = data.to;
			game.gameCanvas.transitionEffect.startTime = Date.now();
		});
	}
}
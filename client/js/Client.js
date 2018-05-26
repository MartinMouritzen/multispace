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
		
		this.playersInZone = {};
		
		this.listenForEvents();
		
		var username = Tools.getParameterByName('username');
		
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
	handleMouseWheel(event) {
		if (event.deltaY > 0) {
			game.gameCanvas.zoomLevel -= 0.1;
		}
		else {
			game.gameCanvas.zoomLevel += 0.1;
		}
		if (game.gameCanvas.zoomLevel > 1.6) {
			game.gameCanvas.zoomLevel = 1.6;
		}
		else if (game.gameCanvas.zoomLevel < 0.7) {
			game.gameCanvas.zoomLevel = 0.7;
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
			game.gui.chat.addChatMessage('System','Welcome to Primordial Prophecy. Chat by pressing enter.','#8084cc','#8084cc');
			game.input.listenForInput();
			game.gui.chat.showChat();
		});
		game.network.socket.on('newPositions',(data) => {
			game.gameCanvas.paint(data);
		});
		game.network.socket.on('chatMessage',(data) => {
			game.gui.chat.addChatMessage(data.user,data.message);
		});
	}
}
class Input {
	/**
	*
	*/
	constructor() {
		this.KEY_ESCAPE = 27;
		this.KEY_ENTER = 13;
		this.KEY_D = 68;
		this.KEY_S = 83;
		this.KEY_A = 65;
		this.KEY_W = 87;
		this.KEY_SPACE = 32;
	}	
	/**
	*
	*/
	listenForInput() {
		document.onkeydown = (event) => {
			// prevent game from sending thousands of events.
			if (event.repeat != undefined && event.repeat) {
				return;
			}

			if(event.keyCode === this.KEY_ESCAPE && game.gui.chat.chatting) {
				game.gui.chat.hideInput();
				stopChat();
			}

			if(event.keyCode === this.KEY_ENTER) {
				game.gui.chat.startOrEndChat();
			}

			if (!game.gui.chat.chatting) {
				if(event.keyCode === this.KEY_D) {
					game.network.socket.emit('keyPress',{ inputId:'right', state:true } );
				}
				else if(event.keyCode === this.KEY_S) {
					game.network.socket.emit('keyPress',{ inputId:'down', state: true } );
				}
				else if(event.keyCode === this.KEY_A) {
					game.network.socket.emit('keyPress',{ inputId:'left', state: true});
				}
				else if(event.keyCode === this.KEY_W) {
					game.network.socket.emit('keyPress',{ inputId:'up', state: true});
				}
				if (event.keyCode === this.KEY_SPACE) {
					game.network.socket.emit('keyPress',{ inputId:'shoot', state: true});
				}
			}
		}
		document.onkeyup = (event) => {
			if (!game.gui.chat.chatting) {
				if(event.keyCode === this.KEY_D) {
					game.network.socket.emit('keyPress',{ inputId:'right',state: false } );
				}
				else if(event.keyCode === this.KEY_S) {
					game.network.socket.emit('keyPress',{ inputId:'down', state:false } );
				}
				else if(event.keyCode === this.KEY_A) {
					game.network.socket.emit('keyPress',{ inputId:'left',state:false } );
				}
				else if(event.keyCode === this.KEY_W) {
					game.network.socket.emit('keyPress',{ inputId:'up',state:false } );
				}
				
				if (event.keyCode === this.KEY_SPACE) {
					game.network.socket.emit('keyPress',{ inputId:'shoot', state: false});
				}
			}
		}
	}
}
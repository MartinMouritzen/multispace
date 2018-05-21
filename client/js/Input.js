class Input {
	/**
	*
	*/
	listenForInput() {
		document.onkeydown = (event) => {
			// prevent game from sending thousands of events.
			if (event.repeat != undefined && event.repeat) {
				return;
			}
			if(event.keyCode === 27 && game.gui.chat.chatting) {
				game.gui.chat.hideInput();
				stopChat();
			}
			if(event.keyCode === 13) {
				if (game.gui.chat.chatting) {
					var message = game.gui.chat.getTypedMessage();
					if (message.length > 0) {
						game.network.socket.emit('chatMessage',{ message: message });
						game.gui.chat.hideInput();
					}
					game.gui.chat.stopChat();
				}
				else {
					game.client.stopAllMovement();
					
					game.gui.chat.showInput();
					game.gui.chat.startChat();
				}
			}
			if (!game.gui.chat.chatting) {
				if(event.keyCode === 68) {
					game.network.socket.emit('keyPress',{ inputId:'right', state:true } );
				}
				else if(event.keyCode === 83) {
					game.network.socket.emit('keyPress',{ inputId:'down', state: true } );
				}
				else if(event.keyCode === 65) {
					game.network.socket.emit('keyPress',{ inputId:'left', state: true});
				}
				else if(event.keyCode === 87) {
					game.network.socket.emit('keyPress',{ inputId:'up', state: true});
				}
			}
		}
		document.onkeyup = (event) => {
			if (!game.gui.chat.chatting) {
				if(event.keyCode === 68) { // D
					game.network.socket.emit('keyPress',{ inputId:'right',state: false } );
				}
				else if(event.keyCode === 83) {
					game.network.socket.emit('keyPress',{ inputId:'down', state:false } );
				}
				else if(event.keyCode === 65) {
					game.network.socket.emit('keyPress',{ inputId:'left',state:false } );
				}
				else if(event.keyCode === 87) {
					game.network.socket.emit('keyPress',{ inputId:'up',state:false } );
				}
			}
		}
	}
}
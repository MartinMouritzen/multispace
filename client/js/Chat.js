class Chat {
	constructor() {
		$(document).ready(() => {
			this.chatInput = document.getElementById('chatInput');
		});
	}
	startChat() {
		this.chatting = true;
	}
	stopChat() {
		this.chatting = false;
	}
	chatBlurred() {
		this.hideInput();
		this.stopChat();
	}
	showChat() {
		$('#chat').fadeIn('slow');
	}
	startOrEndChat() {
		if (this.chatting) {
			var message = this.getTypedMessage();
			if (message.length > 0) {
				game.network.socket.emit('chatMessage',{ message: message });
			}
			this.hideInput();
			this.stopChat();
		}
		else {
			game.client.stopAllMovement();
			
			this.showInput();
			this.startChat();
		}
	}
	/**
	*
	*/
	getTypedMessage() {
		return this.chatInput.value;
	}
	/**
	*
	*/
	hideInput() {
		this.chatInput.style.display = 'none';
		this.chatInput.value = '';
		this.chatInput.blur();
	}
	showInput() {
		this.chatInput.style.display = 'block';
		this.chatInput.focus();
	}
	addChatMessage(user,message,userColor = false,messageColor = false) {
		var chatMessage = document.createElement('DIV');
		var chatUser = document.createElement('DIV');
		var chatText = document.createElement('DIV');
		
		chatMessage.style.display = 'none';
		
		chatMessage.className = 'chatMessage';
		chatUser.className = 'chatUser';
		chatText.className = 'chatText';
		
		if (userColor) {
			chatUser.style.color = userColor;
		}
		if (messageColor) {
			chatText.style.color = messageColor;
		}
		
		chatUser.innerHTML = user + ':';
		chatText.innerHTML = message;
		
		chatMessage.appendChild(chatUser);
		chatMessage.appendChild(chatText);
		
		document.getElementById('chatMessages').appendChild(chatMessage);
		
		$(chatMessage).fadeIn('fast',() => {
			document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
		});
	}
}
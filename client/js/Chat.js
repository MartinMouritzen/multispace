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
		
		document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
	}
}
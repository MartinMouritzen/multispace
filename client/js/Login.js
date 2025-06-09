class Login {
	static fadeInSplash() {
		$('#loginOverlay').fadeIn(2000);
		$('.gameLogoSplash').fadeIn(2000,() => {
			setTimeout(() => {
				$('.gameLogoSplash').fadeOut(2000,() => {
					$('#loginScreen').fadeIn('slow');
				});
			},1000);
		});
	}
	/**
	*
	*/
	static loginFromForm() {
		var username = $('#username').val();
		if (username.length > 2 && username.length < 10) {
			// Save to localStorage immediately when form is submitted
			localStorage.setItem('gameUsername', username);
			game.network.socket.emit('login', { name: username });
			this.removeLoginScreen();
		}
	}
	static removeLoginScreen() {
		$('#loginScreen').fadeOut('slow');
		$('#loginOverlay').fadeOut('slow');
	}
}
class MiniMap {
	paint(context) {
		this.context.save();
		var miniMapWidth = 200;
		var miniMapHeight = 200;
		var miniMapScale = 0.05;
		
		this.context.translate(window.innerWidth - miniMapWidth,0);
		

		this.context.fillStyle = '#000000';
		this.context.fillRect(window.innerWidth - miniMapWidth,0,miniMapWidth,miniMapHeight);
		this.context.globalAlpha = 0.8;
		this.drawImageProp(this.context,this.background,0,0,miniMapWidth,miniMapHeight);
		this.context.globalAlpha = 1;
		
		// this.context.translate(10 - cameraX,10 - cameraY);
		this.context.drawImage(this.planet1,10 - (cameraX * miniMapScale),10 - (cameraY * miniMapScale),this.planet1.width * miniMapScale,this.planet1.height * miniMapScale);
		this.context.restore();
	}
}
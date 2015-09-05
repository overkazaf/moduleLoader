;!function (window){
	function ALERT (msg) {
		alert('msg from module$ :' + msg);
	}
	window.ALERT = ALERT;
}(window);
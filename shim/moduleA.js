!function(root){
	function ALERT(msg){
		alert('Message from shim:' + msg);
	};
	root.ALERT = ALERT;
}(window);
!function(root){
	function ALERT(msg){
		alert('Message from shim:' + msg);
	};
	alert('load');
	root.ALERT = ALERT;
}(window);
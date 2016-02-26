var has_focus = true;
function loading_time(callback) {
    if(has_focus==true) callback(true);
    else callback(false);
	setTimeout(loading_time, 2000);
}
window.onblur = function(){  
    has_focus=false;  
}  
window.onfocus = function(){  
    has_focus=true;  
}
window.onload = function(){
    setTimeout(loading_time, 2000);
}
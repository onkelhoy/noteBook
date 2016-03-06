$(document).ready(function(){
	socket = io('/');
	socket.on('setup', setup);
	socket.emit('getsetup', ID);

	function setup(data){
		console.log(data);
		if(data.sessions != null){
			for(var i = 0; i < data.sessions.length; i++){
				var active = 'klar för rättning';
				var aClass = 'text-blue';

				if(data.sessions[i].active == 0) { active = 'inte aktiverad'; aClass = 'text-red'; }
				else if(data.sessions[i].active == 1) { active = 'aktiverad'; aClass = 'text-warning';  }

				$('ul').append($('<li></li>')//modify to a ul later so time can be added (with design)
					.attr('id', data.sessions[i].id)
					.append($('<span></span>').append($('<i class="fa fa-circle"></i>').addClass((aClass == 'text-warning') ? 'text-yellow' : aClass)).append(data.sessions[i].name))
					.append($('<span></span>').append($('<span></span>').addClass(aClass).text(active))
						.append($('<span></span>').text('tid kvar: ')
							.attr('end', data.sessions[i].endTime)
							.attr('start', data.sessions[i].startTime)
							.attr('active', data.sessions[i].active)
							.addClass('timer')))
					.click(function(){
						window.location.href = "session/"+$(this).attr('id');
					}));
			}
		}
		$('span.timer').each(function(){ setTime($(this)); }); //setup

		setInterval(function(){
			$('span.timer').each(function(){
				setTime($(this));
			});
		}, 15000);
	}

	

	$('header').click(function(){
		if($('ul').attr('clicked') == 0){
			$('ul').attr('clicked', 1);
			$('ul').slideDown('fast');
		}
		else {
			$('ul').attr('clicked', 0);
			$('ul').slideUp();
		}
	});
});
var k = 0;
function setTime(elm){
	var m = elm.attr('end');
	var until = new Date(Number(m));
	until.setDate(until.getDate() + 30);

	var timeLeft = getTime(until);
	if(elm.attr('active') == 0) { timeLeft = getTime(new Date(Number(elm.attr('start')))); }
	else if(elm.attr('active') == 1) { timeLeft = getTime(new Date(Number(elm.attr('end')))); }

	elm.text('tid kvar: ' + timeLeft);
	if(timeLeft == '0min'){
		var li = elm.parent().parent();
		var active = '';
		var aClass = '';

		if(elm.attr('active') == 0) { 
			elm.attr('active', 1);
			li.children('span').first().children('i').removeClass('text-red');
			active = 'aktiverad'; aClass = 'text-warning';
		}
		else if(elm.attr('active') == 1) { 
			elm.attr('active', 2);
			li.children('span').first().children('i').removeClass('text-warning');
			active = 'klar för rättning'; aClass = 'text-blue';
		}
		else {
			elm.attr('active', 3);
		}

		li.children('span').first().children('i').addClass((aClass == 'text-warning') ? 'text-yellow' : aClass);
		li.children('span').eq(1).children('span').first().addClass(aClass).text(active);//kolla om de buggar

		if(elm.attr('active') == 3) {//remove, the time has passed
			li.remove();
		}
		else {
			setTime(elm);
		}
	}
}
function getTime(until){
	var time = getTimeRemaining(until);

	var display = "";
	if(time.hours >= 1) {
		if(time.days >= 1){
	    	display += time.days+"d ";
	    }
	    display += (time.hours + 1) + "h";
	} else { display += time.minutes + "min"; }

	return display;
}

function getTimeRemaining(endtime){
  var t = Date.parse(endtime) - Date.parse(new Date());
  var seconds = Math.floor( (t/1000) % 60 );
  var minutes = Math.floor( (t/1000/60) % 60 );
  var hours = Math.floor( (t/(1000*60*60)) % 24 );
  var days = Math.floor( t/(1000*60*60*24) );
  return {
    'total': t,
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
}
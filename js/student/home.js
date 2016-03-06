$(document).ready(function(){
  $('li').click(function(){
    window.location.href = "session/"+$(this).attr('index');
  });

  $('span.time').each(function(){ setTime($(this)); });//startup
  
  setInterval(function(){  //timer
    $('span.time').each(function(){
       setTime($(this));
    });
  }, 15000);//countdown
});

function setTime(tspan){
  var time = getTimeRemaining(tspan.attr('end'));
  var Ielm = tspan.parent().parent().children('i');

  var display = "";
  if(time.hours >= 1) {
    if(time.days >= 1){
      display += time.days+"d ";
      if(!Ielm.hasClass('text-blue')){
        Ielm.addClass('text-blue');
      }
    }
    else {
      if(!Ielm.hasClass('text-yellow')){
        Ielm.removeClass('text-blue');
        Ielm.addClass('text-yellow');
      }
    }
    display += time.hours + "h ";
  }
  else {
      if(!Ielm.hasClass('text-red')){
        Ielm.removeClass('text-yellow');
        Ielm.addClass('text-red');
      }
    if(time.minutes <= 0){
      //remove
      tspan.parent().parent().remove();
    }
  }
  if(time.minutes != 0 && time.days == 0) display += time.minutes + "min";
  tspan.text(display);
}

function getTimeRemaining(endtime){
  var t = new Date(Number(endtime)) - Date.parse(new Date());
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
function createPDF(data, callback){
	var body = $('<body></body>');
	// body.append($('<link rel="stylesheet" media="print">').attr('href', 'des.css'));
	body.append($('<style></style>').text(''+
'section > h1 {'+
'	color: #663CA3;'+
'}'+
'section > p {'+
'	color: #663CA3;'+
'	font-size: 14pt;'+
'	font-style: bold;'+
'	font-family: Arial, Helvetica, sans-serif;'+
'	position: relative;'+
'}'+
'section > div {'+
'	color: #222;'+
'	position: absolute;'+
'	left: 45px;'+
'	width: 200px;'+
'}'+
'article > p > div {'+
'	text-align: justify;'+
'	padding-left: 15px;'+
'}'+
'label {'+
'	color: #663CA3;'+
'	font-size: 14pt;'+
'	font-style: bold;'+
'	font-family: Arial, Helvetica, sans-serif;'+
'}'+
'a{'+
'	color: blue;'+
'	text-decoration: underline;'+
'}'));
	var header = $('<section></section>');
	var start = new Date(Number(session.startTime)), end = new Date(Number(session.endTime));
	var time = start.displayDate() + " - " + end.displayDate();

	header.append($('<h1></h1>').text(session.name));//.css({'color': '#663CA3', 'font-size': '14pt', 'margin': '10px auto'})
	header.append($('<p></p>').text('Lärare')).append($('<div></div>').append(data.teachername + " - ").append($('<a></a>').text('add teacher mail')));//.css({'display':'block', 'color': '#663CA3', 'width': '50px', 'float':'left'}))
	header.append($('<p></p>').text('Namn')).append($('<div></div>').text(session.name));//.css({'display':'block', 'color': '#663CA3', 'width': '50px', 'float':'left'}))
	header.append($('<p></p>').text('Tid')).append($('<div></div>').text(time));//.css({'display':'block', 'color': '#663CA3', 'width': '50px', 'float':'left'}))
	header.append($('<p></p>').text('Antal ord')).append($('<div></div>').text(session.wordcount));//.css({'display':'block', 'color': '#663CA3', 'width': '50px', 'float':'left'}))
	header.append($('<p></p>').text('Uppgift')).append($('<div></div>').text(session.task));//.css({'display':'block', 'color': '#663CA3', 'width': '50px', 'float':'left'}))
	var hUl = $('<ul></ul>');
	// console.log(data);
	for(var i = 0; i < classes.length; i++){
		hUl.append($('<li></li>').text(classes[i].name));
	}
	header.append($('<p></p>').text('Klasser'));
	header.append(hUl);

	var _classes = $('<article></article>');
	for(var i = 0; i < classes.length; i++){
		_classes.append($('<br></br>'));
		_classes.append($('<br></br>'));
		_classes.append($('<h2 class="classHead"></h2>').text(classes[i].name));
		for(var j = 0; j < data.length; j++){
				console.log(data[j]);
			if(data[j] != null && data[j].class == classes[i].id){
				_classes.append($('<br></br>'));
				_classes.append($('<br></br>'));
				_classes.append($('<br></br>'));
				_classes.append($('<br></br>'));
				_classes.append($('<br></br>'));
				var _elev = $('<div></diV>'), _word = $('<div></diV>');
				_elev.append($('<label></label>').text('Elev - '));
				_elev.append($('<span></span>').append(data[j].name + " - ").append($('<a></a>').text(data[j].mail)));

				_word.append($('<label></label>').text('Ord - '));
				_word.append($('<span></span>').text(data[j].words + "/" + session.wordcount));

				_classes.append(_elev);
				_classes.append($('<br></br>'));
				_classes.append(_word);
				_classes.append($('<br></br>'));

				_classes.append($('<label></label>').text('Text'));
				_classes.append($('<div></div>').append(data[j].text));
				//add comments
				var comElm = $('<ol></ol>');
				var comments = data[j].comments.split('#');
				if(comments.length > 1){
					for(var k = 0; k < comments.length; k++){
						var d = comments[k].split('^');
						var li = $('<li></li>');
						var comTxt = comments[k];
						var comName = data[j].name;
						if(d.length > 1){
							comName = d[0];
							comTxt = d[1];
						}
						li.append($('<strong></strong>').text(comName + ' - '));
						li.append($('<span></span>').text(comTxt));
						comElm.append(li);
					}
				}
				else {
					comElm.append($('<li>Inga kommentarer</li>'));
				}
				_classes.append($('<br></br>'));
				_classes.append($('<br></br>'));
				_classes.append($('<br></br>'));
				_classes.append($('<label></label>').text('Kommentarer'));
				_classes.append(comElm);
				_classes.append('<!-- ADD_PAGE -->');
			}
		}
	}
	var footer = $('<div></div>');
	footer.append($('<h3></h3>').text('a noteBook product'));
	var today = new Date();
	footer.append($('<span></span>').text(' skapad - ' + today.displayDate()));
	header.append($('<br></br>'));
	header.append($('<br></br>'));
	header.append($('<br></br>'));
	header.append(footer);
	header.append('<!-- ADD_PAGE -->');
	body.append(header);
	body.append(_classes);
	
	callback(body);
}

Date.prototype.displayDate = function() {
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
	var dd  = this.getDate().toString();
	var h = this.getHours().toString();
	var m = this.getMinutes().toString();
	var s = this.getSeconds().toString();
	return yyyy +"-"+ (mm[1]?mm:"0"+mm[0]) +"-"+ (dd[1]?dd:"0"+dd[0]) + " " + (h[1]?h:"0"+h)+":"+(m[1]?m:"0"+m); // padding
};
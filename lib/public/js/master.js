var selectedTrack = null;

function startTrack ( i ) {
	
	ms.load(i,function(data) {
			
		if ( data == null ) {
			
			$('.list').fadeOut(200,function() {
		
				$('.single').fadeIn();	
				
				ms.on('speakerCount',function(data) {
					$('.ready').html(data);
				});
				
			});
			
		} else {
			
			/*
				Something went horribly wrong.
				Probably nuclear war/alien invasion or an attack of Nazi zombies.
			*/
			
		}
		
	});
	
}

ms.on('speakerCount',function(data) {
	console.log('Tagastab: ' + data);
	$('.speakerCount').html(data);
});

function getTracks() {
	
	ms.allTracks( function(tracks) {
	
		console.log(tracks);
		
		for ( var i in tracks ) {
			
			//Update songs list
	
			var node = $('<li></li>');
			
			var link = $('<a></a>');
			link.attr('href',"Javascript:startTrack('" + i + "');");
			
			var trackTitle = $('<div></div>');
			trackTitle.attr('class','trackTitle');
			trackTitle.html(tracks[i].name);
			
			var trackAuthor = $('<div></div>');
			trackAuthor.attr('class','trackTitle');
			trackAuthor.html(tracks[i].author);
			
			var speaker = $('<img>');
			speaker.attr('src','img/speaker.png');
			
			var trackTime = $('<div></div>');
			trackTime.attr('class','time');
			trackTime.html(tracks[i].time);
			
			link.append(trackTitle);
			link.append(trackAuthor);
			link.append(speaker);
			link.append(trackTime);
			
			node.append(link);
			
			$('.list ul').append(node);
			
		}
	
	});
	
}

function play() {
	
	if ( selectedSong != null ) {
		
		ms.play(selectedTrack,function(data) {
			
			if ( data != null ) {
				console.log('Kala play funktsioonis on');
			}
			
		});
		
	}
	
}

function stop() {
	
	if ( selectedSong != null ) {
		
		ms.stop(selectedTrack,function(data) {
			
			if ( data != null ) {
				console.log('Kala stop funktsioonis on');
			}
			
		});
		
	}
	
}
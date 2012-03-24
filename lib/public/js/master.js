var selectedTrack = null;

ms.socket.on('speakerCount',function(data)) {
	$('.speakerCount').html(data);
}

function getTracks() {
	
	var tracks = ms.allTracks();
	
	for ( var i=0,max=tracks.length; i<max; ++i ) {
		
		//Update songs list
		
		var node = $('<li></li>');
		node.append('<div class="title" id="' + tracks[i].id + '">'  tracks[i].name + '</div>');
		
		node.click(function() {
			
			ms.load(tracks[i].id,function(data) {
				
				if ( data == null ) {
					
					$('.list').fadeOut(200,function() {
				
						$('.single').fadeIn();	
						
						ms.socket.on('speakerCount',function(data)) {
							$('.ready').html(data);
						}
						
					});
					
				}
				
			} else {
				
				/*
					Something went horribly wrong.
					Probably nuclear war/alien invasion or an attack of Nazi zombies.
				*/
				
			}
			
		});
		
		$('.list ul').append(node);
		
	}
	
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
var selectedTrack = null;
var tracksList = null;

function startTrack ( i ) {

	ms.load(i,function(data) {

		if ( data == null ) {

			selectedTrack = i;

			$('.list').fadeOut(200,function() {

				$('.single').fadeIn();
				$('.listHeader').hide();
				$('.singleHeader').show();

				$('.trackTitle').html(tracksList[i].name);
				$('.trackAuthor').html(tracksList[i].author);
				$('.name').html(tracksList[i].time);

				$('.play').bind('touchstart click',function() {
					$('.play').hide();
					$('.ready').show();
					play();
				});

				$('.stop').bind('touchstart click',function() {
					$('.ready').hide();
					$('.play').show();
					stop();
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

ms.on('loadedCount',function(data) {
	console.log('Tagastab: ' + data);
	$('.wait').html(data);
});


function getTracks() {

	ms.allTracks( function(tracks) {

		tracksList = tracks;

		$('.list ul').empty();

		for ( var i in tracks ) {

			//Update songs list

			var node = $('<li></li>');

			var link = $('<a></a>');
			link.attr('href',"javascript:startTrack('" + i + "');");
			link.attr('ontouchstart',"javascript:startTrack('" + i + "');");

			var trackTitle = $('<div></div>');
			trackTitle.attr('class','trackTitle');
			trackTitle.html(tracks[i].name);

			var trackAuthor = $('<div></div>');
			trackAuthor.attr('class','trackTitle');
			trackAuthor.html(tracks[i].author);

			var speaker = $('<img>');
			speaker.attr('src','/img/speaker.png');

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

	if ( selectedTrack != null ) {

		ms.play(selectedTrack,function(data) {

			if ( data != null ) {
				console.log('Kala play funktsioonis on');
			}

		});

	}

}

function stop() {

	if ( selectedTrack != null ) {

		ms.stop(selectedTrack,function(data) {

			if ( data != null ) {
				console.log('Kala stop funktsioonis on');
			}

		});

	}

}

$(function() {
	$('.back').bind('touchstart click', function() {
		$('.single').fadeOut(200,function() {
			getTracks();
			$('.list').fadeIn();
			$('.listHeader').show();
			$('.singleHeader').hide();

		});
	});
});


(function() {

	var settings = {

		resources: [
			'../demo/media/spritemap-cajon.ac3',
			'../demo/media/spritemap-cajon.mp3',
			'../demo/media/spritemap-cajon.m4a',
			'../demo/media/spritemap-cajon.ogg',
			'../demo/media/spritemap-cajon.amr'
		],

		spritemap: {
			bgmusic: {
				start: 0.00,
				end: 4.20,
				loop: true
			},
			effect: {
				start: 5.00,
				end: 9.30
			}
		}

	};

	var getInitCode = function() {
		return "var player = window.demo = new jukebox.Player(" + JSON.stringify(settings) + ");";
	};

	var makeExecutable = function(element, init, player) {

		var evalText = '';
		if (init === true) {
			evalText += getInitCode(player === true) + '\n';
		}

		evalText += element.innerText;

		var div = document.createElement('div');
		div.className = 'executable-menu';

		var button = document.createElement('button');
		button.innerHTML = 'Run demo code';
		button.onclick = function() {
			eval(evalText);
		};
		div.appendChild(button);

		var button2 = document.createElement('button');
		button2.innerHTML = 'Stop demo code';
		button2.onclick = function() {
			window.demo.stop();
			window.demo = null;
		};
		div.appendChild(button2);

		element.parentNode.insertBefore(div, element.nextSibling);

	};

	var elements = document.getElementsByTagName('pre');

	for (var e = 0, el = elements.length; e < el; e++) {

		var element = elements[e];


		var str = element.innerText || element.innerHTML,
			lines = str.split(/\n/),
			margin = new RegExp(lines[0].split(/window\.demo|var\splayer/)[0]);

		str = '';
		for (var l = 0, ll = lines.length; l < ll; l++) {

			var line = lines[l].replace(/\t/g,'  ');
			line.replace(margin, '');
			str += line + '\n';

		}

		element.innerText = str;


		if (element.className.match(/executable/)) {
			makeExecutable(element, !!element.className.match(/init/), !!element.className.match(/player/));
		}

	}

})();




var Sequencer = function(settings, jukeboxSettings) {

	this.settings = {};

	for (var d in this.defaults) {
		this.settings[d] = this.defaults[d];
	}

	for (var s in settings) {
		this.settings[s] = settings[s];
	}

	this.jukeboxSettings = jukeboxSettings || null;

	this.__jukeboxes = {};
	this.__timeline = {};

	this.__intervalId = null;

	this.__init();

};



Sequencer.prototype = {

	defaults: {
		sequenceLength: 3500,
		onended: function() {
			console.log('onended');
		},
		onsequencechange: function(sequence) {
			console.log('onsequencechange', sequence);
		}
	},


	__init: function() {

		for (var j in this.jukeboxSettings) {
			this.__jukeboxes[j] = new jukebox.Player(this.jukeboxSettings[j]);
			this.__timeline[j] = {};
		}


	},

	__generateTimelineActions: function() {

		var sequenceLength = this.settings.sequenceLength,
			timelineActions = [],
			lastSequenceId = 0; // required for overall length calculation

		for (var trackId in this.__timeline) {

			for (var sequenceId in this.__timeline[trackId]) {

				var when = parseInt(sequenceId, 10) * sequenceLength,
					what = this.__timeline[trackId][sequenceId];

				timelineActions.push({
					who: trackId,
					when: when,
					what: what,
					fired: false
				});

				if (parseInt(sequenceId, 10) > lastSequenceId) {
					lastSequenceId = parseInt(sequenceId, 10);
				}

			}

		}


		// Hint: sequences begin with sequenceId 0!
		this.__timelineLength = lastSequenceId * sequenceLength + sequenceLength;
		this.__timelineActions = timelineActions;

	},



	/*
	 * PUBLIC API
	 */


	play: function() {

		if (this.__intervalId !== null) {
			return false;
		}


		// First, make sure we are up2date with UI
		this.__generateTimelineActions();

		var started = Date.now ? Date.now() : +new Date(),
			jukeboxes = this.__jukeboxes;
			timelineActions = this.__timelineActions,
			timelineLength = this.__timelineLength,
			sequenceLength = this.settings.sequenceLength,
			lastCurrentSequence = undefined;
			that = this;


		this.__intervalId = window.setInterval(function() {

			var now = Date.now ? Date.now() : +new Date(),
				current = (now - started) % timelineLength,
				currentSequence = Math.floor(current / sequenceLength);


			if (lastCurrentSequence !== currentSequence) {
				that.settings.onsequencechange && that.settings.onsequencechange(currentSequence);
				lastCurrentSequence = currentSequence;
			}

			for (var t = 0, l = timelineActions.length; t < l; t++) {
				var action = timelineActions[t];
				if (current >= action.when && action.fired === false) {
					jukeboxes[action.who].play(action.what, true);
					action.fired = true;
				}
			}

		}, 50);


		this.__timeoutId = window.setTimeout(function() {

			window.clearInterval(that.__intervalId);
			that.__intervalId = null;
			that.__timelineActions = null;
			that.settings.onended && that.settings.onended();

		}, timelineLength);


		return true;

	},

	stop: function() {

		if (this.__intervalId) {
			window.clearInterval(this.__intervalId);
			that.__intervalId = null;
		}

		if (this.__timeoutId) {
			window.clearTimeout(this.__timeoutId);
			that.__timeoutId = null;
		}

	},

	set: function(jukeboxId, sequence, value) {

		var jukebox = this.__jukeboxes[jukeboxId];
		if (jukebox !== undefined) {
			if (jukebox.settings.spritemap[value] !== undefined) {
				this.__timeline[jukeboxId][sequence] = value;
				return true;
			}
		}

		return false;

	}


};




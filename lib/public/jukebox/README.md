
Zynga's Jukebox (v1.0)
======================

The Jukebox is a component for playing sounds and music with the usage of sprites with a special
focus on performance and cross-device deployment. It is known to run even on Android 1.6+ devices
and needs very few resources compared to other solutions on the web.


Features
--------

* Targets low-end devices and mobile platforms
* HTML5 Audio
* Flash Audio as fallback (support for Android 1.6)
* Sound-Spritemap Entries for easier playback
* Multiple Jukeboxes for parallel playback



**Jukebox Manager adds the following features:**

* Codec Detection
* Feature Detection
* Automatic Work Delegation for busy Jukeboxes
* Automatic Stream Correction (useful for slow implementations)
* Automatic Looping for Sound-Spritemap entries
* Playback of Background Music

**Using Jukebox without Jukebox Manager:**

It is not recommended to use Jukebox without the Jukebox Manager, but it's still possible.
The Jukebox Manager offers Codec and Feature detection - to determine which kind of audio codecs will playback properly
in your environment. If you want to still use Jukebox without Jukebox Manager, you will have to set *resources* to
an Array containing only one resource.


Upcoming Features
-----------------

* Dynamic balancing of free clones at runtime


Documentation
-------------

There's a huge [documentation of Jukebox](http://zynga.github.com/jukebox/) available at github pages.
You are invited to read it, there are also many try-it-yourself demos.

The documentation is also attached in the /doc folder if you clone the git repository.


Known Issues (iOS)
------------------

iOS has a huge delay when using an encoded format for playback. That's because of their iTunes-using implementation.
You can fix these delays using an AIFF container with IMA4 encoding. These are called *Core Audio Files* then.

Also, the music spritemap will continue playback if the display is turned off and the JavaScript runtime was stopped.
This is a known issue and is reported to the iOS developers. Additionally, iOS' security model prevents a website from
playing sounds without prior user interaction.

Further there is only the capability of playing back one sound in parallel on iOS.

Please take a look at both the [iOS demo](http://zynga.github.com/jukebox/demo/ios.html) and the
[iOS AIFF demo](http://zynga.github.com/jukebox/demo/ios-aiff.html) to see the difference in playback latencies and to
find out how you can solve all these issues with sound on iOS.


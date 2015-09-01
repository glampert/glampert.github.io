---
layout:     post
title:      Extracting GTA Vice City Radio Stations & Soundtracks
date:       '2014-12-26T19:42:00.001-08:00'
author:     Guilherme Lampert
categories: Miscellaneous Reverse-Engineering
thumbnail:  vc-radio
---

My favorite Grand Theft Auto game to this date is still the [Vice City episode](https://en.wikipedia.org/wiki/Grand_Theft_Auto:_Vice_City).
One of the coolest things in the game is its awesome 80's soundtrack and the hilarious Radio Station DJ parodies.

![GTA - Vice City]({{ "/static/images/posts/vc-radio.jpeg" | prepend: site.baseurl }} "Vice City, possibly the best GTA soundtracks to date.")

We can easily find the Radio Stations and soundtracks of the game on YouTube, though sometimes it is handy to have them
in your local storage or sometimes you are cut-off from the Internet but would still enjoy an 80's throwback.

Recently, I had some spare time and decided to do a quick research to figure out if I could extract the songs from
my local copy of the game. It turns out that each Radio Station is stored entirely inside an ADF file.
These ADF files happen to be MP3 files that had every byte `XORed` with the decimal constant `34`.

With that knowledge acquired, in a couple hours I coded [this simple C++ command line tool](https://bitbucket.org/glampert/adf2mp3)
that reads an ADF from disk and produces a playable MP3 from it. I've included a Unix makefile in the repository above,
as well as a Windows pre-built executable in the `bin/` folder.

This tool can be used from the command prompt as such:

> `$ ./adf2mp3 flash.adf`

Looks for the file `flash.adf` in the current directory and writes a file named `flash.mp3` to the current
directory as its output. You can also provide an explicit output filename as the last parameter:

> `$ ./adf2mp3 flash.adf flash_fm_radio.mp3`

To print basic help and tool info, run:

> `$ ./adf2mp3 --help`

The application source code is released as Public Domain.
Everything is contained in a single source file: `adf2mp3.cpp`.

----

ADF files with the Radio Stations can be found in the directory:

> `{INSTALL_PATH}/Rockstar Games/Grand Theft Auto Vice City/audio`

of your local copy of the game (for the Steam version of the game, at least).


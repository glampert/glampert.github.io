---
layout:       post
title:        Projects
permalink:    /projects/
menu_index:   1
menu_visible: true
---

* Contents
{:toc}

This is my personal portfolio page where some of my projects are showcased.
I'm a supporter of Open Source Software, so you can find source code available
with an unrestrictive license for all of them.

- [GitHub page](https://github.com/glampert)

- [Bitbucket page](https://bitbucket.org/glampert/)

----

## Debug Draw Library

<div class="slideshow-container"><div class="slideshow-img-list">
<img defpath="{{ "/static/images/slides/debug-draw-s1.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/debug-draw-s2.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/debug-draw-s3.jpeg" | prepend: site.baseurl }}">
</div></div>

Debug Draw is an immediate-mode-ish, renderer agnostic, lightweight debug drawing API for C++.
It is a single source file Public Domain library that provides simple and fast lines, points
and text drawing for visual debugging of 3D scenes and games. Its main goal is to be as easy as
possible to integrate with your own code, so it consist of a single header file that can also
act as the implementation (when a given preprocessor is defined), so you should be able to just
drop the file into your project's directory, `#include` it and be done. Integrating with the renderer
of your choice should also be easy, all you have to do is implement a small interface class
and give the library a pointer to your implementation. The library is designed around a procedural
style similar to the old fixed-function OpenGL, but it batches draw calls under the hood for
better performance. Memory footprint is also small and configurable by the user code.

Library source is Public Domain and available on [GitHub](https://github.com/glampert/debug-draw).
You'll also find detailed documentation and usage examples in the source code repository.

----

## PlayStation 2 Homebrew

<div class="slideshow-container"><div class="slideshow-img-list">
<img defpath="{{ "/static/images/slides/ps2-homebrew-s1.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/ps2-homebrew-s2.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/ps2-homebrew-s3.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/ps2-homebrew-s4.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/ps2-homebrew-s5.jpeg" | prepend: site.baseurl }}">
</div></div>

Reverse engineering and retro-programming are two areas of interest, so in early 2015 I did some experimenting with
homebrew development for the PlayStation 2 Console, using only the freely available tools and software provided by the
[PS2 DEV](https://github.com/ps2dev) community. One of the outcomes of this project was the demo that you can see in
the images above, which I call "The Dungeon Game". It is a third-person action game, inspired by classics like *Diablo*
and *Dungeon Siege*.

Very far from a complete game, but playable. Source code and other technical details can be found [here](https://bitbucket.org/glampert/ps2dev-tests).
I have also written a couple posts about the development process, which you can find in the blog
section of this site under the *Playstation-2* category.

Gameplay recorded from the PCSX2 Emulator:

- [A simple test level](https://youtu.be/kM_C4iHzdNQ)

- [The Dungeons level](https://youtu.be/qrPz5AMEOUM)

- [The Graveyard level](https://youtu.be/pK5r_wBrzcM)

----

## WebGL Lightsaber and demos

<div class="slideshow-container"><div class="slideshow-img-list">
<img defpath="{{ "/static/images/slides/lightsaber-s1.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/lightsaber-s2.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/lightsaber-s3.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/lightsaber-s4.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/lightsaber-s5.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/webgl-md5viewer-s1.jpeg" | prepend: site.baseurl }}">
</div></div>

To commemorate the announcement of a new *Star Wars* movie (Episode VII - The Force Awakens), I coded a browser
based WebGL Lightsaber app. It features the iconic Lightsaber sounds and mouse/touch interaction. Other technical
goodies include: glow effect for the laser blade (AKA Light Bloom), trail rendering with Polyboards, anisotropic
shading for the handle (brushed metal shader) and screen space anti-aliasing using FXAA. Since I already had my hands
at work with JavaScript and WebGL, I ended up coding a tiny rendering framework and other demos with it, which can all
be found at the [source code repository](https://bitbucket.org/glampert/webgl-tests).

The live Lightsaber demo can be found [here]({{ "/static/webgl/lightsaber.html" | prepend: site.baseurl }});
Other WebGL tests and demos, including a viewer for Doom 3 models, can be found
[here]({{ "/webgl/" | prepend: site.baseurl }}). Make sure to open them on a WebGL
capable Browser, like Chrome, Firefox or an up-to-date version of Safari.

Search the blog section of this site for the *WebGL* category to read more about this.

----

## Space Sim Game

<div class="slideshow-container"><div class="slideshow-img-list">
<img defpath="{{ "/static/images/slides/scs-s1.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/scs-s2.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/scs-s3.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/scs-s4.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/scs-s5.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/scs-s6.jpeg" | prepend: site.baseurl }}">
</div></div>

This project was an assignment from a University class about Game Design and Multiplayer.
My inspiration here was in games like *Freelancer* and *Wing Commander*. It is playable on PC and Mac, using keyboard/mouse
or an Xbox controller. The multiplayer element is in the possibility to play it in split-screen mode with another local player.
Initially I intended to also allow for multiplayer over the Internet, but I never got around finishing the net code before
submitting the project. The game was written mostly in C++, with a few bits of C and Lua as well.

It uses Core OpenGL 3+ for rendering. The lush backgrounds and planets you can see in the images above are just cubemaps,
not actual geometry. The asteroids and props are real 3D models. Never got around implementing sound either, so playing
it is a silent, self-reflection experience... This game was written at a time when I was shifting coding styles and still
getting used to C++11, so overall, at the end I was not very pleased with the code and that contributed for me not taking
the project any further. Project source is available [here](https://bitbucket.org/glampert/space-sim).

----

## Virtual Texturing on iOS with OpenGL-ES

<div class="slideshow-container"><div class="slideshow-img-list">
<img defpath="{{ "/static/images/slides/vt-ios-s1.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/vt-ios-s2.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/vt-ios-s3.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/vt-ios-s4.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/vt-ios-s5.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/vt-ios-s6.jpeg" | prepend: site.baseurl }}">
</div></div>

This was the final project for my Game Development course in Brazil. I implemented a "traditional" Virtual Texturing (VT)
system on OpenGL-ES for the iOS/Apple platform. Virtual Texturing, or ["MegaTextures"](https://en.wikipedia.org/wiki/MegaTexture)
as it was popularized by John Carmack when still working at idSoftware, is an advanced texture atlasing technique that implements
a texture streaming setup analogous to Virtual Memory, thus allowing for ridiculously large texture data sets, in the tens of Gigabytes ballpark.

Virtual Texturing is an interesting approach to the management and use of large texture databases for real-time applications,
however, it is also very hard to get it right and working fast enough to be shippable, so it is only really worth the trouble
for games and applications that need to render a lot of hi-res texture data. I can see some use for it on mobile platforms though.
Mobile devices still have limited main memory but fair amounts of offline storage, plus fast Internet connections to allow for
on-the-fly downloading of textures...

Source code for the project is available [here](https://bitbucket.org/glampert/vt-mobile). I've also recorded
a [short video](https://youtu.be/sWz45m0QKj4) on the iOS Simulator. It runs with a very low frame-rate on the Sim,
but you can get a better idea of how it works from the video. The demos run quite smoothly on an actual device.

----

## Oldschool Space Shooter Game

<div class="slideshow-container"><div class="slideshow-img-list">
<img defpath="{{ "/static/images/slides/ossg-ios-s1.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/ossg-ios-s2.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/ossg-ios-s3.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/ossg-ios-s4.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/ossg-ios-s5.jpeg" | prepend: site.baseurl }}">
</div></div>

Or OSSG for short, is a side scrolling space shooter game for iOS. This game was also built as a class assignment for my Game Development
course in Brazil. It uses the Objective-C version of the Cocos2D library, plus some raw OpenGL-ES for the 3D elements. The in-game background
scene is animated with planets and randomly spawned asteroids. The main game itself is comprised of 2D sprites drawn as overlays on top of
the 3D background. This game was my first experience with iOS dev and Objective-C programming. By the end of the iOS programming unit,
the game was more or less done but not polished enough to be launched, plus then I didn't have a developer license either, so it never
got published on the App Store.

You can watch a short gameplay video [here](https://youtu.be/YQTbddA4IYw).
Source code [is also available](https://bitbucket.org/glampert/ossg).

----

## Simple 3D scene editor, AKA `l3d`

<div class="slideshow-container"><div class="slideshow-img-list">
<img defpath="{{ "/static/images/slides/l3d-s1.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/l3d-s2.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/l3d-s3.jpeg" | prepend: site.baseurl }}">
</div></div>

This one was an assignment of a Graphics Programming unit I took in the one year Study Abroad scholarship I participated
during 2012/13. The goal was to create a simple GUI editor that allows the user to place and perform simple edits in 3D models
loaded from file. The program also saves the work and allows loading preexistent scene files to enable incremental edits by
the user. The User Interface was built using Qt and the QtCreator tool, which is a very fine GUI framework, IMO.
It also uses the [ASSIMP](http://assimp.sourceforge.net/) model loading library to provide support for a vast number
of 3D model file formats. One of the perks of using Qt was being able to deploy the application on Mac, Windows and Linux.
As always, [source code is available](https://bitbucket.org/glampert/l3d).

----

## First Person Shooter Game and framework

<div class="slideshow-container"><div class="slideshow-img-list">
<img defpath="{{ "/static/images/slides/fpsgame-s1.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/fpsgame-s2.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/fpsgame-s3.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/fpsgame-s4.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/fpsgame-s5.jpeg" | prepend: site.baseurl }}">
</div></div>

Project done around the third semester of my Game Development course, circa 2011. The assignment was to apply a set of
known OOP design patterns to any piece of software you wrote. So I decided to code a tiny framework for first person games
to use as test case for the design patterns. The game itself was quite crude, just basically a level where you could move
around in first person and shoot at badies. The framework did feature a couple cool things, such as loading and rendering of
animated Doom 3 MD5 models (this before the game went Open Source, if I'm not mistaken), procedural terrain generation and
some cheesy fire and flame effects done with billboards and Fragment Shader. In implementing the first person camera was when
I figured out about the depth hack that is used by all FPS games to avoid the weapon from poking into scene geometry.
Quite cleaver, I must say!

Anyway, this project has been forgotten for quite some time, but recently I've migrated its source code to [here](https://bitbucket.org/glampert/fps-game).
It was originally developed around the Visual Studio 2008 IDE, using a very Windows-ish style of programming, C++98,
fixed function OpenGL and lots of raw pointers. It's pretty outdated by now and I doubt it would build on a modern
compiler as is, but I keep it as a historical piece.

----

## `adf2mp3` Command-line tool for GTA Vice City

<div class="slideshow-container"><div class="slideshow-img-list">
<img defpath="{{ "/static/images/slides/vc-radio-s1.jpeg" | prepend: site.baseurl }}">
</div></div>

Grand Theft Auto - Vice City might not be the most famous or fanciest GTA episode, but it certainly has the best
sound tracks and radio stations in the whole franchise! Well, at least for me! A while back I did some sniffing
around in the game assets and found out that it was quite easy to extract the radio station tracks from the game,
so that they could be played on an external media player. Then I wrote a command-line tool to perform the conversion
from proprietary ADF format to universally playable MP3. You can access source code as well as a prebuilt Windows
binary [in the source code repo](https://bitbucket.org/glampert/adf2mp3).
Here's [a blog post]({{ "/2014/12-27/extracting-gta-vice-city-radio-stations/" | prepend: site.baseurl }})
with more info about it.

----

## Miscellaneous and ancient stuff

<div class="slideshow-container"><div class="slideshow-img-list">
<img defpath="{{ "/static/images/slides/old-projects-s1.jpeg" | prepend: site.baseurl }}">
</div></div>

Besides what was shown above, I also have several other older and more boring projects that are not worth
mentioning here in full. Most were class assignments from diverse units and disciplines of my Games course,
such as a [simple RayTracer](https://bitbucket.org/glampert/simd-rt) or a [network tic-tac-toe game](https://bitbucket.org/glampert/tic-tac-toe-tcp).
The ones I have kept because they had some interesting code fragments or solved interesting problems are now available
on my [Bitbucket page](https://bitbucket.org/glampert/).

----

## This Website!

That's right, who would ever guess that a low-level coder like me could make a fancy website!
To be fair, I started out from the basic blog template provided by Jekyll, the underlying platform
used to generate the site. But nevertheless, it was fun to play with CSS and jQuery for a while to
design the interface that you see here. Hope it isn't too bad!

[Jekyll](http://jekyllrb.com/) was the main tool used here, but there's also [jQuery](https://jquery.com/),
[Bootstrap](http://getbootstrap.com/), [Rouge](http://rouge.jneen.net/) for code syntax highlighting
(previously I was using [Highlight.js](https://highlightjs.org/)) and some plain-old HTML and CSS
([SASS actually](http://sass-lang.com/)).

You can find the source code as well as all the site's content and assets in the
[Git repository](https://github.com/glampert/glampert.github.io). Source code is released under the
MIT license, so feel free to fork it and use as a base template for your own website if it suits you `;)`.

Site currently hosted by [GitHub Pages](https://pages.github.com/).


---
layout:       post
title:        Projects
permalink:    /projects/
menu_index:   1
menu_visible: true
---

* Contents
{:toc}

Some of my personal programming projects.

Source code can be found on [**GitHub**](https://github.com/glampert) or [**Bitbucket**](https://bitbucket.org/glampert/).

----

## Rust City Builder Game

<div class="slideshow-container"><div class="slideshow-img-list">
<img defpath="{{ "/static/images/slides/city-sim-s1.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/city-sim-s2.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/city-sim-s3.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/city-sim-s4.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/city-sim-s5.jpeg" | prepend: site.baseurl }}">
</div></div>

Ongoing project of a city builder game based on ancient civilizations of Asia. Inspired by classic city builders like *Pharaoh* and *Caesar*.

This game is written from the ground up using the Rust programming language, with a custom OpenGL-based renderer backend.

- [Source code](https://github.com/glampert/rust-citysim)

----

## MrQuake2 - Multiple Renderers Quake 2

<div class="slideshow-container"><div class="slideshow-img-list">
<img defpath="{{ "/static/images/slides/mrq2-s1.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/mrq2-s2.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/mrq2-s3.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/mrq2-s4.jpeg" | prepend: site.baseurl }}">
</div></div>

Multiple Renderers Quake 2, or *MrQuake2*, is a Quake 2 custom renderers playground.

Currently the following back-ends are supported:
- `D3D11` - Windows
- `D3D12` - Windows
- `Vulkan` - Windows

The aim is to implement each renderer with the same visuals as the original Quake 2 but some modernizations are also implemented and can be toggled by CVars. We also support loading higher resolution textures such as the HD texture pack from Yamagi Quake 2. There's also support for `RenderDoc` debugging and profiling with `Optick`. This project is based on the original Quake 2 source release from id Software.

- [Source code](https://github.com/glampert/MrQuake2)

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

- [Source code](https://bitbucket.org/glampert/ps2dev-tests)

Gameplay recorded from the PCSX2 Emulator:

- [A simple test level](https://youtu.be/kM_C4iHzdNQ)

- [The Dungeons level](https://youtu.be/qrPz5AMEOUM)

- [The Graveyard level](https://youtu.be/pK5r_wBrzcM)

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
act as the implementation (when a given preprocessor macro is defined), so you should be able to just
drop the file into your project's directory, `#include` it and be done. Integrating with the renderer
of your choice should also be easy, all you have to do is implement a small interface class
and give the library a pointer to your implementation. The library is designed around a procedural
style similar to the old fixed-function OpenGL, but it batches draw calls under the hood for
better performance. Memory footprint is also small and configurable by the user code.

- [Source code](https://github.com/glampert/debug-draw)

----

## NTB - Minimal debug GUI

<div class="slideshow-container"><div class="slideshow-img-list">
<img defpath="{{ "/static/images/slides/ntb-s1.png" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/ntb-s2.png" | prepend: site.baseurl }}">
</div></div>

A small experiment on writing a simple debug UI for graphics applications.
Initially the goal was to write a portable and renderer agnostic replacement for [AntTweakBar](http://anttweakbar.sourceforge.net/doc/).

This was before [ImGui](https://github.com/ocornut/imgui) and "immediate mode UIs" became sort of an industry standard, so this project is now obsolete.
It was implemented using a statefull widget tree which is not very friendly to debug and extend. The front-end is quite simple and only exposes windows, panels and variables.

- [Source code](https://github.com/glampert/neo-tweak-bar)

----

## Moon Lang - Custom scripting language

<div class="slideshow-container"><div class="slideshow-img-list">
<img defpath="{{ "/static/images/slides/moon-lang-s1.png" | prepend: site.baseurl }}">
</div></div>

Moon is a custom scripting language that borrows some of its syntax from [Lua](https://www.lua.org/) and [Rust](https://www.rust-lang.org/en-US/).
It supports functions, structures, enums, ranges, arrays, imports, and all that good
stuff you'd expect. It is also much more strongly-typed than Lua, but not as much as Rust.
The C++ interface is also meant to be simple and easy to use. The Virtual Machine is stack-based
and uses a tiny set of bytecode instructions.

I started this project just to learn how to use Flex and Bison to write a simple compiler
font-end, but I ended up taking it to a nearly production-grade stage. The language
is fairly complete and usable, but it lacks some basic support libraries.

The name *Moon* is just a play on the meaning of Lua (Moon in Portuguese).
I chose the name on purpose to make it clear this is a lame rip-off on the
syntax of the popular scripting language, even though in the end it turned
out into a Lua/Rust hybrid syntax.

- [Source code](https://github.com/glampert/moon-lang)

----

## WebGL Lightsaber and WebGL demos

<div class="slideshow-container"><div class="slideshow-img-list">
<img defpath="{{ "/static/images/slides/lightsaber-s1.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/lightsaber-s2.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/lightsaber-s3.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/lightsaber-s4.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/lightsaber-s5.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/webgl-md5viewer-s1.jpeg" | prepend: site.baseurl }}">
</div></div>

To celebrate the announcement of a new *Star Wars* movie (Episode VII - The Force Awakens), I wrote a browser
based WebGL Lightsaber app. It features the iconic Lightsaber sounds and mouse/touch interaction. Other technical
bits: glow effect for the laser blade (AKA Light Bloom), trail rendering with Polyboards, anisotropic
shading for the handle (brushed metal shader) and screen space anti-aliasing using FXAA. 
The project also includes a tiny WebGL rendering framework and a couple other demos.

- [WebGL Lightsaber]({{ "/static/webgl/lightsaber.html" | prepend: site.baseurl }}) (and [blog post]({{ "/2015/06-07/webgl-lightsaber/" | prepend: site.baseurl }}))

- [WebGL Cube]({{ "/static/webgl/hellocube.html" | prepend: site.baseurl }})

- [DOOM3 MD5 Model Viewer]({{ "/static/webgl/doom3md5.html" | prepend: site.baseurl }})

- [Source code](https://bitbucket.org/glampert/webgl-tests)

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

Project from my Game Development degree in Brazil.
My inspiration here was in games like *Freelancer* and *Wing Commander*. It is playable on PC and Mac, using keyboard/mouse
or an Xbox controller. It supports multiplayer in split-screen mode with another local player.
Initially I had intended to also support online multiplayer, but I never got around finishing the net code before
submitting the project. This game was written mostly in C++, with a few bits of C and Lua as well.

It uses Core OpenGL 3+ for rendering. The space backgrounds and planets you can see in the images above are just cubemaps,
not actual geometry. The asteroids and props are actual 3D models. Never got around implementing sound either, so playing
it is a silent, self-reflection experience.

- [Source code](https://bitbucket.org/glampert/space-sim)

----

## Oldschool Space Shooter Game

<div class="slideshow-container"><div class="slideshow-img-list">
<img defpath="{{ "/static/images/slides/ossg-ios-s1.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/ossg-ios-s2.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/ossg-ios-s3.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/ossg-ios-s4.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/ossg-ios-s5.jpeg" | prepend: site.baseurl }}">
</div></div>

Abbreviated OSSG, this is a side scrolling space shooter game for iOS. It was made for a class assignment in my Game Development
degree in Brazil. It uses the Objective-C version of the Cocos2D library, plus some raw OpenGL-ES for the 3D elements. The in-game background
scene is animated with planets and randomly spawned asteroids. The main game itself is comprised of 2D sprites drawn as overlays on top of
the 3D background. This game was my first experience with iOS dev and Objective-C programming. Short gameplay video [here](https://youtu.be/YQTbddA4IYw).

- [Source code](https://bitbucket.org/glampert/ossg)

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

Project from my Game Development degree. I implemented a "traditional" Virtual Texturing (VT)
system on OpenGL-ES for the iOS/Apple platform. Virtual Texturing, or ["MegaTextures"](https://en.wikipedia.org/wiki/MegaTexture)
as it was popularized by John Carmack when still working at idSoftware, is an advanced texture atlasing technique that implements
a texture streaming setup analogous to Virtual Memory, thus allowing for very large texture data sets, in the tens of Gigabytes range.

Virtual Texturing is an interesting approach to the management and use of large texture databases for real-time applications,
however, it is also very hard to get it right and working fast enough to be shippable, so it is only really worth the trouble
for games and applications that need to render a lot of hi-res texture data. I can see some use for it on mobile platforms though.
Mobile devices still have limited main memory but fair amounts of fast offline storage, plus fast Internet connections to allow for
on-the-fly downloading of textures.

Here's a [short video](https://youtu.be/sWz45m0QKj4) captured on the iOS Simulator. It runs at a very low frame-rate on the Simulator,
but seeing it in action gives a better idea of how the system works.

- [Source code](https://bitbucket.org/glampert/vt-mobile)

----

## Simple 3D scene editor

<div class="slideshow-container"><div class="slideshow-img-list">
<img defpath="{{ "/static/images/slides/l3d-s1.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/l3d-s2.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/l3d-s3.jpeg" | prepend: site.baseurl }}">
</div></div>

This one was an assignment of a Graphics Programming unit I took in the one year Study Abroad scholarship I participated
during 2012/13. The goal was to create a simple GUI editor that allows the user to place and perform simple edits in 3D models
loaded from file. The program also saves the work and allows loading preexistent scene files to enable incremental edits by
the user. The User Interface was built using Qt and QtCreator.
It also uses the [ASSIMP](http://assimp.sourceforge.net/) model loading library to provide support for a large number
of 3D model file formats. One of the perks of using Qt was being able to deploy the application on Mac, Windows and Linux.

- [Source code](https://bitbucket.org/glampert/l3d)

----

## First Person Shooter Game and framework

<div class="slideshow-container"><div class="slideshow-img-list">
<img defpath="{{ "/static/images/slides/fpsgame-s1.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/fpsgame-s2.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/fpsgame-s3.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/fpsgame-s4.jpeg" | prepend: site.baseurl }}">
<img defpath="{{ "/static/images/slides/fpsgame-s5.jpeg" | prepend: site.baseurl }}">
</div></div>

Project done around the third semester of my Game Development degree, circa 2011. The assignment was to apply a set of
common OOP design patterns to any piece of software you wrote. So I decided to code a tiny framework for first person games
to use as test case for the design patterns. The game itself was quite crude, just basically a level where you could move
around in first person and shoot at monsters. The framework did feature a couple cool things such as loading and rendering of
animated DOOM3 MD5 models (this before DOOM3 went Open Source, if I'm not mistaken), procedural terrain generation and
some cheesy fire and flame effects done with billboards and a Fragment Shader. In implementing the first person camera was when
I found out about the depth hack trick that is used by all FPS games to avoid the weapon model from poking into scene geometry.
This was originally developed around the Visual Studio 2008 IDE with a rather Windows-centric programming style, C++98,
fixed function OpenGL and lots of raw pointers.

- [Source Code](https://bitbucket.org/glampert/fps-game)

----

## `adf2mp3` Command-line tool for GTA Vice City

<div class="slideshow-container"><div class="slideshow-img-list">
<img defpath="{{ "/static/images/slides/vc-radio-s1.jpeg" | prepend: site.baseurl }}">
</div></div>

*Grand Theft Auto - Vice City* might not be the most well known GTA episode but it certainly has the best
sound tracks and radio stations in the whole franchise, IMO. A while back I did some sniffing
around in the game assets and found out that it was quite easy to extract the radio station tracks from the game,
so that they could be played on an external media player. Then I wrote a command-line tool to perform the conversion
from proprietary ADF format to universally playable MP3. Here's [a blog post]({{ "/2014/12-27/extracting-gta-vice-city-radio-stations/" | prepend: site.baseurl }}) with more info about it.

- [Source code](https://bitbucket.org/glampert/adf2mp3)

----

## Miscellaneous

<div class="slideshow-container"><div class="slideshow-img-list">
<img defpath="{{ "/static/images/slides/old-projects-s1.jpeg" | prepend: site.baseurl }}">
</div></div>

Besides what's listed above I also have several other older and less interesting projects that are not worth
mentioning here in full. Most were class assignments from different units and disciplines of my Games course,
such as a [simple RayTracer](https://bitbucket.org/glampert/simd-rt) or a [network tic-tac-toe game](https://bitbucket.org/glampert/tic-tac-toe-tcp).
The ones I have kept because they had some interesting code fragments or solved interesting problems are now available
on my [Bitbucket page](https://bitbucket.org/glampert/).

----

## This Website

[Jekyll](http://jekyllrb.com/) was the main tool used to build this site, but there's also [jQuery](https://jquery.com/),
[Bootstrap](http://getbootstrap.com/), [Rouge](http://rouge.jneen.net/) for code syntax highlighting
(previously I was using [Highlight.js](https://highlightjs.org/)) and some plain-old HTML and CSS
([SASS actually](http://sass-lang.com/)).

Site proudly hosted by [GitHub Pages](https://pages.github.com/).


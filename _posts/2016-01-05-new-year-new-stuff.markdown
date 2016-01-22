---
layout:     post
title:      New year, new stuff - Lots of projects on the way!
author:     Guilherme Lampert
categories: Miscellaneous Quake-2
thumbnail:  2016
---

I've been off the grid for a couple months now, but I wasn't just chilling
over the holidays, I've been doing a lot of stuff on the side too. Guess it
is time to make some of them known `;)`

## Quake II on the PS2!

In case you haven't noticed the [project on my GitHub account][link_q2_gh] already...

![Good news, everyone!]({{ "/static/images/posts/good-news.jpeg" | prepend: site.baseurl }})

Quake II is a perfect game to port to the PS2. Officially, it was ported to the PSOne and the X360,
plus a handful of other systems, but it sadly never made into the PlayStation 2. I'm a big fan of the
game, and was playing it last year again and thought to myself, damn, this would make for a mighty fine PS2 game.
Then I started the project soon after. The basics are more or less already in place, we have 2D rendering
of the menus and in-game UI plus cinematics. Now comes the hard part of the 3D drawing, so I'm guessing
it will still take some six months or so before I have anything interesting to show for, since I'm only
working on it sporadically.

Quake II is a game codebase that is ready for porting. The rendering and platform specific code are very
well separated from the game logic, plus the code is quite readable and straightforward, despite its old age.
It is going to be a very interesting project to work on this year. If you'd like to contribute, get
in touch. Let's write a port that makes John Carmack proud!

## New tutorials page on the main site!

You might have noticed that big "tutorials" banner on the main page,
along with the change of layout of the post thumbnails that shifted to the left:

![New tutorials]({{ "/static/images/posts/new-tuts.jpeg" | prepend: site.baseurl }})

If you visit the tutorials page right now, it will be full of placeholder links
to the tutorials to come. I plan on turning some side projects of mine
and other small code snippets that I never published into a few tutorials
about problems I've encountered and had to solve with little information
available, so I thought it would be nice to spread some of the acquired
knowledge to save other people's time if they have to solve the same problems.

Check back in a couple weeks and you should already find the first few available!

## Lots of old code going Open Source or Public Domain!

I'm also in the process of getting some old libraries and unfinished projects
that I never made public into a presentable enough shape to publish them on
GitHub. The first one in this batch is the [Debug Draw library][link_dd_gh].

Most will be published with Public Domain license. I want to give you as much
freedom as possible to use the code in whatever ways it might suit you, no strings
attached. I couldn't care less about copyright, it's code that was abandoned in
my hard-drive anyways, so I much prefer to have people using it instead.

I'll be releasing a lot more stuff in the coming months, so follow my
[GitHub user][link_me_gh] if you're interested in getting the updates.

[link_me_gh]: https://github.com/glampert
[link_q2_gh]: https://github.com/glampert/quake2-for-ps2
[link_dd_gh]: https://github.com/glampert/debug-draw


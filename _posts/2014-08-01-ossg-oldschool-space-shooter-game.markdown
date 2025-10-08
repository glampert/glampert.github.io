---
layout:     post
title:      OSSG - Oldschool Space Shooter Game
date:       '2014-08-01T13:41:00.000-07:00'
author:     Guilherme Lampert
categories: Objective-C iOS
thumbnail:  ossg
---

Just a few weeks back I finished a little iOS game, the **Oldschool Space Shooter Game - OSSG**.
I did it as a University assignment. It is not published, mainly because I don't have the slightest
desire of paying Apple $100 bucks just to publish it, but also because it is still very rough
and missing some original art assets.

This was my first time writing an iOS app and coding in Objective-C, so the code is pretty lame, overall.
I didn't pay much attention to code quality, and to be honest, didn't quite get to like Obj-C either.
Everything in the project is game-specific, but the code is fairly simple, apart from a few nasty globals,
it goes against all Obj-C odds and doesn't use deep inheritance chains, instead I almost attempted a
component based architecture.

The coolest thing in the end though was the 3D background I added behind the Cocos2d sprites, using OpenGL ES:

![OSSG]({{ "/static/images/posts/ossg.jpeg" | prepend: site.baseurl }} "Oldschool Space Shooter Game")

The source code repository can be found [here](https://bitbucket.org/glampert/ossg/overview),
if anyone is interested in taking a look.

Following is a [short gameplay video](https://youtu.be/YQTbddA4IYw)
(running on the simulator, so forgive the low frame-rate).

<iframe type="text/html"
    width="480"
    height="440"
    class="embedded-video"
    title="OSSG Gameplay"
    src="http://www.youtube.com/embed/YQTbddA4IYw"
    frameborder="0">
</iframe>


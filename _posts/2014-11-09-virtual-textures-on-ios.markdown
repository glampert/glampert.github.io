---
layout:     post
title:      Virtual Textures on iOS
date:       '2014-11-09T11:19:00.003-08:00'
author:     Guilherme Lampert
categories: Virtual-Textures OpenGL iOS
thumbnail:  vt-ios-1
---

I have spent some time lately fiddling with Virtual Textures (AKA [*MegaTextures*][link_megatex]). Mainly because I'm writing
a dissertation about it for my University course, but also because it is a theme that always interested me, hence the choice
for the subject of the work.

Virtual Texturing on the PC and on Consoles is a well researched topic, but there isn't much work about its uses on mobile devices,
so I decided to tune a test implementation for iOS. At first it might seem that the platform is not ideal for the technique, since
local storage is limited. But we don't have to be limited to local storage. Networks today are fast enough to allow real-time streaming
of texture data. So the next question is if the limited hardware can deal with the heavy shader computations required by Virtual Texturing.
Devices supporting OpenGL-ES 2.0 or latter have the bare minimum needed to implement the technique. The last question then would be,
can mobile games benefit from it? Definitely yes. Memory on mobile devices is much more limited then on a PC and about equivalent to
Last Gen Consoles. There is a big AAA market for mobile games as well as casual. Both could benefit from less constrained texture size budgets.

So I have armed myself with an iPad and a developer license and have been working on it for a while. Results so far seem promising.
Those SSDs are blazing fast, so loading the texture pages doesn't take long. My test apps are small, but the frame rates are steady at around 30+fps.

I'm attaching some screens from my tests. I'll keep working on it for the next few months and see where it goes. I'll try to push it to the limit.

The project is hosted on [Bitbucket][link_project].

![iOS Virtual Textures]({{ "/static/images/posts/ios-vt-1.jpeg" | prepend: site.baseurl }} "VT page cache")
![iOS Virtual Textures]({{ "/static/images/posts/ios-vt-2.jpeg" | prepend: site.baseurl }} "VT page cache debug render")
![iOS Virtual Textures]({{ "/static/images/posts/ios-vt-3.jpeg" | prepend: site.baseurl }} "VT final render with page num info")

[link_megatex]: http://en.wikipedia.org/wiki/MegaTexture
[link_project]: https://bitbucket.org/glampert/vt-mobile


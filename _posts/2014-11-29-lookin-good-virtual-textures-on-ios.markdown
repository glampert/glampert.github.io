---
layout:     post
title:      Lookin' Good - Virtual Textures on iOS
date:       '2014-11-28T19:28:00.000-08:00'
author:     Guilherme Lampert
categories: Virtual-Textures OpenGL iOS
thumbnail:  vt-ios-2
---

Things have been going smoothly since my last update on bringing Virtual Textures to iOS. Following is
a [short video of a simple demo][link_video] running on the XCode simulator (it runs much faster on a device, with 30+ fps):

<iframe
    class="embedded-video"
    width="480"
    height="440"
    src="https://www.youtube.com/embed/sWz45m0QKj4?si=2JPH6_uukuj85nsQ"
    title="Virtual Textures - iOS"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen>
</iframe>

I've also coded another demo, which I call the *Planets* demo. It is too heavy to run on the simulator,
but it burns battery on my iPad Retina at around 25 frames-per-second:

![iOS Virtual Textures]({{ "/static/images/posts/ios-vt-planets-demo.jpeg" | prepend: site.baseurl }} "VT Planets demo")

This one applies a diffuse + normal + specular texture set on each sphere, I also do per pixel shading,
so it is pretty close to a game's setting. The *Planets* demo uses roughly **3 Gigabytes** of texture data in total,
though only about **250 Megabytes** of memory are used by the application at any one time.

I'm quite happy with the results. The OpenGL-ES + iOS duo didn't let me down.

My implementation follows a pretty "standard" Virtual Texturing approach:

![iOS Virtual Textures]({{ "/static/images/posts/ios-vt-diagram.jpeg" | prepend: site.baseurl }} "Virtual Texturing architecture")

The overall architecture was largely inspired by idSoftware's presentations and talks. I've also adapted the shaders
presented on [MrElusive's paper][link_paper] to work on GL-ES. A great deal of stuff was also learned from the first
[GPU Pro book][link_gpupro] and its articles on Virtual Texturing.

The goal now is to further optimize the implementation and step the demos up a notch.
The source code repository is live at [Bitbucket][link_project].

[link_video]:   https://youtu.be/sWz45m0QKj4?si=2JPH6_uukuj85nsQ
[link_paper]:   http://www.mrelusive.com/publications/papers/Software-Virtual-Textures.pdf
[link_project]: https://bitbucket.org/glampert/vt-mobile
[link_gpupro]:  http://gpupro.blogspot.com


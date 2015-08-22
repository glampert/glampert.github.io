---
layout:     post
title:      Particles
date:       '2014-01-19T12:02:00.002-08:00'
author:     Guilherme Lampert
categories: Programming OpenGL
thumbnail:  particles
highlight:  true
---

I decided to take a small spinoff in the weekend and add some basic particle rendering to my game engine.
Right now the particles are rendered as billboards, built by the CPU. Eventually I want to try GPU acceleration
with [Transform Feedback](https://www.opengl.org/wiki/Transform_Feedback) and rendering volumetric particles.

The particle billboards are build in one of two ways, one is the traditional camera plane facing billboard:

{% highlight c++ %}

//
// Faces the camera plane.
//
void CreateBillboardCameraFacing(const Vec3 & up, const Vec3 & right,
                                 const Vec3 & origin, const Vec2 & size,
                                 Vec3 points[4])
{
    const Vec3 halfWidth = (size.width  * 0.5f) * right; // X
    const Vec3 halfHeigh = (size.height * 0.5f) * up;    // Y

    points[0] = origin + halfWidth + halfHeigh;
    points[1] = origin - halfWidth + halfHeigh;
    points[2] = origin - halfWidth - halfHeigh;
    points[3] = origin + halfWidth - halfHeigh;
}

{% endhighlight %}

And another possible method, which can produce better results for larger billboards is the camera position facing billboard:

{% highlight c++ %}

//
// Faces the camera world position.
//
void CreateBillboardFacingCameraPos(const Vec3 & up, const Vec3 & cameraPos,
                                    const Vec3 & origin, const Vec2 & size,
                                    Vec3 points[4])
{
    const Vec3 Z = normalize(cameraPos - origin);
    const Vec3 X = normalize(cross(up, Z));
    const Vec3 Y = cross(Z, X);

    const Vec3 halfWidth = (size.width  * 0.5f) * X;
    const Vec3 halfHeigh = (size.height * 0.5f) * Y;

    points[0] = origin + halfWidth + halfHeigh;
    points[1] = origin - halfWidth + halfHeigh;
    points[2] = origin - halfWidth - halfHeigh;
    points[3] = origin + halfWidth - halfHeigh;
}

{% endhighlight %}

Both methods are well explained in Eric Lengyel's book
[**Math for 3D Game Programming and CG**](http://www.mathfor3dgameprogramming.com/).

Following are some screenshots of what I did so far.

![Particles]({{ "/static/images/posts/particles-1.jpeg" | prepend: site.baseurl }} "Particles")
![Particles]({{ "/static/images/posts/particles-2.jpeg" | prepend: site.baseurl }} "Particles")
![Particles]({{ "/static/images/posts/particles-3.jpeg" | prepend: site.baseurl }} "Particles")
![Particles]({{ "/static/images/posts/particles-4.jpeg" | prepend: site.baseurl }} "Particles")
![Particles]({{ "/static/images/posts/particles-5.jpeg" | prepend: site.baseurl }} "Particles")
![Particles]({{ "/static/images/posts/particles-6.jpeg" | prepend: site.baseurl }} "Particles")


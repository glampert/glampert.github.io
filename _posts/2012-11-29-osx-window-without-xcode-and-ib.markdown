---
layout:     post
title:      OSX/Cocoa window without XCode or Interface Builder
date:       '2012-11-29T00:34:00.001-08:00'
author:     Guilherme Lampert
categories: Programming Objective-C
thumbnail:  osx-window
highlight:  true
---

So I wanted to programatically create a simple GUI application on Mac OS X, with a window and some
other simple UI components, just like I used to do on Windows using the WinAPI. Since I prefer command
line tools and coding, I also didn't want to use XCode and the fancy Interface Builder (IB) tool that Apple provides.

Sounds very simple doesn't it? Well, like people say, hell is in the details.
The actual amount of code required to do so is small, but the big issue was that
you just don't find much official Apple documentation and examples on the subject!
Since I am also a beginner with Objective-C and Cocoa, it took me hours and hours of search
and research to finally be able to open a simple application window on the Mac.

The following Objective-C code listing is all it takes:

{% highlight objectivec %}

/*
 * File: OSXWindow.m
 *
 * Brief:
 *  Creates a OSX/Cocoa application and window without Interface Builder or XCode.
 *
 * Compile with:
 *  cc OSXWindow.m -o OSXWindow -framework Cocoa
 */

#import "Cocoa/Cocoa.h"

int main(int argc, const char * argv[])
{
    // Autorelease Pool:
    // Objects declared in this scope will be automatically
    // released at the end of it, when the pool is "drained".
    NSAutoreleasePool * pool = [[NSAutoreleasePool alloc] init];

    // Create a shared app instance.
    // This will initialize the global variable
    // 'NSApp' with the application instance.
    [NSApplication sharedApplication];

    //
    // Create a window:
    //

    // Style flags:
    NSUInteger windowStyle = NSTitledWindowMask | NSClosableWindowMask | NSResizableWindowMask;

    // Window bounds (x, y, width, height).
    NSRect windowRect = NSMakeRect(100, 100, 400, 400);
    NSWindow * window = [[NSWindow alloc] initWithContentRect:windowRect
                                          styleMask:windowStyle
                                          backing:NSBackingStoreBuffered
                                          defer:NO];
    [window autorelease];

    // Window controller:
    NSWindowController * windowController = [[NSWindowController alloc] initWithWindow:window];
    [windowController autorelease];

    // This will add a simple text view to the window,
    // so we can write a test string on it.
    NSTextView * textView = [[NSTextView alloc] initWithFrame:windowRect];
    [textView autorelease];

    [window setContentView:textView];
    [textView insertText:@"Hello OSX/Cocoa world!"];

    // TODO: Create app delegate to handle system events.
    // TODO: Create menus (especially Quit!)

    // Show window and run event loop.
    [window orderFrontRegardless];
    [NSApp run];

    [pool drain];

    return 0;
}

{% endhighlight %}

And this is the result:

![Simple OSX window]({{ "/static/images/posts/osx-window.jpeg" | prepend: site.baseurl }} "Simple OSX window")


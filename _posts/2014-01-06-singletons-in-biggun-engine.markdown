---
layout:     post
title:      Singletons in the BigGun Engine
date:       '2014-01-06T11:33:00.002-08:00'
author:     Guilherme Lampert
categories: Programming C++
thumbnail:  cpp-lang
highlight:  true
---

* Contents
{:toc}

The singleton pattern, it seems to me, is becoming the new [`goto`][link_goto] of Software Engineering.
What I mean by that is that I often read and hear people judging code quality based on the use of
singletons or not, usually tagging it as bad code for using the pattern.

I am a supporter of the singleton pattern and I think it can solve some problems very elegantly and in the most succinct manner.
Many times, also, you really don't have much of a choice about using singletons or not. A very common situation where you have
to use a singleton is when interfacing with Operating System services. For example: memory allocation. Every OS has a `malloc()`-like function.
A global function that accesses global data (in the `malloc()` example, the program heap) is a singleton in its simplest form.

When writing game software, if you decide to work with OpenGL, then your renderer will be a singleton. The OpenGL API is built
entirely around global state (the (in)famous state machine of OpenGL), that is accessed by procedure calls. Trying to build an
object oriented framework around OpenGL is a daunting task. I have attempted to do so in several occasions and ended up realizing
that the amount of code need to make it work properly is inviable for most games. The best way to work with GL, I have found,
is to accept its structured architecture and write your renderer that way, as a singleton.

### Known issues with singletons

The most valid arguments against singletons are probably about concurrent access issues
(i.e. not being thread-safe) followed by initialization and termination order problems.

Indeed issues with concurrent access are hard to solve. The basic solution is to add a mutex around every method of
the singleton, which will kill parallelism. So my approach in the BigGun Engine is the flowing:

If a code path will run in parallel?

1. Can I do it without a singleton? If yes, then no singleton.
2. OK, need to access that global state, no escape, make the singleton thread-safe with a mutex/semaphore/etc.

Singleton startup and shutdown used to be a problem until I realized there was a simple solution right under my
nose from the beginning. I have used reference counting in the BigGun Engine in several places, but it never really
occurred to me until very late that I could use it for the singleton classes as well.

In the early stages of development, when the Engine was just an agglomerate of several other test projects,
I had all singletons implemented in one of two ways: Monostate singletons and "classic" [GoF singletons][link_singleton].

#### Monostate singleton

{% highlight c++ %}

class Logger
{
public:

    // Requires explicit initialization & shutdown.
    static void Init();
    static void Shutdown();

    static void LogMessage(const char * msg);
    static void LogError(const char * msg);
    ...

private:

    // Construction disallowed.
     Logger() { }
    ~Logger() { }

    static FILE * logFile;
    ...
};

Logger::LogMessage("Starting up...");
...
Logger::LogError("Warning! Danger! Danger!");
...

{% endhighlight %}

The monostate singleton is a class with all of its methods and data declared as `static`.
The class cannot be instantiated at all and its methods must be called via the `::` scope resolution operator.
This is the simplest way you can write a singleton. One of its downsides is that initialization and shutdown
are explicit, so you have to call `Logger::Init()` and `Logger::Shutdown()` manually at some point.

This will quickly lead to initialization/termination order problems. For example, lets say we have another
monostate called `FileSystem`. The `Logger` needs the `FileSystem` to open its log file, however the `FileSystem`
also wishes to log every file that is opened/closed. Which one do we initialize first?

To fix the initialization problem, one might resort to the "classic" singleton that employs lazy-initialization.

#### Classic singleton

{% highlight c++ %}

class Logger
{
public:

    static Logger & GetInstance()
    {
        // First time this function is called the constructor for theLogger runs.
        // On subsequent calls, the reference to the local static var is returned.
        static Logger theLogger;
        return theLogger;
    }

    void LogMessage(const char * msg);
    void LogError(const char * msg);
    ...

private:

    // Construction is internal.
     Logger() { ... }
    ~Logger() { ... }

    FILE * logFile;
    ...
};

//
// Now to use the Logger one must first get its global instance.
//

Logger::GetInstance().LogMessage("Starting up...");
...
Logger::GetInstance().LogError("Warning! Danger! Danger!");
...

{% endhighlight %}

The `GetInstance()` method is the only static method in the logger now. It can be called without a logger instance,
because it is static. When `GetInstance()` is first called, it will initialize the logger global. This fixes the
initialization order problem of the `FileSystem` and `Logger` example, but the termination order is now unknown.
C++ static and global variable destruction order is arbitrary, so if your singletons require a particular shutdown
order you are still going to have a bad time.

### Reference counting to the rescue!

After many attempts to bring order to the initialization/termination chaos with flags and checks everywhere,
I finally realized my approach was fundamentally wrong. The main problem was that interdependence between singletons
was implicit, while it should be explicit. What I needed was to make every singleton explicitly maintain a reference
to the other singletons it relied on to function properly. By making these instances reference-counted the termination
order is always correct. With the use of smart pointers, it is also automatic.

An example from the Engine:

In the BigGun Engine, I have three helper singletons that interface with the underlaying Operating System:

- `Logger`
- `PlatformManager`
- `MemoryManager`

Each is a reference counted type, with a `Create()` static method. Initialization is explicit,
passing to `Create()` pointers to the singletons a particular type depends on, if any.

{% highlight c++ %}

class BIGGUN_ENGINE Logger
    : public ReferenceCounted
{
    BIGGUN_DISABLE_COPY_AND_ASSIGNMENT(Logger)

public:

    // Creates the unique Logger instance or return the already initialized one.
    BIGGUN_ENGINE static LoggerPtr Create();

    ...

private:

    // No external instantiation is allowed.
     Logger();
    ~Logger();
};

typedef RefPtr<Logger> LoggerPtr;

// ===================================================

class BIGGUN_ENGINE PlatformManager
    : public ReferenceCounted
{
    BIGGUN_DISABLE_COPY_AND_ASSIGNMENT(PlatformManager)

public:

    // Returns a pointer to the unique platform manager instance,
    // initializing it for the first time if necessary.
    BIGGUN_ENGINE static PlatformManagerPtr Create(const LoggerPtr & loggerPtr);

    ...

private:

    LoggerPtr myLogger;
};

typedef RefPtr<PlatformManager> PlatformManagerPtr;

// ===================================================

class BIGGUN_ENGINE MemoryManager
    : public ReferenceCounted
{
    BIGGUN_DISABLE_COPY_AND_ASSIGNMENT(MemoryManager)

public:

    // Returns a pointer to the unique platform manager instance,
    // initializing it for the first time if necessary.
    BIGGUN_ENGINE static MemoryManagerPtr Create(const LoggerPtr & loggerPtr,
                                                 const PlatformManagerPtr & platformPtr);

    ...

private:

    LoggerPtr myLogger;
    PlatformManagerPtr myPlatform;
};

typedef RefPtr<MemoryManager> MemoryManagerPtr;

{% endhighlight %}

So for example when the `PlatformManager` needs to log a message/error, it doesn't call a global method on `Logger`,
but instead uses its local pointer to the logger singleton. Thanks to the reference counting, the termination order
works flawlessly, with the `Logger` being the last singleton to shutdown in the entire Engine.

Initialization of these three singleton happens with:

{% highlight c++ %}

// Create an instance of the default BigGun logger:
logger = Logger::Create();

// Create basic platform and memory managers:
platformMgr = PlatformManager::Create(logger);
memoryMgr   = MemoryManager::Create(logger, platformMgr);
...

{% endhighlight %}

----

**NOTE 1:** What I call the "BigGun Engine" is a series of learning projects and demos I have collected over the years.
It will keep evolving into a full scale Game Engine eventually. Once I feel it is "old" enough, I will probably make it
available to the world as open source `;)`.

**NOTE 2:** I would like to recommend a look at this [site][link_gpp]. It has some very nice elaborations on the singleton
pattern and some other very neat and ingenious solutions. Definitely a must read.

[link_goto]:      https://en.wikipedia.org/wiki/Goto
[link_singleton]: https://en.wikipedia.org/wiki/Singleton_pattern
[link_gpp]:       http://gameprogrammingpatterns.com/singleton.html


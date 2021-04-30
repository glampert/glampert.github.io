---
layout:     post
title:      'PlayStation 2 homebrew #1: Setting up the environment'
date:       '2015-02-26T19:58:00.000-07:00'
author:     Guilherme Lampert
categories: PlayStation-2 Homebrew
thumbnail:  ps2-setup
highlight:  true
---

* Contents
{:toc}

[In my last post][link_prev_post] I mentioned that I had decided to play with some PS2 homebrewing and try to get my
own game to run on the Console. This post will be a quasi-tutorial on how to set up the development environment to
start writing PS2 homebrew games.

First, a few things:

- The PlayStation 2 is a 14 years old platform; and it is pretty low-level. The only way
  you are going to get to make a game on it is by writing C and assembly code.

- The tools available are all made by homebrewers. Almost nothing is provided
  by Sony, so the tools might not always work.

- You will need a modified ("jailbroken") PS2 console to run your games on
  or be content with an emulator run otherwise.

### Getting the tools: Compiler and companions

So the first thing to do is to get yourself a compiler capable of generating PS2 executables, plus all the
other necessary tools. Fortunately, the very dedicated PS2 homebrewers have amassed all the necessary tools
in a single package, the mythical [PS2DEV SDK][link_ps2dev].

This SDK is not official, meaning it is not provided by Sony, but by very dedicated hackers that created
all the necessary support software and libraries needed to make a PS2 game.

The PS2DEV SDK includes all the good stuff, such as:

- A modified GCC compiler (based on version 3.2.2) that can generate PS2 executable code.

- A modified Gnu Binutils (based on version 2.14) to build the executable files.

- A minimal implementation of the C library and runtime adapted to PS2.

- Several helper libraries made by homebrewers that facilitate game development a lot.

Like I said before, this was all done by amateur developers, not by Sony.
So these guys deserve some massive respect!

### Installing the SDK

I'm a Mac user and I do 90% of my coding on a Mac OS computer. And I intend to keep it that way `:P`.

The PS2DEV SDK is not officially supported on Mac OS, but it is Linux-ready, so getting it to install on
the Mac is not too hard. There are some gotchas though. I'll provide a short walkthrough on the process
so that anyone attempting to do the same won't waste time figuring this stuff out and will have more
time to program a game instead. These Mac workaround steps are probably not necessary for a Linux install.

First, download the [`ps2toolchain`][link_ps2toolchain]. This includes a set of build scripts that will
download and install the rest of the SDK in a more automated manner.

While the download is running, you will also need to make sure [`wget`][link_wget] is installed.
`ps2toolchain` uses `wget` to fetch the rest of the SDK. It is much easier to just install `wget`
instead of modifying the tool-chain scripts. Follow the previous link for a quick tutorial.

You should also make sure that `gcc`, `clang`, `make`, `patch` and `svn` are installed.
These usually are if you use your Mac for development.

Once `wget` and friends are installed and the tool-chain is downloaded, you should start of by setting these environment variables:

{% highlight c %}
export PS2DEV=/usr/local/ps2dev
export PATH=$PATH:$PS2DEV/bin
export PATH=$PATH:$PS2DEV/ee/bin
export PATH=$PATH:$PS2DEV/iop/bin
export PATH=$PATH:$PS2DEV/dvp/bin
export PS2SDK=$PS2DEV/ps2sdk
export PATH=$PATH:$PS2SDK/bin
{% endhighlight %}

They need to be persistent, so edit the `~/.profile` startup script and add the lines above.

After, you need to create the directories referenced by those env vars. I didn't want to risk changing
the paths, in case someone has hardcoded a path somewhere else, so I just created a `ps2dev` folder inside
`/usr/local` and also all the subdirs above. You need to create them by hand because the install script
doesn't seem to be able to `mkdir` inside `/usr/local`, even with `sudo`.

You also need to allow read/write/execute permission to the top-level dir. So `chmod a+rwx` on `/ps2dev/`.

Once that is done, you can try to navigate to the directory where the `ps2toolchain`
was downloaded and run `toolchain.sh`: `$ ./toolchain.sh`

I got an error right away when it tried to build `binutils`. The `binutils` build script is set up for some older
GCC version. I'm running Mac OS X Mavericks, which has completely replaced GCC with Clang. Clang is more strict
than GCC and will fail the `binutils` compilation.

To fix this error, open the script `ps2toolchain/scripts/001-binutils-2.14.sh` and change this line:

{% highlight c %}
CFLAGS="-O0" ../configure --prefix="$PS2DEV/$TARGET" --target="$TARGET" || { exit 1; }
{% endhighlight %}

to this:

{% highlight c %}
CFLAGS="-O0 -ansi -Wno-implicit-int -Wno-return-type" ../configure --prefix="$PS2DEV/$TARGET" --target="$TARGET" || { exit 1; }
{% endhighlight %}

The new flags will compile `binutils` in old-style ANSI-C mode, silencing the error.

### Compiling GCC

Next up is building the custom GCC compiler. This bad boy will need two stages, one for the EE processor
and one stage for the IOP co-processor. The firs problematic script will be `ps2toolchain/scripts/002-gcc-3.2.2-stage1.sh`.

Once the configure runs for this script, it will complain that the platform is not supported.
And indeed this is true, since the script was made to run on Linux or Windows with Cygwin/MinGW.

Open `scripts/002-gcc-3.2.2-stage1.sh` and change this line:

{% highlight c %}
../configure --prefix="$PS2DEV/$TARGET" --target="$TARGET" --enable-languages="c" --with-newlib --without-headers || { exit 1; }
{% endhighlight %}

to this:

{% highlight c %}
../configure --prefix="$PS2DEV/$TARGET" --target="$TARGET" --build=i386-linux-gnu --host=i386-linux-gnu --enable-languages="c" --with-newlib --without-headers || { exit 1; }
{% endhighlight %}

And the script should now run fine. What we've done here was to explicitly set the current platform,
by adding `--build=i386-linux-gnu` and `--host=i386-linux-gnu`. Note that we are lying to the script
and saying that we are on a Linux/Gnu machine. This is fine for the purposes of compiling GCC,
since Mac is, after all, Unix based.

That should get you through the first stage of the GCC build. The second stage is a little more involving.
Once the `toolchain.sh` progresses and reaches the second stage build-script, `ps2toolchain/scripts/004-gcc-3.2.2-stage2.sh`,
it should again fail due to invalid platform errors. That script has the same issue of the first one, so replace:

{% highlight c %}
../configure --prefix="$PS2DEV/ee" --target="ee" --enable-languages="c,c++" --with-newlib --with-headers="$PS2DEV/ee/ee/include" --enable-cxx-flags="-G0" || { exit 1; }
{% endhighlight %}

with:

{% highlight c %}
../configure --prefix="$PS2DEV/ee" --target="ee" --build=i386-linux-gnu --host=i386-linux-gnu --enable-languages="c,c++" --with-newlib --with-headers="$PS2DEV/ee/ee/include" --enable-cxx-flags="-G0" || { exit 1; }
{% endhighlight %}

Now `GCC-stage2` should compile but fail to link. This is a very shady bug. The linker will fail to find a function
named `libc_name_p`. Doing a search in the GCC source code tree, I've found that the function is declared inside
the file `gcc-3.2.2/gcc/cp/cfns.h`.

That file appears to have been automatically generated at some point by the [`gperf`][link_gperf] Gnu tool.
The function in question is marked as `inline`. For some reason, this is confusing the linker. So what I did
was to replace the `inline` with a `static` qualifier. But you have to copy the modified file to some other location,
because the build script will download a fresh copy of the files every time it is run, overwriting any changes made.

So remove the `__inline` keywords and replace them with `static`, then copy the file to say `ps2toolchain/patches/cfns.h`
and finally add the following `cp` command to `004-gcc-3.2.2-stage2.sh`, just before where `make` is run:

{% highlight c %}
#
# LAMPERT: The cfns.h that comes with GCC is broken.
# We have to replace it with this fixed one.
#
cp ../../../patches/cfns.h ../gcc/cp/cfns.h || { echo Failed to copy new cfns.h!; exit 1; }

# Compile and install.
make clean && CFLAGS_FOR_TARGET="-G0" make -j 2 && make install && make clean || { exit 1; }
{% endhighlight %}

This will copy the fixed `cfns.h` to the proper dir after the script refreshes the local copies, but before the build is run.

That should be the last modification you will have to do to the `ps2toolchain`. Once `toolchain.sh` finishes,
it should have installed and copied all the needed stuff to `/usr/local/ps2dev`. Navigate to that dir and confirm it.

In the `ps2sdk/samples/` folder, you should find several starter examples on how to use the PS2DEV SDK libraries.
Navigate to `ps2sdk/samples/draw/cube/` and run `make`. It should compile without errors or warnings, producing
a `cube.elf` file in the same directory. This ELF is a PS2-ready executable. You can test it on an emulator,
like [PCSX2][link_pcsx2].

### Installing PCSX2 to run the samples

Once the environment is set up and you have compiled the sample programs, you're going to want to test them
in a quick way, without having to copy them into the Console. Luckily for us, the PCSX2 project is well under
way and fully functional, making for a perfect test bed for PS2 homebrew games.

[This video-tutorial][link_pcsx_tuto] does a great job explaining how to install and run PCSX2 on the Mac.
The links provided in the video description are most valuable.

After the emulator is installed and configured, I copied the `cube.elf` sample to the desktop and selected
`File -> Run Elf File -> No Disc` in the PCSX2 menu and ran `cube.elf`. This was the result, very rewarding
after the couple hours spent on the setup `:)`.

![PS2 homebrew]({{ "/static/images/posts/ps2/hello-cube.jpeg" | prepend: site.baseurl }} "Hello PlayStation 2!")
*The cube demo from PS2DEV SDK running on the PCSX2 emulator.*

[link_prev_post]:    {{ "/2015/01-21/playstation-2-retro-programming-or-hipster-coding/" | prepend: site.baseurl }}
[link_ps2dev]:       https://github.com/ps2dev
[link_ps2toolchain]: https://github.com/ps2dev/ps2toolchain
[link_wget]:         http://coolestguidesontheplanet.com/install-and-configure-wget-on-os-x/
[link_gperf]:        https://www.gnu.org/software/gperf/
[link_pcsx2]:        http://pcsx2.net/
[link_pcsx_tuto]:    https://youtu.be/VX3dyGkb55E?list=LL_0XTUgAeh_sbYbOeifKkZw


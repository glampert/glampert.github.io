---
layout:     post
title:      Reverse engineering LucasArts Outlaws
author:     Guilherme Lampert
categories: Miscellaneous Reverse-Engineering
thumbnail:  outlaws
---

* Contents
{:toc}

Have you ever wished someone made a video game about [*The Dollars Trilogy*][link_dollars]?
Well, if you have by any chance played [*Outlaws*][link_ol_game], it was pretty close to that.
The soundtrack, above all, lives up to the films, no doubt. Listen to the main theme:

<div style="display:table; width:auto; height:auto; margin:auto; position:relative; padding:15px 0 25px 0;">
<audio controls>
  <source src="{{"/static/music/outlaws-main-theme.mp3" | prepend: site.baseurl }}" type="audio/mpeg">
  Oops! It seems that your Browser does not support the audio tag :(
</audio>
</div>

Outlaws is one of the still rare Old West themed First Person Shooters. Published in 1997
by [LucasArts][link_la], it was quite a shift of paradigm for the studio, which then had only done
games based on existing film IPs (Star Wars, Indiana Jones) and a few emblematic point-and-click adventure games.
They took a gamble with an entirely new title and style, and ended up making one of the best western
First Person Shooters to date!

![Outlaws by LucasArts]({{ "/static/images/posts/outlaws-montage.jpeg" | prepend: site.baseurl }} "Outlaws by LucasArts.")

Outlaws started as a spin-off of [*Star Wars: Dark Forces*][link_dark_forces], which was a previous
FPS title by LucasArts. It was an evolution of the same technology used before, which was internally called
the [*Jedi Engine*][link_jedi_eng]. This game engine was similar to the ones used by previous "two and a half D"
games like Duke Nukem 3D and Doom, where it featured 3D levels populated with 2D sprites that always faced the player
(also known as *billboards*).

These primitive 3D engines were not based on polygon rasterization, but raycasting and scanline filling
techniques instead, entirely drawn on software with no hardware acceleration. Outlaws used a very polished
version of such rendering engines, supporting very complex levels with multi-storey buildings, underwater
passages, caves and skyboxes, and of course those breakable windows and bottles everyone loved to shoot at
(shame that back then we didn't have online achievements, otherwise I'd have a "Glass Breaker" badge `;)`).

Outlaws was released in a transitional time period when games were starting to go full hardware-accelerated 3D.
Quake came out almost a year earlier with full 3D worlds, so the graphics in Outlaws left some things to be desired.
That probably contributed a bit for the game not becoming a major market success. Nevertheless, for those who
played the game at an impressionable age, like I did, it was a fantastic game to sink hours in. I always
dreamed about making a fan remake of it, now that I know some stuff about game development, but that'd be
a huge project I fear I wouldn't have the time or resources to undertake. Failing that, doing some reverse
engineering on it should also be a lot of fun!

Let's start out by unpacking the asset files used by Outlaws, see if we can extract a few
sprites, textures or such from the game. By the way, Outlaws is available on [GoG.com][link_gog]!

If you look into your local install of the game, there should be quite a few files, mostly DLLs
(don't know why they relied so much on DLLs, every Windows programmer knows how [they can be a pain in the neck][link_dllhell]),
the files we are going to be looking into today are the `.LAB` files, which are the archives that group all game assets use by Outlaws.

## The LAB file format

LAB files, first four bytes `LABN`, extension `.LAB`, are the **L**ucas**A**rts **B**i**N**ary archive format.
This is a very straightforward game-package-like uncompressed binary format. In the Windows folder where the
game is installed you should be able to find at least:

<pre>
outlaws.lab
olobj.lab
olsfx.lab
oltex.lab
olweap.lab
olpatch1.lab
olpatch2.lab
</pre>

The game was patched several times over the years to add support for D3D and [Glide][link_glide],
so we'll find archives like `olpatch1.lab` in the directory for latter releases.

The file names are more or less self-evident, `olobj` has sprites and configurations for game objects,
`olsfx` has all the WAV sound effects used by the game, `olweap` has sprites for the player weapons
(from the player's perspective), and so on.

An Internet search about the file format should lead to [this Xentax Wiki entry][link_xentax], which was
the only description I could find online. That's a start, but trying out the layout described there didn't
work out-of-the-box. After a few hours of testing and looking at the files in the hexadecimal editor I was
able to figure out the exact layout. I'll give Xentax the benefit of doubt, since the format described
there might be from an earlier version of the game, but that site is known to have errors, such as I've
found in the [Darkstone MTF compression format][link_dstone_post].

Following it a sample of the first few KB of `outlaws.lab`:

![LAB hex dump]({{ "/static/images/posts/lab-hexa-sample.png" | prepend: site.baseurl }} "Hexadecimal view of 'outlaws.lab'")

A LAB archive is divided into four sections, in this order:

1. A tiny LAB archive header;
2. A list of file entry headers for each file inside the LAB archive;
3. A list of null-separated ASCII strings with each file name for the entries;
4. Data for the individual file entries, tightly packed together with no padding in between files.

In the above hex dump, the highlighted block is the list of file names, which precedes the
data for each file in the archive. The following C++ structures for the headers should give a good
idea of how the format is laid out, it is really simple, just an amalgamate of a bunch of files,
with minimal metadata right at the beginning, to save as much space as possible:

{% highlight c++ %}

struct LabHeader
{
   std::uint8_t  id[4];              // Always 'LABN'.
   std::uint32_t unknown;            // Apparently always 0x10000 for Outlaws.
   std::uint32_t fileCount;          // File entry count.
   std::uint32_t fileNameListLength; // Length including null bytes of the filename list/string.
};

struct LabFileEntry
{
   std::uint32_t nameOffset;         // Offset in the name string.
   std::uint32_t dataOffset;         // Offset in the archive file.
   std::uint32_t sizeInBytes;        // Size in bytes of this entry.
   std::uint8_t  typeId[4];          // All zeros or a 4CC related to the filename extension.
};

{% endhighlight %}

As you can see above, the `LabFileEntry` header, which is how we can seek and find a given
file in the blob of data, doesn't have a file name. Instead, it has an offset into the list
of null-separated strings that follow the list of entry headers (`nameOffset`). This is the
only peculiar bit about this format, apart from that it is pretty standard and easy to reverse.

Actually, it is so simple that I went ahead and wrote both an unpacker and a re-packer for LAB archives.
You can find them in the [source code repository][link_repo] (command line tools, so don't expect a GUI).

I haven't tested LABs generate by my tool in the game, but `diff`ing them with the originals seem to
produce identical files, except that sometimes the order of file entries in the archive might be different
from the original, but that should be irrelevant as far as the game is concerned. Hopefully, these simple
tools can be of use to some eager modder out there still interested in the game. Shout out if you are using
the tools for something and would like to have more features added to them!

## What's in the LAB?

Once a LAB archive is opened, we can find a myriad of other custom formats use by the game.
Surprisingly, Outlaws made heavy use of plain text file formats, which is not very usual
in games, which tend to prefer binary for the speed and ease of loading. Most object config
files and such are plain text, following a somewhat standard layout. For example, an `.itm` (Item)
file like `Barrel01.itm`:

<pre>
ITEM 1.0

NAME Barrel01
FUNC Inv_Object
ANIM Barrel01.nwx
DATA 3
    FLOAT  RADIUS  1.0
    FLOAT  HEIGHT  3.0
    STR    TYPE    SHOOT
</pre>

The text files mostly follow this `KEY VALUE` notation, so they probably had a common lexer
tool in the engine for quickly parsing these files. Pretty neat! That makes life a lot easier
for modders and hackers like me `:)`.

The "physical" properties of objects were described by `.phy` files, such as in the following `WATER.PHY`.
Judging by the names of the keys, some parts of the game made use of [Euler Angles][link_euler].

<pre>
PHYS 1.0

ACCEL  X: 100.0  Y: 50.0   Z: 100.0
DECEL  X: 20.0   Y: 120.0  Z: 20.0

MAX_VEL: 15.0
JUMP_VEL: 20.0
STEP_HEIGHT: 3.0
STEP_SPEED: 20.0

BODY_YAW_RATE: 150.0
HEAD_YAW_RATE: 500.0
HEAD_YAW_LOOK_BACK_RATE: 800.0
HEAD_YAW_RETURN_RATE: 300.0

PITCH_RATE: 160.0
OFF_GROUND_ABILITY: 0.9
</pre>

Level geometry textures and UI textures are stored in the old [ZSoft PCX format][link_pcx].
You can open them in a tool like [Gimp][link_gimp]. Most will look like random noise if you open
them, but that's not an error in the extractor. Most of the images are actually [palette textures][link_pal]
(AKA colormaps), so they don't contain a whole image, but a pool of reusable pixels other images can use
to fetch color from. Palettized textures with shared palettes is one of the oldest forms of
lossy image compression used by games.

The sprites for the 2D billboards like the badies and player weapons are stored in a custom binary
format with the `.NWX` extension. This format is not terribly complex, it seems to consist of a
set of uncompressed bitmaps with metadata about each frame of animation. There's a Windows tool called
"Nwx Editor" that allows editing those, you can find it at [theoutlawdad.com][link_oldad]. I didn't
test this tool, but the interesting thing is that the zip package I downloaded in the previous link
also contained a doc with a partial description of the binary format, so maybe I'll look into writing
an NWX editor in the near future...

**Trivia:** The original Outlaws came in a set of two CDs. The CDs not only contained the game
but were also playable in a standard CD Player so that you could listen to the game soundtracks!
I do not know of any other game that has done that. Such an awesome perk, since the soundtracks are
some of the coolest things about this game. If you still have your old Outlaws CDs, you can now open
them in a CD rip tool to extract the musics.

## Where are you Marshal?!?

I mean, where are the game levels?

What would really be cool is to write a modern OpenGL renderer for the game levels,
and I might do that next, as long as I manage to figure out the layout of the
`.LVB` binary format. LVB, I assume, is short for *Level Binary*. This file format would
otherwise be very hard to reverse engineer if it wasn't for the existence of a sibling
`.LVT` variant (*Level Text*) format to use as a base. Actually, in this version of the game
I'm looking at there's only one lucky LVT file sample, without which I would probably have
given up reversing the LVB format. The LVT text variant follows a similar structure to the other
text files used by the game, so its is pretty easy to parse, the hard part though is
making sense of the data. Like I mentioned in the beginning, the 3D elements of the game
are not defined in the now usual sense of polygons or triangles. Levels were comprised
of "walls" and "sectors", so converting that to renderable geometry is a little tricky.

Based on the LVT, I'll try to figure out the LVB format in the next few weeks and see were it leads,
so stay tuned for more `:P`. The really cool thing to do would be to actually write a raycast
engine and draw the game levels "the proper way", but I'll probably cheat and just find a way of
converting the data to OpenGL triangles. Maybe after that, if I'm still up for it, I'll give
a raycaster a try and see if I can draw the Outlaws maps in the same way the game did.

## Bonus track: A peek into the code

One thing that saddens me as a game programmer is that source code for my favorite
classics will never be made Open Source. The brutal reality is that most of these games
were made in a time when source code repositories and online storage barely existed, so
in the vast majority of cases the source code simply got lost forever when companies
closed or got acquired by others. It is very possible that the only copies of source code
for most of the LucasArts classics ended up in some dumpster inside the hard-drive of an old IBM PC.

The closest we can get from looking at the source code today is by disassembling the remaining
executables. That unfortunately is nowhere near looking at the original code, but, looking
into the executable of Outlaws did yield a nice surprise.

I ran `outlaws.exe` through the [`strings`][link_gnu_strings] utility trying to filter any printable strings
from the binary. It turns out that the game had a few instances of what appears to be hardcoded
log calls that had function names in them for tracing. Those log calls made into the release
build, maybe by mistake. Following is an excerpt, we can get a feel for the style of the code
and spot the names of the key systems of the game and Jedi Engine. The game was probably written mostly in C.

**Function names apparently from log calls in the game code:**
<pre>
<b>Actor_SysInitialize:</b> Attempt to reinitialize actor module
<b>Atx_SysInitialize:</b> Attempt to reinitialize Atx system
<b>CmmLex_SysInitialize:</b> Attempt to reinitialize CmmLex system
<b>Cmm_SysInitialize:</b> Attempt to reinitialize Cmm system
<b>Collide_SysInitialize:</b> Attempt to reinitialize Collide system
<b>Color_SysInitialize:</b> Attempt to reinitialize Color system
<b>Config_SysInitialize:</b> Attempt to reinitialize Config system
<b>Control_SysInitialize:</b> Attempt to reinitialize Control system
<b>DB_SysInitialize:</b> Attempt to reinitialize DB system
<b>DLL_SysInitialize:</b> Attempt to reinitialize DLL system
<b>Dbm_SysInitialize:</b> Attempt to reinitialize Dbm system
<b>DeadReck_SysInitialize:</b> Attempt to reinitialize DeadReck system
<b>Display3D_SysInitialize:</b> Attempt to reinitialize Display3D system
<b>Display_SysInitialize:</b> Attempt to reinitialize Display system
<b>Drivers_SysInitialize:</b> Attempt to reinitialize Drivers system
<b>Elevator_SysInitialize:</b> Attempt to reinitialize Elevator system
<b>Enemy_SysInitialize:</b> Attempt to reinitialize Enemy system
<b>FX_SysInitialize:</b> Attempt to reinitialize FX system
<b>FileUtil_SysInitialize:</b> Attempt to reinitialize FileUtil system
<b>Gen_SysInitialize:</b> Attempt to reinitialize Gen system
<b>Graph_SysInitialize:</b> Attempt to reinitialize Graph system
<b>IFace_SysInitialize:</b> Attempt to reinitialize IFace system
<b>Inf_SysInitialize:</b> Attempt to reinitialize Inf system
<b>Info_SysInitialize:</b> Attempt to reinitialize Info system
<b>Inv_SysInitialize:</b> Attempt to reinitialize Inv system
<b>Item_SysInitialize:</b> Attempt to reinitialize Item system
<b>Jedi_SysInitialize:</b> Attempt to reinitialize Jedi system
<b>Kbd_SysInitialize:</b> Attempt to reinitialize Kbd system
<b>Level_SysInitialize:</b> Attempt to reinitialize Level system
<b>List_SysInitialize:</b> Attempt to reinitialize List system
<b>Logic_SysInitialize:</b> Attempt to reinitialize Logic system
<b>Map_SysInitialize:</b> Attempt to reinitialize Map system
<b>MemVirt_SysInitialize:</b> Attempt to reinitialize MemVirt system
<b>Memory_SysInitialize:</b> Attempt to reinitialize Memory system
<b>Misc_SysInitialize:</b> Attempt to reinitialize Misc system
<b>Module_SysInitialize:</b> Attempt to reinitialize Module system
<b>Module_SysInitialize:</b> Attempt to reinitialize PCX system
<b>Movie_SysInitialize:</b> Attempt to reinitialize Movie system
<b>MuScript_SysInitialize:</b> Attempt to reinitialize MuScript system
<b>Music_SysInitialize:</b> Attempt to reinitialize Music system
<b>NetMsg_SysInitialize:</b> Attempt to reinitialize NetMsg system
<b>Network_SysInitialize:</b> Attempt to reinitialize Network system
<b>Node_SysInitialize:</b> Attempt to reinitialize Node system
<b>Obj3DO_SysInitialize:</b> Attempt to reinitialize Obj3DO system
<b>Path_SysInitialize:</b> Attempt to reinitialize Path system
<b>Physics_SysInitialize:</b> Attempt to reinitialize Physics system
<b>Platform_SysInitialize:</b> Attempt to reinitialize Platform system
<b>Player_SysInitialize:</b> Attempt to reinitialize player system
<b>RLE_SysInitialize:</b> Attempt to reinitialize RLE system
<b>Rcp_SysInitialize:</b> Attempt to reinitialize Rcp system
<b>Res_SysInitialize:</b> Attempt to reinitialize Resource system
<b>Router_SysInitialize:</b> Attempt to reinitialize Router system
<b>Screen_SysInitialize:</b> Attempt to reinitialize Screen system
<b>Sector_SysInitialize:</b> Attempt to reinitialize Sector system
<b>Server_SysInitialize:</b> Attempt to reinitialize Server system
<b>Shot_SysInitialize:</b> Attempt to reinitialize Shot system
<b>Slope_SysInitialize:</b> Attempt to reinitialize Slope system
<b>Sound_SysInitialize:</b> Attempt to reinitialize Sound system
<b>Symbol_SysInitialize:</b> Attempt to reinitialize Symbol system
<b>Task_SysInitialize:</b> Attempt to reinitialize Task system
<b>Term_SysInitialize:</b> Attempt to reinitialize Term system
<b>Text_SysInitialize:</b> Attempt to reinitialize Text system
<b>Texture3D_SysInitialize:</b> Attempt to reinitialize Texture3D system
<b>Tokenize_SysInitialize:</b> Attempt to reinitialize Tokenize system
<b>Trigger_SysInitialize:</b> Attempt to reinitialize Trigger system
<b>Wall_SysInitialize:</b> Attempt to reinitialize Wall system
<b>Wav_SysInitialize:</b> Attempt to reinitialize Wav system
<b>Wax_SysInitialize:</b> Attempt to reinitialize Wax system
<b>Weapon_SysInitialize:</b> Attempt to reinitialize Weapon system
<b>World_SysInitialize:</b> Attempt to reinitialize World system
</pre>

[link_dollars]:     https://en.wikipedia.org/wiki/Dollars_Trilogy
[link_la]:          https://en.wikipedia.org/wiki/LucasArts
[link_ol_game]:     https://en.wikipedia.org/wiki/Outlaws_(1997_video_game)
[link_dark_forces]: https://en.wikipedia.org/wiki/Star_Wars:_Dark_Forces
[link_jedi_eng]:    https://en.wikipedia.org/wiki/Jedi_(game_engine)
[link_gog]:         http://www.gog.com/game/outlaws_a_handful_of_missions
[link_dllhell]:     https://en.wikipedia.org/wiki/DLL_Hell
[link_glide]:       https://en.wikipedia.org/wiki/Glide_API
[link_xentax]:      http://wiki.xentax.com/index.php?title=Lucus_Arts_LAB
[link_dstone_post]: http://glampert.com/2015/09-01/reverse-engineering-darkstone/#mtf-compression
[link_repo]:        https://github.com/glampert/reverse-engineering-outlaws
[link_euler]:       https://en.wikipedia.org/wiki/Euler_angles
[link_pcx]:         https://en.wikipedia.org/wiki/PCX
[link_gimp]:        http://www.gimp.org/
[link_pal]:         https://en.wikipedia.org/wiki/Palette_(computing)
[link_oldad]:       http://www.theoutlawdad.com/Files.html
[link_gnu_strings]: https://sourceware.org/binutils/docs/binutils/strings.html


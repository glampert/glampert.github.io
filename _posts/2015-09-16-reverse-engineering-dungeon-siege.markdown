---
layout:     post
title:      Reverse engineering Dungeon Siege
author:     Guilherme Lampert
categories: Miscellaneous Reverse-Engineering
thumbnail:  dsiege
---

* Contents
{:toc}

[Dungeon Siege][link_ds] is my all times favorite RPG game. I like everything about it, the multi-char party
system, the combat mechanics, the continuous world, the monsters, the story and of course, the soundtrack.
Just listen to the main theme:

<div style="display:table; width:auto; height:auto; margin:auto; position:relative; padding:15px 0 25px 0;">
<audio controls>
  <source src="{{"/static/music/dsiege-main-theme.mp3" | prepend: site.baseurl }}" type="audio/mpeg">
  Oops! It seems that your Browser does not support the audio tag :(
</audio>
</div>

Everything about the game is so well rounded and polished that there's little to complain about.
Dungeon Siege was the first game published by developer [Gas Powered Games (GPG)][link_gpg], a studio
founded by top-of-the-line industry veterans, including [Chris Taylor][link_chris_taylor], the designer
behind the renowned *Total Annihilation* strategy title.

The expansion pack, [Legends of Aranna][link_ds_loa] is also very good. It is basically a new single player
campaign added to the same game, so if playing Dungeon Siege's original campaign ten times was not enough,
you could get an entirely new story mode with the expansion for ten more playthroughs!

<div class="image512">
<img src="{{"/static/images/posts/dsiege/dsiege-loa-box-art.jpeg" | prepend: site.baseurl }}"
	alt="Dungeon Siege by GPG" title="Dungeon Siege and Legends of Aranna expansion." />
</div>

![Dungeon Siege by GPG]({{ "/static/images/posts/dsiege/dsiege-in-game.jpeg" | prepend: site.baseurl }} "Dungeon Siege by Gas Powered Games.")

The game was a resounding success, generating two sequels (Dungeon Siege 2 and 3)
and several other expansions, DLCs and ports. It is unfortunate that GPG ended up
closing shop circa 2013 and was later acquired by Wargaming.net, shifting focus to
other genres of games.

But Dungeon Siege was not just an awesome game to play, it was also a Software Engineering gem.
A lot of technical information about it was made available by GPG for the mod community, and
so it seemed like a perfect game for a more in-depth look in my series of posts on reverse
engineering some of my favorite classics.

Let's start by taking a detailed look into the main custom file formats used by the game
to store assets like textures, 3D model, sounds, sprites, etc, then see if we can open
them outside the game, for the sake of nostalgia.

## When it all started

I actually started looking into Dungeon Siege with some ideas of reverse engineering it
in mid 2014, when I found by accident [Scott Bilas'][link_scott_bilas] website, a former GPG programmer.
I was amazed to find out that so much detail about the game's Engine was public. Soon after I started writing
an extractor for the Tank archives based on the info found there (and of course, ended up playing the game
from start to finish AGAIN).

Time went by and I put this toy project aside to finish my University dissertation.
But now that I've got some free time and decided to focus more on the subject of analyzing
and reversing vintage games, I've reopened the project and moved it to [GitHub][link_git_prj].

My goals were when I started, and still are, to learn as much as I can about the technical
aspect of the game and reverse/convert the proprietary file formats that store
the game assets to other standard formats that I can open on freely available tools.
Starting with the Tank archive format, Dungeon Siege's main compressed archive format.

### Tank archives

If you take a peek at your local install of the game, you should see a couple DLL files,
the main game executable, `DungeonSiege.exe`, some text files with configuration parameters
and other miscellaneous small files. The big ones, likely to have the game's data, will be files
with the `.dsres`, `.dsmap`, `.dsm` or `.dssave` extensions. Those will be in the tenths of megabytes size range.

Do an Internet search about those filename extensions and you should come across a couple
tools for editing and manipulating *Tank* archives. GPG released official tools for modders
to create their own Tanks with custom game content. A more careful search might lead you
to Scott Bilas' personal site, where he made available [a C++ header file][link_tank_struct] from
the game's source code that contains the structure of a Tank archive. Finding this file made things
all too easy. In roughly a day, I was able to implement a tool for file extraction from
GPG Tanks. But let's take a closer look at this interesting file format anyways.

The Tank file format is a binary archive format similar to a Zip archive,
which is used to store most of the assets of Dungeon Siege 1 and DS LoA.
Common Tanks found in the game's install directory include:

<pre>
World1.dsm     World.dsmap     MpWorld.dsmap
Objects.dsres  Terrain.dsres   Voices.dsres
Logic.dsres    DevLogic.dsres  Auto-Save.dsasave
</pre>

You can get a pretty good idea of what the archives store judging by their names.
Let's take a look at the first few bytes of a Tank in an Hexadecimal editor:

![Hex view of a Tank file](https://raw.githubusercontent.com/glampert/reverse-engineering-dungeon-siege/master/misc/screenshots/tank-header.png "Hex view of a Tank file (Logic.dsres).")

We can see that the file starts with two human readable 4CCs (Four Character Codes),
`DSig` and `Tank`. There's an additional "creator id" 4CC further down, in the above
example, from `Logic.dsres`, we read `!GPG`, which means this is an official archive
created by Gas Powered Games. A file created by a third-party/modder would have a
custom signature.

We can also pick up other readable strings there, probably added for displaying
purposes by editing tools, like: `Dungeon Siege Core: Logic and Configuration Files`.

All that data is part of the big Tank header. The archive header is full of metadata,
such as build dates, CRCs and versions. Not very relevant data for us. The two most relevant
fields in the header are the offsets to the "file set" and "directory set".

As mentioned above, the Tank archive is very similar to a Zip. It stores the list
of file/directory entries at the end of the file, just as a Zip does. This might seem
strange, but there are two main possible reasons for this layout:

1. If you're seeking to the end of the file to get its length, then it makes sense putting
the file/dir metadata in there, since that's what the application must read next before any
further processing.

2. Adding new files to an existing archive is easier this way. You just have to append
the new data to the end, overwriting the file/dir entries, then just write a new updated
file/dir entry set. This should be more efficient than rewriting the whole file when
handling big archives.

Data for the individual files inside a Tank archive are possibly (and likely) stored with
compression. Tanks supported data compressed with ZLib and LZO compression, and also
uncompressed (raw) data. ZLib is the most frequently used compression, from what I've seen.

The format was also carefully designed to be mostly aligned to DWORD boundaries (4 bytes boundaries).
Text strings are prefixed by a length (16-bits) and padded to align to a DWORD. This was
probably done like this to allow safely mapping the file into memory using the WinAPI.

Overall, the Tank format seems very optimized and tunned to perfection, serving the needs of
the game as efficiently as possible. Clearly a format devised by an experienced programmer.

My implementation was largely influenced by the source code snippets provided by Scott Bilas [in his website][link_scott_bilas].
You can always refer to the [source code of my implementation][link_git_tank1] and [this more detailed description of the format][link_git_tank2]
for the nitty-gritty details. I also wrote a command-line tool for archive extraction, you'll find it in the repository as well.

Once a Tank is decompressed, we find several other custom file formats used internally by the game.
Let's take a look at the more interesting ones in the next sections.

### Dungeon Siege Aspect models

3D models for characters, items, scene props, or anything but the terrain, are stored in files
with the `.asp` extension. These contain binary data with the model geometry and bones (for animation),
plus basic material information. ASP appears to be short for *Aspects*. Funny name, no idea what it
was supposed to mean.

The Aspect models were exported from the *3D Studio Max* modeling suite using a set of custom import/export scripts.
With some digging in the [SiegeTheDay.org](http://www.siegetheday.org/) forums, I was able to find a copy of these scripts,
which made the implementation of a model importer a lot easier. You can find the importer code and a simple tool to convert
Aspects to Wavefront OBJ [in the repository][link_git_asp]. At the moment, my code imports the bone information,
but to properly animate the models, you still have to import the animation frames from the PRS files that come
bundled with each ASP. There's a PRS 3D Studio Max script available with the others I found, but I haven't implemented
a C++ importer for them yet, so my code is currently only able to export static models to Wavefront OBJ.

Looking into the details, the Aspect format is a chunked binary file that somewhat resembles the
old [3DS format][link_3ds_fmt]. Some of it was probably based on the 3DS, since the tool
that generates it is the 3D Studio package.

Each chunk or section could in theory be presented in any order, but they do follow
a fixed ordering. A section might be omitted, however, so the safest bet is to assume
no ordering of contents and handle sections as they are read in.

The format is fairly complex (unnecessarily complex, in my opinion) and reading it
takes a loop that gets a 4CC and tests it against the known sections ids.

**ASP chunk ids:**

<pre>
<b>BMSH</b> -> Model header.
<b>BONH</b> -> Bone Hierarchy.
<b>BSUB</b> -> Sub-mesh info.
<b>BSMM</b> -> More data related to sub-meshes or materials.
<b>BVTX</b> -> Model vertex positions.
<b>BCRN</b> -> Corners (what I would call a model vertex).
<b>WCRN</b> -> Weighted corners (same as BCRN but with vertex weights).
<b>BVMP</b> -> Bunch of corner indexes. Not quite sure what for...
<b>BTRI</b> -> Triangle indexes (sets of 3, one per vertex).
<b>BVWL</b> -> Stuff related to bone weights.
<b>STCH</b> -> Stitches (what the heck are they?).
<b>RPOS</b> -> Rotations and positions for bones.
<b>BBOX</b> -> Bounding boxes? Seems like it was never fully implemented...
<b>BEND</b> -> Some misc info strings for displaying.
<b>Note: Vertex/Triangle indexes are 32-bits.</b>
</pre>

A lot of data also appears to be repeated in the format, like the BVMP which
is redundant with the face info from BTRI. Also, why keep the weighted vertexes
in WCRN and simpler ones in BCRN? For different LODs?... Backward compatibility?...

Models also have skeletons/bones for animation when paired with a PRS animation file.
Bones have name strings that are stored in the BMSH section as null separated strings
inside the "text field" of BMSH. The contents of each section are basically arrays
of structures. Each section will start with a count for the number of elements to read next.

The overall processing loop for an ASP model is something in the lines of:

<pre>
while not end_of_file()
{
    4cc = read_4cc();

    if 4cc == <b>BMSH</b> then
        handle_BMSH_section();

    if 4cc == <b>BONH</b> then
        handle_BONH_section();

    // and so on for each section.
}
</pre>

This format is far from optional and distinct from the other formats
which seem a lot more optimized, which makes me think it was probably
devised by some technical artist with limited knowledge of programming...
Or maybe it's just a format that grew out of hand while someone tried
to maintain it backward-compatible with previous versions...

**Following are screenshots of models converted to OBJ using my tool:**

![Miscellaneous ASP models from DSiege](https://raw.githubusercontent.com/glampert/reverse-engineering-dungeon-siege/master/misc/screenshots/montage.png "Miscellaneous ASP models from DSiege.")

### Siege Nodes and the Continuous World

The next key file format used by Dungeon Siege is the "Siege Node" format (file extension `.sno`).
This is the binary format used to store static map geometry, e.g.: walls, ground, doors, buildings, etc
(trees and bushes not included, those are in ASP format).

A Siege Node is much like a 3D tile of arbitrary dimensions. The world of Dungeon Siege is built by
attaching these nodes side by side to construct the larger scenes. In its simplest form, the game
was tile-based. Even though the world is three dimensional, the game entities moved mainly in the X-Z
plane (moving in the Y was also possible with stairs and elevators, but the tile based design doesn't
impose much limitations on this).

This paper by Scott Bilas, [**The Continuous World of Dungeon Siege**][link_cworld_paper], explains the
node system in great detail. The "infinite" world setup is probably the most interesting technical
aspect of Dungeon Siege. The paper explains that from the beginning they didn't want to have
loading screens after the player started a game, so the solution was to subdivide the world into these tiles
(Siege Nodes) that are dynamically loaded on demand and discarded when no longer in view. That posed
a lot of challenges to the team of programmers, like how to handle precision issues with one single
huge level for the whole world. Their solution was very clever, by creating a "node space" system,
where the relevant position of each entity is not handled in actual world space, but relative to the
current node it is in.

This node system was novel at that time, and creating it must have been an amazing task, though
probably very stressful at times, like it always is when creating something entirely new.
I strongly suggest taking the time to read the Continuous World paper above, it's fairly long,
16 pages, but incredibly detailed, not just about the Siege Node system but also about all
the challenges the team faced on that and other aspects of the game and the solutions and
compromises they had to make to deliver the "no loading screens" goal.

A quote from Scott Bilas, [found in his website][link_scott_bilas], regarding the world streaming setup:

> Our Engine enabled us to have dense, variable, heavily scripted content in all directions,
> and the designers took full advantage of this. The regular resetting of the world origin and
> everything-is-relative terrain graph meant that we could literally go to infinity with no loss
> of precision. The Engine supported up to eight separate streaming worlds in memory simultaneously,
> one per party member in single player or per-player in multiplayer. You could have everybody in a
> different part of the world and switch among them instantly. To my knowledge no game has done this since.

But that setup was complex and probably took its toll in the team and development time, he adds further:

> Overall, though, I wouldn't do a streaming world Engine the same way again. Like I said, it was expensive.
> Hard to understand, hard to code against correctly, hard to optimize. Though we succeeded, and what we did
> was cool as hell, I'd steer away from our design. Hundreds of streaming-world games have shipped since Dungeon Siege.
> From what I can tell, the industry has settled on the "giant bricks" model of world subdivision. I'd go with that.

Back to the SNO file format, this is a relatively straightforward one, with four sections of data
following a header. Each section is just a binary dump of an array of structures, prefixed by the
length of this array in elements as a 32-bits DWORD.

A SNO might also store text strings in it. A string is a sequence of ASCII chars terminated
by one or more zeros. To read in a string, keep reading bytes until you get a null-byte or EOF.

**Siege Node (SNO) sections:**

- The "spots" section. Not sure what a spot meant in the context of Dungeon Siege.
Each spot consists of a 4x3 transformation matrix and a string of arbitrary length.
This was probably used to position the Siege Nodes in the world.

- The "doors" section. A door is how they called the passages between nodes.
As explained in the Continuous World paper, the term remained from the early
development stages when these were actually doors, but later the term was just
used to mean the passages between nodes. This data is not used for rendering,
but was probably significant for AI pathfinding and game logic.
Each door structure is a 32-bits index, a 4x3 transformation matrix
and an array of "hot spot" indexes (not sure what those are for).

- Next up are the "corners". Corner is how they called an interleaved model vertex
in Dungeon Siege (if you think about it, that's not a complete misnomer). Each corner
or vertex is composed of the XYZ 3D position of the vertex (float) in model space, the XYZ vertex
normal for lighting (float), the vertex color, strangely stored as **RBGA** (4 bytes)
and lastly the U and V texture coordinates (floats).

- Last in the SNO file are the "surfaces". Surfaces are the mesh faces (always triangles).
Each surface stores a list of 16-bits triangle indexes for the tris making that surface.
Note that unlike the ASP format, SNO files store the indexes as uint16s.
Each surface also has a text string with its texture/material name.

Overall, the SNO format is fairly straightforward and easy to import.
All sections have a fixed position, so it doesn't require loops or
multiple passes over the file to load it. You can even skip over an entire
section if you want to by just multiplying the element count with the size of each entry.

I wrote a simple tool that converts SNO to Wavefront OBJ, check [the repository][link_git_prj].
Following are a couple samples of what a node looks like.

<div class="image512">
<img src="https://raw.githubusercontent.com/glampert/reverse-engineering-dungeon-siege/master/misc/screenshots/ds-20.png"
	alt="Siege Node of a house in the frozen town of Glacern" title="Siege Node of a house in the frozen town of Glacern." />
</div>

<div class="image512">
<img src="https://raw.githubusercontent.com/glampert/reverse-engineering-dungeon-siege/master/misc/screenshots/ds-35.png"
	alt="Dragon skull from the Ice Caves" title="Dragon skull node from the Ice Caves." />
</div>

<div class="image512">
<img src="https://raw.githubusercontent.com/glampert/reverse-engineering-dungeon-siege/master/misc/screenshots/ds-36.png"
	alt="Dragon bones from the Ice Caves" title="Dragon bones node from the Ice Caves." />
</div>

### Raw textures and sprites

The RAW format (or simply raw; not an acronym) is a bitmap format used to store all the
textures and sprites used by Dungeon Siege. Raw textures are always stored inside Tank archives.
This is a custom format, not directly related to other commercial formats with the `.raw`
filename extension.

The name comes from the fact that pixels are stored uncompressed (raw) in the file.
Raw textures can also contain the full set of mipmap surfaces. File layout is binary,
byte order little endian, but pixels are stored as **BGRA** DWORDs.

A raw texture file starts with a tiny 16 bytes header that contains the dimensions
of the base surface (mipmap 0) and the number of surfaces/mipmaps. The dimensions
of subsequent mipmap surfaces are calculated from that. The first 8 bytes of the
header are the 4CCs `ipaR` (or `Rapi` backwards) and `8888`. BGRA pixel data for
surface 0 (the largest one) follows immediately. The next mipmap surface follows
where the first one ends, and so on for all subsequent surfaces until the final 1x1 level.

The raw format is very straightforward and was meant to be fast to load and pass
on to the rendering back-end. It was stored uncompressed because Tank archives are
already compressed, so no point in compressing twice.

All model/node textures are in raw format. The 2D UI sprites and inventory items
are also in raw format. Interestingly, the 2D sprites were not stored in prebaked texture
atlases. Each individual sprite is a separate image, so there are thousands of tiny sprite
images inside the game's archives. This might seem like a terrible way of handling the data
at first, since it would result in so many small textures being allocated, but if you remember
that the whole idea behind the game was of on-demand streaming of world content, packing
a bunch of sprites in the same texture would mean a lot of memory gets wasted when those
sprites are not visible (think of the inventory, you're only seeing a tiny fraction of all
the items at any given time). So having each sprite as a separate texture ensures only
the visible stuff gets loaded, just like it is with the Siege Nodes. And of course,
it is very likely that the Engine did pack all those tiny textures into one or more shared atlases
that were probably recreated on demand, to at least reduce the number of texture switches when rendering.

![Sample sprites and textures]({{ "/static/images/posts/dsiege/dsiege-sprites-tex-samples.jpeg" | prepend: site.baseurl }} "Sample sprites and textures. Each of the above was stored in a separate image.")

### Save files

Dungeon Siege save games are written to the user's home under "My Documents". You can find them inside
`My Documents\Dungeon Siege\Save`. Each save filename is in the form:

<pre>[player_name]-[save_slot_num].dssave</pre>

The auto-save file is named `Auto-Save.dsasave`.

The `.dssave` format is actually a Tank file in disguise. Decompressing a save archive
should output two Windows bitmap (`.bmp`) images, the player's portrait and a very low-res
screenshot of when the game was saved (80x60px or so).

It will also contain the `info.gas`, a text configuration file with miscellaneous global
game settings and a list of the Tank archives the game has to load, and `party.gas`, the
configuration file with all player and party related parameters. The easiest way to cheat
in the game is probably by editing the skill levels and gold amount in this file `;)`.
The current inventory is also listed there.

Besides the above, there should also be a `world.xdat` and a `world.xidx` inside a Tank save file.
These two formats are partially known, thanks to Scott Bilas, who [made public the C++ header file][link_save_files]
of the reader/writer used in the game.

The `.xdat` file format, 4CCs `DSig`+`DXfr`, is a "DATA" file, which stores a list of
value-pair strings. It is not a plain text file because the string lengths are binary words.
This file basically stores all the strings related to dynamic game objects, needed to
restore a save point.

The `.xidx` file format, 4CCs `DSig`+`IXfr`, is an "INDEX" file, which basically
stores a hierarchy of binary data blocks.

I haven't looked into these two format in much detail, so if you're interested in editing
save games, make sure to dissect the header file I've linked above for all the details.

### Other file/data formats

There are a number of other file formats used by Dungeon Siege.
Some are plain text, others are binary. The most interesting ones:

#### PRS animation data

This format contains animation data/keyframes needed to animate
the skeletons of an ASP model. Implementing an importer for it
should be easy, since there's a 3D Max script available with a functioning
implementation. You can find a copy [here][link_prs_script].

No idea what "PRS" stands for...

#### GAS files

The `.gas` files (Tanks store gas, get it `:P`) are miscellaneous configuration/metadata
text files. Most seem auto-generated. Some contain script-like code inside. Gas files
store various types of metadata required by the game. ASP models and textures
are usually paired with a Gas file containing additional parameters.

#### LNC files (unknown)

Usually the extension of a file named `siege_nodes.lnc`, so more than likely
related to the Siege Nodes. They can be found inside the World/World1/MpWorld Tanks.
Some are pretty big, with 1+MB, some are just a few Kilobytes.

From a quick look in the Hex editor, nothing meaningful pops up.
Perhaps the data is compressed? Unlikely, since Tank archives are
already compressed, but that could explain the seemingly random patterns.

There are several blocks of consecutive zeros in them. Padding maybe? Fixed length strings?

#### LQD20 files (unknown)

There's a file named `dir.lqd20` for every directory inside a Tank.
File magic is the 4CC `.LQD` (0x2E4C5144). Probably stands for "Liquid",
taking into account all the analogies with tanks, gas...

Second DWORD seems to be always 0x06000100 (64542 LE). Third DWORD is always zero.

These are small binary files (a few KBs max). There's a string with the name of the parent
directory right at the end. Apparently zero terminated. No length prefix. Doesn't seem to be aligned either.

Some have filename strings in them and strings representing hexadecimal
constants (GUIDs probably). Example: `filename t_cf_fort-a1 0xab040201`.

LQD20s were maybe used by the in-house editors/tools for file system indexing?
Seems superfluous for the game's asset manager since the Tank archives already
have a virtual file system with a list of all files/directories.

#### Bink videos

The few cutscenes of DSiege are saved in Bink format. Bink is a very standard compressed
video format used by a lot of games in the late nineties. Probably still used today,
but I guess it lost space for more standard formats like MP4.

You can get a free Bink video player at [www.radgametools.com](http://www.radgametools.com/bnkmain.htm).

## Skrit and FuBi - Advanced scripting in Dungeon Siege

Dungeon Siege, like most modern large scale games, is heavily content driven. Most of the
game logic was scripted using a high-level case-specific scripting language called *Skrit*.

The Skrit scripting language is fairly sophisticated and relies a lot on the Game Object pattern.
By the way, Dungeon Siege is well known for its very polished Game Object system, which was subject
of several presentations and papers. On of such [was this GDC 2002 presentation][link_gdc02].

There is a very detailed [technical manual][link_skrit_manual] available on the Skrit language, it's
definitely worth reading for those interested in programming languages and compilers. The highlights
about Skrit are:

- The language is parsed and compiled with the help of the well known [Lex & Yacc](http://dinosaur.compilertools.net/) tools.
Syntax is C-based, most likely because of that choice of toolset. According to the document linked above: *"Skrit supports
events, triggers, states, dynamic and static state transitions, local functions, locally and globally scoped variables,
C-preprocessor-style conditional compilation, etc"* -- Very nice!

- The language is interpreted by a stack-based Virtual Machine, running Skrit bytecode (called *p-code* in the documentation).
The set of virtual instructions is very small and easy to manage. The full specification is available in the document.

- All user defined variables and functions had to be suffixed with a dollar sign (`$`). According to the document,
this was done to prevent user names from clashing with future reserved keywords that might be introduced in the
language. A questionable choice, in my opinion. After all, those `$` everywhere are what make PHP suck so much, right?

----

**A sample Skrit extracted from the game:**

{% highlight c %}

// Animation Skrit: preview
// History:
//        VERSION 1.0:    Initial implementation
//
// Notes: This chore assumes we have the following
// animations to work with: (from the template GAS file)
//
//        00 = dff;
//        01 = dff-2;
//

property int MAJORVERSION$ = 1;
property int MINORVERSION$ = 0;

/////////////////////////////////////////////////////////////////////////////
// Utilities

RestartChore$ ( aspect asp$ ) {

    int newanim$ = 0;

    asp$.blender.ResetTimeWarp();

    int bg$ = asp$.blender.OpenBlendGroup();
    asp$.blender.AddAnimToBlendGroup(newanim$,1);
    asp$.blender.CloseBlendGroup();
    asp$.blender.SetBlendGroupWeight(bg$,1);

    asp$.UpdateBlender(0);
}

/////////////////////////////////////////////////////////////////////////////
// States

startup state LoopForever$
{
    event OnStartChore$ ( aspect asp$, float ease$, float /*speed_bias$*/ )
    {
        RestartChore$ ( asp$ );
    }

    event OnUpdate$(aspect asp$, float delta_t$)
    {
        int events$ = asp$.UpdateBlender(delta_t$);

        if (AnimEventBitTest(events$,ANIMEVENT_FINISH)) {
            RestartChore$ ( asp$ );
            asp$.AnimationCallback('rset');
        }
    }
}

{% endhighlight %}

----

A powerful scripting language is only half the story. The scripts are of no use if they can't communicate
with the native game code. That's where [**FuBi, the Function Binding system**][link_fubi_paper] comes into play.

FuBi is yet another engineering gem from Dungeon Siege. Language interoperability is a complex topic.
Several solutions have come up over time, but no on-size-fits-all solution seems to be possible.

In the end, it was no different with Dungeon Siege. Acknowledging that, they decided for a very platform specific
but tailored solution that fit the game nicely, but made it heavily dependent on the Windows Runtime and MSVC compiler.

Nevertheless, FuBi was a very clever solution. The paper above explains it in great detail. That paper was
so well received that it ended up as an entry in the first [Game Programming Gems][link_gems_book] book.
Scott Bilas, the author, was kind enough [to make the chapter available in his site][link_fubi_gem].

Basically, the goal behind FuBi was to allow native C/C++ functions to be exported in the most transparent way possible,
without requiring extensive efforts from the programmer, such as creating wrapper functions or annotating code with abusive macros.

They did it by leveraging Microsoft's compiler and the PE (Portable Executable) file format.
When the game starts, the Function Binding system queries the exported function table from the executable,
with help from the WinAPI, fetching the names and addresses of all exported native functions.
From there, the scripting system builds a database of function names, their parameters, calling conventions,
addresses, etc, that can be used to dynamically invoke any registered function during running by its textual name.
This of course required making a lot of assumptions about the platform and compiler versions, plus
the code that actually calls the functions from a raw address and manipulates the stack must be written
in architecture-specific assembly language.

The main advantage, though, was that exporting a function from the C++ code was as easy as
annotating it with a [`__declspec(dllexport)`][link_dllexp] (MSVC's way of exporting the symbol), which
made the compiler insert that function or class method in the list of exported symbols of the module.
This trick was very neat, since `dllexport` is usually used for DLL symbols, but there's nothing
preventing it from being applied to functions in a normal executable.

The following diagrams tries to outline this setup. The game's executable exported a list of symbols (functions)
that were then fetched during runtime using the Windows debug utilities (`DbgHelp.dll`). The game scripts would
then be able to reference native functions by name once the runtime function database was ready.

![Function Binding in Dungeon Siege]({{ "/static/images/posts/dsiege/dsiege-fubi.png" | prepend: site.baseurl }} "Function Binding (FuBi) in Dungeon Siege.")

The trade-off for this setup was portability, but the resulting system allowed for building the rich and open
world of Dungeon Siege much faster and efficiently, so it must definitely have paid off in the end.

A more modern and portable approach for such a system nowadays would probably involve a preprocessing
step of the source code to generate meta information, then compile the generate code with the rest.
But back then they didn't have advanced Open Source tools like [LLVM/Clang][link_llvm] and [GCC-XML][link_gccxml],
so I'd say that the FuBi system was first grade out-of-the-box thinking!

## Trivia

Dungeon Siege is known for some of its Easter Eggs. The most famous probably being the [giant chickens
secret dungeon][link_secret_lvl], where you get to battle giant chickens named after each member of the development team.
That's a pretty hard dungeon to unlock by the way, it is very well hidden, kudos to the first player who found it!

<div class="image512">
<img src="https://raw.githubusercontent.com/glampert/reverse-engineering-dungeon-siege/master/misc/screenshots/ds-34.png"
	alt="Chicken" title="A giant chicken from the secret level, I think..." />
</div>

One my favorite things to find when reverse engineering files and assets from games are stuff related
to Easter Eggs, however, this time I didn't really find anything out of ordinary in Dungeon Siege.
I'm fairly certain there might be a few unexpected surprises in the middle of the game's data, but there's
just so much content in this game that it would take too much time to go through each asset and see if
there's anything unusual about it, so I lack the patience for that.

That being said, I did find a few awkward items worth mentioning.

**This thing, AKA "The Nuke":**

<div class="image512">
<img src="https://raw.githubusercontent.com/glampert/reverse-engineering-dungeon-siege/master/misc/screenshots/ds-28.png"
	alt="The Nuke" title="&ldquo;The Nuke&rdquo;" />
</div>

Haha, never came across this item in the game on all my playthroughs. Could be some secret weapon
from the Goblins, maybe? Internet didn't turn up much info about it either. If you know where to
find it inside the game, send me an email with instructions, would ya?

**This cow has a GPG logo in its leg:**

<div class="image512">
<img src="https://raw.githubusercontent.com/glampert/reverse-engineering-dungeon-siege/master/misc/screenshots/ds-32.png"
	alt="Gas Powered Cow" title="Just an ordinary cow, minding its own business." />
</div>

I never noticed this tiny self promotion, did you? Very subtle.

Lastly, I found these before-and-after pictures at the end of the [Continuous World GDC presentation
slides][link_cworld_slides] and couldn't resist but to reproduce them here, risking violating even more copyrights
than I probably already did `:P`. It is amazing to see the progress those guys made and how good the game
looked in the end. I can't thank Chris Taylor and the Dungeon Siege team enough for making this amazing game!

<div class="image512">
<img src="{{"/static/images/posts/dsiege/dsiege-before-1.jpeg" | prepend: site.baseurl }}"
	alt="Before" title="Before (early dev)" />
</div>

<div class="image512">
<img src="{{"/static/images/posts/dsiege/dsiege-after-1.jpeg" | prepend: site.baseurl }}"
	alt="After" title="After (game release)" />
</div>

<div class="image512">
<img src="{{"/static/images/posts/dsiege/dsiege-before-2.jpeg" | prepend: site.baseurl }}"
	alt="Before" title="Before (early dev)" />
</div>

<div class="image512">
<img src="{{"/static/images/posts/dsiege/dsiege-after-2.jpeg" | prepend: site.baseurl }}"
	alt="After" title="After (game release)" />
</div>

That's all for now folks! I should write again when time allows about another
of my favorite vintage games, but until then, may the blessings of Azunai The
Defender be upon you! Safe travels, Adventurer!


[link_ds]:            https://en.wikipedia.org/wiki/Dungeon_Siege
[link_ds_loa]:        https://en.wikipedia.org/wiki/Dungeon_Siege:_Legends_of_Aranna
[link_gpg]:           https://en.wikipedia.org/wiki/Wargaming_Seattle
[link_chris_taylor]:  https://en.wikipedia.org/wiki/Chris_Taylor_(game_designer)
[link_scott_bilas]:   http://scottbilas.com/games/dungeon-siege/
[link_skrit_manual]:  https://github.com/glampert/reverse-engineering-dungeon-siege/blob/master/source/thirdparty/gpg/docs/skrit-tech-manual.pdf
[link_tank_struct]:   https://github.com/glampert/reverse-engineering-dungeon-siege/blob/master/source/thirdparty/gpg/TankStructure.h
[link_save_files]:    https://github.com/glampert/reverse-engineering-dungeon-siege/blob/master/source/thirdparty/gpg/FuBiPersistBinary.h
[link_cworld_paper]:  https://github.com/glampert/reverse-engineering-dungeon-siege/blob/master/source/thirdparty/gpg/docs/the-continuous-world-of-dungeon-siege-paper.pdf
[link_cworld_slides]: https://github.com/glampert/reverse-engineering-dungeon-siege/blob/master/source/thirdparty/gpg/docs/the-continuous-world-of-dungeon-siege-slides.pdf
[link_fubi_paper]:    http://scottbilas.com/files/2001/gdc_san_jose/fubi_paper.pdf
[link_gdc02]:         http://scottbilas.com/files/2002/gdc_san_jose/game_objects_slides.pdf
[link_fubi_gem]:      http://scottbilas.com/publications/gem-fubi/
[link_git_prj]:       https://github.com/glampert/reverse-engineering-dungeon-siege
[link_git_tank1]:     https://github.com/glampert/reverse-engineering-dungeon-siege/blob/master/source/siege/tank_file.hpp
[link_git_tank2]:     https://github.com/glampert/reverse-engineering-dungeon-siege/blob/master/misc/tank-file-format.txt
[link_git_asp]:       https://github.com/glampert/reverse-engineering-dungeon-siege/blob/master/source/siege/asp_model.hpp
[link_prs_script]:    https://github.com/glampert/reverse-engineering-dungeon-siege/blob/master/source/thirdparty/gpg/siege_max/scripts/PRSImport.ms
[link_3ds_fmt]:       https://en.wikipedia.org/wiki/.3ds
[link_dllexp]:        https://msdn.microsoft.com/en-us/library/a90k134d.aspx
[link_llvm]:          http://llvm.org/
[link_gccxml]:        http://gccxml.github.io/HTML/Index.html
[link_secret_lvl]:    http://dungeonsiege.wikia.com/wiki/Dungeon_Siege_Chicken_Level
[link_gems_book]:     http://www.gameprogramminggems.com/


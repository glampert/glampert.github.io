---
layout:     post
title:      Reverse engineering Darkstone game file formats
author:     Guilherme Lampert
categories: Miscellaneous Reverse-Engineering
thumbnail:  darkstone
---

* Contents
{:toc}

[Darkstone: Evil Reigns][link_ds_wiki] is a little RPG from the late 90's by French developer
[DSI][link_dsi], the same creators of *Moto Racer* and *Another World*.

![Darkstone by DSI]({{ "/static/images/posts/darkstone/darkstone-screenshot.jpeg" | prepend: site.baseurl }} "Darkstone by Delphine Software International.")

A lot of people call it a "Diablo clone", but even so, it was pretty good at that! This was a very
enjoyable RPG to play back then and it had a lot of nice features that set it apart from other contemporary games
of the same genre. I have fond memories about this game and was very happy to find it on [GoG][link_gog] recently.
It is definitely worth the playthrough. I've also just found out that there is a [2014 remake][link_remake]
for iOS that [looks amazing][link_yt]. Haven't had the change of playing it yet, but it sure looks neat!
It is more then likely a full remake of the game, but the overall appearance look pretty much the
same as the original, except for the UI, so I'm guessing they've reused most of the original art assets.
The original release was PC/Windows only, Direct3D based. Later in 2001 a PlayStation port was also released.

Anyways, reverse engineering old games is kind of a background hobby for me. Sometimes the idea just
pops into my mind and a then I have to download the game again and fire up an Hexadecimal editor.
But I also enjoy it because you can learn a lot about how games are structured. It serves as inspiration
for your own games.

So last time I had one of those reverse engineering urges, I decided to focus on Darkstone and try
to figure out as much as possible about it. The best place to start is with the game's file formats.

### Game assets and file formats

If you download the GoG release of the game or open [your old Darkstone CD]({{ "/static/images/posts/darkstone/darkstone-cd.jpeg" | prepend: site.baseurl }}),
you'll find some not-so-interesting stuff at first. Just the DirectX-6 redistributable stuff from MS, [Heat.Net][link_heatnet]
stuff for the online game and a few text files with keyboard bindings. Inside an `mdata/` directory at the root,
you can find AVI videos with the intro screens and cutscenes. Those can be played on VLC or any other descent
media player, pretty cool!

The rest is pretty much all binaries. `Darkstone.exe` is the game executable. No custom DLLs, it seems.
The executable is big, by the way, about 1.3 Megabytes. It was a fairly complex game, so I assume
the code base must have been large too.

So, where are the game assets anyways? There are a couple files in the game's tree with the `.MTF`
extension. Those files are pretty big, the largest one with nearly 300 Megabytes. They seem like
good candidates for the game archives storing smaller assets like textures, 3D models, sounds and such.

A quick Internet search turned up two promising results:

- [Xentax Wiki entry on Darkstone][link_xentax].

- And this guy who implemented [a C# extractor for MTF files][link_zeckul].

### The MTF file format

The Darkstone MTFs are a sort of package/archive file that contains a bunch of other smaller files,
much like a popular Zip archive would. Each MTF starts with a list of file entries and their offsets in the
file. Pretty straightforward. After the headers, a list of the individual files follow until the end of
the archive. Each file entry might be compressed using a custom [RLE][link_rle]-like compression.

I wrote a more detailed description of the format [here][link_mtf_desc].
You can always refer to [C source code of the extractor][link_mtf_c] for the implementation details.

By the way, I don't think this MTF format is related to *Microsoft's Tape Format*, but I have
no idea what the acronym is supposed to mean. If you're reading this and happen to know what MTF stands for,
or have some more info about the format, please [mail me](mailto:guilherme.ronaldo.lampert@gmail.com)
and I'd be more than happy to extend this post with the new information!

#### MTF compression

The individual file entries in the MTF archive are compressed. The format uses a custom compression
where identical chunks of data are only stored once. Each chunk of data is prefixed by a byte that indicates
how the next eight bytes read are handled. I suggest looking at my decompressor implementation and the in-depth
description of the format for the details. It is relevant to note that the description of the compression algorithm
from [Xentax Wiki][link_xentax] is backwards. It says *"If bit=0 then read 10 bits for X and 6 bits for Y"*,
but that didn't add up, so I looked into [this existing implementation](http://pastebin.com/DycDYxPe) and
noticed that it was reading the bits the other way around (6 for X and 10 for Y). Trying that worked like a charm.
I don't know why it is the way it is in the Xentax entry. Maybe it is referring to a big endian architecture?
Or was it just a mistake?

#### Known MTF archives

There are at least three MTF files/archives in the original Darkstone release:
`music.mtf`, `voices1.mtf` and `data.mtf`.

The first one is obviously the game's background musics/soundtracks. Extracting it will output the
25 soundtracks of the game as MP2 files (that's the predecessor format of the now commonly used MP3).

`voices1.mtf` contains, as expected, all the recorded in-game dialogs. This separate file probably
made it easier to localize the game's dialogs. That's also the largest file. All extracted dialogs are in the MP2 format.

`data.mtf` is where the bulk of the game assets are. It stores all the textures, 3D models,
sound effects, scripts and more. Once decompressed, this is the most interesting archive to look into.

![data.mtf decompressed]({{ "/static/images/posts/darkstone/dir-print.jpeg" | prepend: site.baseurl }} "This is what data.mtf looks like once decompressed.")

### The O3D file format

This is where things start to get more interesting. `data.mtf`, the main archive with the game's art assets,
is filled with files with the `.O3D` extension. Judging by the filenames, those clearly store geometry data
for the game's models. Some Googling didn't turn up much about the file format, except that the [3D Object Converter][link_3doc]
tool can import them. I've tested it and it works, but the textures don't seem to map properly to the objects.

At first I thought the format was related to the [Objective3D Engine][link_o3d_eng] from now defunct Dream Overflow.
The Engine is open source, so I took a look at the source code, and they do handle a custom 3D file format,
but the structure appeared quite different from what I was seeing in the Darkstone files, so they are not related after all.

After a couple hours analyzing a few O3D samples in the Hexadecimal editor, I was able to figure out the format's layout.
It is very straightforward and easy to load. An O3D model consists of a tiny header, followed by a list of XYZ vertex positions (floats)
and then a list of faces. Each face is a small struct with three of four indexes for the vertexes that make up a face
(it can be a triangle or a quadrilateral) plus additional metadata like color, texture coordinates, material index and
some other unknown flags. A detailed description of the format can be found [here][link_o3d_desc].

Having figured out the format, writing a simple viewer for O3D models was easy:

![Simple O3D Viewer]({{ "/static/images/posts/darkstone/o3d-viewer.jpeg" | prepend: site.baseurl }} "A simple OpenGL-based viewer for O3D models.")

Source code for it can be found in the [GitHub repo][link_git_repo].

Sadly though, the O3D format is only used for static geometry, that includes: level geometry,
weapons, items, the town buildings and so forth. The characters and monsters are all animated
models, so they are stored in a different set of files, containing information for skeletal animation:

<div class="image512">
<img src="{{"/static/images/posts/darkstone/skeletons-dir.jpeg" | prepend: site.baseurl }}"
	alt="Animated model files" title="Animated models / skeletons." />
</div>

Those are all stored in the `SKELETONS/` directory. All files are binaries, so figuring them
all out would take a bit more time and effort, but it is feasible, no doubt.

### Other file formats extracted from the MTF archives

`data.mtf` contains a lot of other interesting stuff. All the texture maps and sprites are
stored as uncompressed TGAs. Most textures are shared by several objects, to optimize usage
of the precious texture memory and reduce render state changes.

Since the terrain was composed of reusable tiles, we can find a lot of textures like this one:

<div class="image300">
<img src="{{"/static/images/posts/darkstone/terrain-tiles.jpeg" | prepend: site.baseurl }}"
	alt="Terrain tiles" title="Terrain tiles." />
</div>

Characters and player avatars were also packed in a single texture per class, like the Knight:

<div class="image300">
<img src="{{"/static/images/posts/darkstone/knight.jpeg" | prepend: site.baseurl }}"
	alt="Knight model texture" title="Knight model texture." />
</div>

<div class="image512">
<img src="{{"/static/images/posts/darkstone/sprites.jpeg" | prepend: site.baseurl }}"
	alt="Menus and items" title="Menus, items and sprites." />
</div>

Text characters were also stored in texture atlases (there are also alternate ones for extended
ASCII characters like accentuations, used for the non-English versions of the game).

<div class="image300">
<img src="{{"/static/images/posts/darkstone/font-bitmap.jpeg" | prepend: site.baseurl }}"
	alt="Font atlas" title="Font atlas." />
</div>

There's also a number of other unknown binary files with the `.CBS` and `.CDF` extension. They seem to contain
fixed size strings with a lot of zero padding. The strings seem to be mostly file paths. Probably used to specify
the 3D models used by the dungeons and monsters.

Lots of text files with miscellaneous configurations for player classes and monsters.
These are probably pure gold for modders, since they can be easily edited.

Amazingly, some configurations are also in the MS Excel XLS format! Several damage tables and such.
Most of these are inside the `PCLASS/` directory.

There are many `.WAV` sound files with miscellaneous sounds and also files with the `.SFX` extension,
which I assume stands for "sound effect". These are all tiny so I doubt they store actual sound data,
but more likely metadata about how to play the sounds, like volume, loop, panning, etc.

### Game Scripts

Some game logic in Darkstone is script driven. Well, more like data driven...

There's a directory inside `data.mtf` named `SCRIPTS/`, which contains a bunch of text files
with the `.SPT` extension. Those files contain some kind of description language for the possible game actions
and dialogs. The structure resembles a bit the JSON format. For instance, an excerpt of `QUESTFINAL.SPT`:

<pre><code>
QUEST
{
    QUESTNAME
    {
        0 {L'affrontement final}
        1 {The final confrontation}
    }

    ENTRANCE    { entreeSage }
    LAND        { 7 }
    KEY         {FINAL}

    OBJECT
    {
        KEY     { ITEM_QFINAL_VIRTUAL1 }
        PARENT  { ITEM_FOOD5 }
        FLAG    { QUEST|CUSTOM|VIRTUAL }
        NAME
        {
            0   {qFinalvirtual1}
        }
    }

    OBJECT
    {
        KEY     { ITEM_QFINAL_C1 }
        PARENT  { ITEM_FOOD5 }
        FLAG    { QUEST|CUSTOM|VIRTUAL }
        NAME
        {
            0   {qFinalvirtual1}
        }
    }

    ...
</code></pre>

It also supports minimal flow control via a `GOTO` property:

<pre><code>
STATE
{
    KEY         { static }
    SKELNAME    { VPnj1  }
    SKELANIM    { static }
    SETCOLLID   { 1 }
    MULTI
    {
        <b>CONDITION</b>
        {
            MSG {3}
            <b>GOTO</b> {cristauxOk}
        }

        <b>CONDITION</b>
        {
            CLICK {}
            <b>GOTO</b> {explique}
        }
    }
}
</code></pre>

### Sound effects / speech

As mentioned previously, the sound effects are stored in WAV format with the
additional SFX metadata files. The dialogs are stored in a separate MTF.

One interesting bit though is that there are two subdirectories in `data.mtf`, a `SFX/` dir
and a `SFXNOGORE/` dir. I'm guessing the "NO GORE" ones are "softer" versions of the sound
effects for more sensitive audiences.

The `SPEECH/` directory inside `data.mtf` also has a bunch of peculiar files. Most are binary, but
there's one text file with the `.BNF` extension (`DRAGONBLADE.BNF`), with a structure that kind of
resembles that of a [**BNF grammar**][link_bnf].

### Trivia

Going through the decompressed `data.mtf` yielded a couple surprises...

#### A different name?

The main directory where most of the texture maps are stored in named **DRAGONBLADE**.
I wonder why? Was the game originally intended to be called *Dragonblade*?

#### A Moto Racer Easter Egg?

By far the most WTF finding while going through the game's textures was this:

<div class="image300">
<img src="{{"/static/images/posts/darkstone/moto-racer-texture.jpeg" | prepend: site.baseurl }}"
	alt="Moto Racer texture" title="WTF! Is that... A Bike?" />
</div>

Humm, I'm fairly sure I've seen this somewhere else...

<div class="image512">
<img src="{{"/static/images/posts/darkstone/moto-racer.jpeg" | prepend: site.baseurl }}"
	alt="Moto Racer" title="97's Moto Racer." />
</div>

So, remember that in the beginning I said DSI, the developer behind Darkstone, is also responsible for
the [Moto Racer][link_motoracer] franchise? This raises a few questions... **Does that mean that there is
a Moto Racer Easter Egg somewhere in the game?** I've never heard of any, but what other reason would there
be for this texture map to be there?

It gets weirder still, there are also car textures in the middle of the other textures!

<div class="image300">
<img src="{{"/static/images/posts/darkstone/car-textures.jpeg" | prepend: site.baseurl }}"
	alt="Car textures" title="Unknown car textures." />
</div>

That was a surprising find! That's the kind of stuff I'm looking for when I do this `;)`.
I have searched the file list for all of the contents of `data.mtf`, but didn't find any
3D model or similar with the words "MOTO", "BIKE" or "CAR" in the name. In case you are really
bugged by that and have some spare time, you can find a list with all the file paths and names
in the three MTF archives of the original release in [here][link_mtf_dump].

### Where to go from here?

Well, probably the next step would be reversing the animated mesh formats
to be able to display the player-character/monster models in a custom viewer.

Another interesting take would be figuring out how to reassemble the dungeons and the town.
Actually, in the `TOWN/` directory from `data.mtf` there's a text file named `TOWN.TXT` filled with
a bunch of strings that seem like 3D coordinates. I'm guessing those are the absolute positions of
the town buildings? So that's an easy starting point...

Anyways, no promises, like I said in the beginning, these reversing engineering ideas come and go,
so I'll probably not pursue this specific game any further, I've satisfied my curiosity about Darkstone for now.

Ultimately, I write these posts to preserve the information and make it freely available, but also
because I like to think I'm inspiring people to do the same. Maybe the next blog post I read about
reverse engineering some old game is going to be written by you?... `:)`

[Link to the GitHub repo][link_git_repo].


[link_ds_wiki]:   https://en.wikipedia.org/wiki/Darkstone
[link_dsi]:       https://en.wikipedia.org/wiki/Delphine_Software_International
[link_gog]:       http://www.gog.com/game/darkstone
[link_remake]:    http://www.polygon.com/2013/5/7/4307656/flashback-creator-bringing-darkstone-rpg-to-mobile-and-tablets
[link_yt]:        https://youtu.be/7y7MBecgijc
[link_heatnet]:   https://en.wikipedia.org/wiki/SegaSoft
[link_xentax]:    http://wiki.xentax.com/index.php?title=Darkstone
[link_zeckul]:    https://zeckul.wordpress.com/2012/03/04/darkstones-mtf-file-format-part-2/
[link_rle]:       https://en.wikipedia.org/wiki/Run-length_encoding
[link_3doc]:      http://3doc.i3dconverter.com/
[link_o3d_eng]:   http://sourceforge.net/projects/objective3d/
[link_git_repo]:  https://github.com/glampert/reverse-engineering-darkstone
[link_bnf]:       https://en.wikipedia.org/wiki/Backus%E2%80%93Naur_Form
[link_motoracer]: https://en.wikipedia.org/wiki/Moto_Racer
[link_mtf_desc]:  https://github.com/glampert/reverse-engineering-darkstone/blob/master/mtf-file-format.txt
[link_mtf_c]:     https://github.com/glampert/reverse-engineering-darkstone/blob/master/src/mtf.c
[link_mtf_dump]:  https://github.com/glampert/reverse-engineering-darkstone/blob/master/mtf-dump-logs.txt
[link_o3d_desc]:  https://github.com/glampert/reverse-engineering-darkstone/blob/master/o3d-file-format.txt


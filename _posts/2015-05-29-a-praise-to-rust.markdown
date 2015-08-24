---
layout:     post
title:      A little praise to Rust
date:       '2015-05-29T12:30:00.000-07:00'
author:     Guilherme Lampert
categories: Programming Rust Miscellaneous
thumbnail:  rust-lang
---

Just recently I started taking a look at the fairly new [Rust programming language][link_rust_lang].
Rust, according to its main site:

> Rust is a systems programming language that runs blazingly fast, prevents almost all crashes, and eliminates data races.

It has quite a few nice features indeed, many borrowed from functional programming languages, such as [pattern matching][link_match]
and immutability, a very complete Standard Library and compatibility with the C ABI. Best of all, it is not garbage collected and
compiles to native code.

From what it promises, it seems like a very good language for game development. Also, it has a much more compact and functional
look-and-feel, which for me is a breath of fresh air in this land of verbose OOP languages.

But in the end it all boils down to: is it fast? Well, from what I've seen so far, yes, it is. Not only it is fast,
I (a beginner with the language) have managed to write a Rust program that has outperformed a C++ equivalent!

I decided to train with the language a bit and port my [GTA audio conversion tool][link_adf2mp3_cpp] from C++ to [Rust][link_adf2mp3_rust].
I've kept the overall structure and layout of the program the same in both langs, the Rust version was not
hand optimized, all I did was enable compiler optimizations when building the executable, same for the C++ one.

Working on a file with **53.4 MiB** (FLASH.adf), in my MacBook Pro, the Rust app performed about twice as fast as the C++ one.

Timings for the C++ executable:

> `real 0m0.364s`
>
> `user 0m0.255s`
>
> `sys  0m0.093s`

Timings for the Rust executable:

> `real 0m0.154s`
>
> `user 0m0.008s`
>
> `sys  0m0.085s`

That's quite impressive in my book! Rust seems to really be blazing fast after all. That got me curious to see
if this kind of performance would hold for other types of applications, in special, graphics.

One thing is sure though, Rust is a new language that is worth keeping an eye on. Currently, the compiler, language
and libraries are very unstable and under heavy development, so things are changing in the language almost every day.
Once it stabilizes, it could start to threaten C and C++'s positions as high performance system programming languages...

[link_rust_lang]:    http://www.rust-lang.org/
[link_match]:        http://rustbyexample.com/flow_control/match.html
[link_adf2mp3_cpp]:  https://bitbucket.org/glampert/adf2mp3
[link_adf2mp3_rust]: https://bitbucket.org/glampert/adf2mp3/src/cdd48e53d08243477f07615ec6de49808db5cf13/ports/adf2mp3.rs?at=master


---
layout:    post
title:     'Custom scripting language - Part 1: Design considerations and syntax definition'
date:      2016-03-22
permalink: /tutorials/custom-scripting-language/part-1/
author:    Guilherme Lampert
highlight: true
---

* Contents
{:toc}

Compiler and programming language design are one of my guilty pleasures. Fortunately for me,
there is some use for it in game development, so I might still get the chance of working
with it in a games setting, but admittedly, not a lot of games are implementing custom
scripting languages nowadays. Good third-party solutions now exist.

In any case, if you share this interest with me, you might find that there is actually little
material on the subject available online. Compiler design and implementation is sometimes taught
in advanced Computer Science classes, but these courses rarely tend to be more in-depth or
practical in nature, stopping short at the theory.

One of the best example materials with source code that I've found to this date is the
one available in the old [CodeSampler website][link_codesampler]. The sample code provided there
can be used as a starting point, but it is quite dated (probably 10+ years old) and not written in
a very didactic fashion. It leaves comments and explanation of what is going on to be desired.
Would be a nice example though if it were accompanied by a written tutorial or article.

Given the lack of good learning material on the subject, I thought it would be useful to write
a short series of tutorials on how to implement a complete custom scripting language environment,
including a compiler and a runtime/interpreter (AKA a Virtual Machine - VM). This will be the
opening tutorial in a series of five:

- **Part 1** - Design considerations and syntax definition (this tutorial)
- **Part 2** - [Lexical tokenization with Flex][link_part2]
- **Part 3** - [Parsing with GNU Bison][link_part3]
- **Part 4** - [Compiler basics and the virtual instruction set][link_part4]
- **Part 5** - [The VM, CG and tying up loose ends][link_part5]

## Intro

We will start at a simple introductory level, with lots of code snippets along the way,
building up until we have a usable scripting language with the basic features of a
language like C and a Virtual Machine to run it on. The source code snippets displayed in
these tutorials will be taken from the [GitHub repository][link_git] containing the full
implementation. If you're already more or less familiar with the basic concepts and just
would like to have a base implementation to build on top, feel free to skip to the code
and use it. It is made available under the very permissive [MIT license][link_mit].

We should leverage existing tools as much as possible, so a good portion of our scripting compiler
will be implemented using the [Bison][link_bison] and [Flex][link_flex] tools. They are more
commonly known on Unix and Unix-like systems, but ports for Windows exist. In case you
have met these guys before and was pretty much freaked out by the awful, global
variable-ridden, C interface of the tools, worry not. We will be using the modern
C++ interfaces instead, which are much easier to grasp and also concurrency aware.

The sample code will be written in C++11. We will make frequent use of the Standard Library
and some minor template and exception usage to simplify things. I will go over the details
if using some less known language feature, but in general, this tutorial assumes the reader
is comfortable with C++11 and modern programming idioms.

Also, the implementation examples are not optimized for speed, they focus more on clarity.
Near the end, we will go over some basic memory optimization that you can easily apply to
the compiler and interpreter, and also discuss other more advanced optimizations that will
be left as exercises to the reader.

Note: This post will include very little code. It is more of a broad overview of what's to come,
so you can skip to the next one if you want to start looking at implementation details right away.

Enough talk, let's begin.

## Moon -- Our example language

We'd like the example and final sample implementation to be as close as possible to a
production-grade scripting language that you would find, for instance, in a Game Engine.
But we should also avoid overcomplicating things so this can fit in a finite set of tutorials.

Let's take as base an existing scripting language and simplify it a bit then.
I chose to base most of the syntax of our sample scripting language in the beloved
[Lua][link_lua] language, since it has a small and very easy to parse grammar.
We will also steal some syntax elements from [Rust][link_rust], such as its neat range-based
`for` loops and the awesome `match` statement, just because I think they are very cool `;)`.

Given the similarity with Lua, I had the bright idea of naming our example language "Moon",
which is the meaning of the word "Lua" in Portuguese `:P`. I realize this is not a great name,
given that a Lua preprocessor called [MoonScript][link_ms] already exists, so... Yeah, feel
free to change the name if you plan on forking the GitHub project.

Let's look at how we'd like some of the basic language syntax to look like:

### If-then-else statements

{% highlight lua %}

if a == 1 then
    println("a == 1");
elseif a == 2 then
    println("a == 2");
elseif a == 3 then
    println("a == 3");
else
    println("a > 3");
end

{% endhighlight %}

Notice that we don't require parenthesis around the `if` condition. This is fine
because the `then` keyword acts as the terminator for the condition, while in a
language like C, the closing `)` is the terminator.

Also note one crucial departure from Lua, we require the inner `println()` statements
to be terminated with a semicolon. Lua allows omitting semicolons because it uses
a hand written parser that guesses when a statement is over. In our case, as we will
see, with Bison as the parsing tool, it is not trivial to handle ambiguities caused by
the lack of semicolons to terminate statements. So to avoid overcomplicating the implementation,
I have decided to require semicolons on statements such as function calls. The if-then-elseif
chain is still ended by the `end` keyword, as in Lua, which we will see is used much more thoroughly
in Moon Lang. Actually, we almost never use curly braces in Moon, all the flow-control
structures are terminated by an `end` keyword.

### Loops

{% highlight rust %}

// An infinite loop.
// To exit you must 'break'
loop
    if should_quit() then
        break;
    end
end

// Iterating an iterable collection such as an array:
for i in iterable do
    // use i ...
end

// Iterating over an explicit range:
// (i goes from 0 to 9)
for i in 0..10 do
    // use i ...
end

// While loop:
while not finished do
    // do some work
    // possibly 'break' or 'continue'.
end

{% endhighlight %}

Nothing too surprising with the loop. They are basically adapted version of the loop syntaxes
used in Rust Lang, except that we replace `{ }` by the `end` terminator. With those four loop
styles we can build pretty much anything else.

### Structured types

{% highlight csharp %}

type Values struct
    intVal:    int,
    floatVal:  float,
    stringVal: string,
    boolVal:   bool,
end

// Type alias:
type MyValues = Values;

{% endhighlight %}

We want to keep things simple, but we also need some basic way of creating
aggregates of data. We will stick to simple C-struct like types in Moon Lang.
No support for objects and polymorphic types right now. We should also support
type aliases, much like a `typedef` in C or C++.

### Functions

{% highlight csharp %}

// Function taking a finite set of argument and returning one value:
func my_function(arg0: int, arg1: float, arg2: string) -> int
    println(arg0);
    println(arg1);
    println(arg2);
    return arg0;
end

// Function taking a varying numbers of arguments
// (like printf in C) and returning void:
func my_varargs_function(varargs ...)
    for arg in varargs do
        println(arg);
    end
end

{% endhighlight %}

In the spirit of keeping things simple, our basic unit of work will be a free function.
A function in Moon will be much like a function in C. We will not keep persistent state
inside functions. All local data will be declared on the stack then destroyed upon function
return, save for objects that are dynamically allocated and later Garbage Collected.

We'd also like to have a friendly Foreign Function Interface - FII, that is, an easy
way of registering native C++ functions with the script runtime. So that's something
to keep in mind. This is one weak spot in Lua, IMO. The C API for interfacing the scripts
with native code is far from good, even if you are working with plain C.

### Miscellaneous

Moon Lang is more strictly typed, but as we will see when we get to the execution model,
everything is represented intermediately by tagged unions, AKA, *Variant* types.

We will have the basic built-in types that you would expect to find in C:

`int`    | 32-bits signed integer.
`long`   | 64-bits signed integer.
`float`  | 32-bits floating point number.
`double` | 64-bits floating point number.
`bool`   | 8-bits true/false boolean.
`string` | Unlike in C, will be a built-in type in its own right.
`array`  | Native array type. No need for an array/vector class.
`range`  | Pair of begin/end values.
`any`    | Container for any of the above or user-defined type. Caries a type tag.

We will not support unsigned integer types or other explicitly
sized integral types right now to keep things simple.

**Immutability by default:** Most of the time, variables are only initialized once and
never again changed for their lifetimes. This is one thing I really like about Rust and
we will definitely copy for Moon Lang. The variable declaration syntax will follow Rust's model:

{% highlight rust %}

// Explicitly typed, immutable:
let foo1: int = 42;
let foo2: int;

// Type inferred, immutable:
let foo2 = 0..9;         // of type 'range'
let foo3 = [11, 22, 33]; // of type 'array'

// Mutable variables:
let mut foo4 = "hello";
let mut foo5: int = 22;

{% endhighlight %}

To make a variable mutable, we will enforce the `mut` keyword. We will also support
some level of type inference, which, as you will see, is very easy to implement.

There's a lot more to cover, but we'll look into stuff as we go, so let's now
take a brief overview of the Moon Lang scripting compiler and execution model.

## Outlining the compiler and runtime

There are several different ways in which you can implement parsing and execution
for a scripting language. The most trivial, but also less efficient, is to parse the
source code and execute it right away, statement by statement as you go. Variations of
this approach exist, such as first performing a full parse of the source, generating a
hierarchical representation of the code, then executing this tree-like hierarchy of statements.

For example, we can break down a simple `a = b + c` expression into the following
hierarchy of nodes, which by itself could be evaluated by traversing the tree from
the root node to the leaves:

<pre>
  a = b + c;

    +---+
    | a |
    +---+
      |
      v
    +---+
    | = |
    +---+
      |
      v
    +---+
    | + |
    +---+
      |
  +---+---+
  |       |
  V       V
+---+   +---+
| b |   | c |
+---+   +---+

To resolve the assignment node child of 'a', we must first
resolve the plus node that has 'b' and 'c' as its children.
</pre>

Such hierarchical tree-like representation of the source code is usually called
a [syntax tree][link_ast]<small>†</small> (more about it shortly).

In this series of tutorials and in the implementation of Moon Lang, we take a more
sophisticated approach that comes a bit closer to how your average C/C++ compiler works.
We will parse the textual source code with the help of Flex and Bison, generating an
internal representation of the source code as a syntax tree. The syntax tree is the
direct output of the parsing stage. It is a faithful representation of the script
source code and could even be used to output back the source code without loss of information
(save for whitespace and comments). We could also go ahead and "execute" the syntax tree
representation if we wanted, but that has a couple cons to it:

- Traversing the tree is slow. It involves a lot of pointer chasing and CPU data cache misses.

- The structure takes a lot of memory. Syntax tree nodes must pack a lot of data,
  such as type information and pointers to sibling nodes.

- It's a structure that is naturally hard to serialize or represent as a file.

Ideally, we want something compact and cache-friendly with modern CPUs. We want instead to
transform our syntax tree representation into an optimized format, a set of commands, or
*virtual instructions* that our Virtual Machine can consume as a continuous stream of data, much
like a real machine/CPU consumes a stream of hardware instructions. To this virtual set of instructions
we give the name [bytecode][link_bytecode]<small>¶</small>.

But before we get to the runnable bytecode, there's an additional step in the compilation process.
Our compiler will traverse the syntax tree and encounter several references to data and symbols, like variables and functions.
It makes our life easier to first generate an intermediate representation of the soon-to-be bytecode, not yet
packed into bytes/integers, but as an augmented instruction type that still references all the data and symbols,
then transform this intermediate representation into a compact stream of bytecode instruction that
consist of simple 32-bit integers, which our VM will be able to consume blazingly fast. Since the
final instructions themselves are just integer numbers, we can even save the result of the compilation
to file to be able to skip the source code processing altogether on subsequent runs of the script program.

Summing up, the layout of our system will look like this:

<pre>
+----------------------------------+
|       Script source code         |
+----------------------------------+
                 |
                 v
+----------------------------------+
|      Parse the source code       |
+----------------------------------+
                 |
                 v
+----------------------------------+
|    Syntax tree representation    |
+----------------------------------+
                 |
                 v
+----------------------------------+
| Intermediate code representation |
+----------------------------------+
                 |
                 v
+----------------------------------+
|  Final bytecode representation   |
+----------------------------------+
                 |
                 v
+----------------------------------+
|     VM execution or save to      |
|       file for later use         |
+----------------------------------+
</pre>

### Main components

By now we should have some basic idea of the main components in our system, but, let us focus
on the compiler for now. So what really goes on inside a compiler, and where exactly does this
syntax tree I keep mentioning fits in?

A compiler, and this includes even a scripting language compiler, like ours, is usually
comprised of the following basic components, give or take:

<pre>
+---------------+    +-------------+    +------------------------+    +-------------------+
| Lexer/Scanner | -> |   Parser    | -> | (Abstract) Syntax Tree | -> |  Code generation  |
+---------------+    +-------------+    +------------------------+    +-------------------+
       |                      ^  |              |                               |
       |   +--------------+   |  |    +------------------+                      |
       +-> | Symbol Table | --+  +--> |  Function, Type  | <--+                 v
           +--------------+           |      tables      |    |       +-------------------+
                                      +------------------+    +------ |  Virtual Machine  |
                                                                      +-------------------+
                                                                                |
                                                                      +-------------------+
                                                                      | Garbage Collector |
                                                                      +-------------------+
</pre>

The *Lexer* and *Parser* will be the subjects of the following tutorials, so I will not go into
a lot of detail on these two components right now. In a nutshell, the Lexer (or Scanner, as something called)
breaks the source code text into token, such as words and punctuation, while the Parser reads these
tokens to form statements and expressions, such as an if-then-else clause or a variable declaration.

When the Parser completes a statement or expression, it usually emits a small subtree of nodes
representing the source code construct. When a whole file or program is done parsing, we are left with
a syntax tree representation of the original source code. As I mentioned before, this tree structure is
a faithful representation of the original source code, but ordered in a way that we can more easily
traverse and generate machine instructions from it, as we shall see in the following tutorials.
The syntax tree also allows us to easily validate the source code. To give a quick example, suppose
we find a `return foo;` statement in the source code. If it is a well formed return statement, consisting
of the keyword `return` followed by some name or value and a semicolon, we still need to know if its
context is valid. A return statement only makes sense if it lives inside a function. With this tree
representation of the source code, it becomes trivial to test for that. All we have to do is check
that every `return` node in the tree is a child of a `function` node. If we find one that is not,
we can safely assume the source code is nonsensical. If all that sounds too vague, don't worry, we will
revisit the syntax tree in detail and look at some code later on in the third tutorial about parsing.

After the syntax tree is created and validated for semantic correctness, we can proceed to generate
the intermediate code representation and finally the bytecode. Notice that we have a few peripheral
components in the ASCII diagram above. The symbol table, which we will look into more details in a
following tutorial, is just a convenient way of storing strings found in the source code, such as
literal constants, literal strings and names of functions/variables (AKA identifiers). Using a global
table allows us to only store a single instance of each name, even if it appears several times in the
source code (imagine a function that gets called thousands of times, no point in storing repeated strings
with the same name for every occurrence). The syntax tree is then able to just reference the symbols from
the table instead of keeping copies of each. This is a trivial but very important optimization worth doing
from the beginning, as it saves a significant amount of memory when parsing source code. Actually, I wouldn't
even call it an optimization, it's about choosing the correct data structure to represent your data.

Other components, which we will visit later on, are tables similar to the symbol table, such as
function and type tables to store in-memory representations of the equivalent source code constructs,
which the syntax tree and the code generation step can reference through pointers or indexes instead
of keeping several repeated copies. These tables will be our main targets for memory optimization
later on when we look into installing custom memory allocators.

As for the runtime components, we have basically the Virtual Machine and possibly a Garbage Collector - GC,
assuming the scripting language in question allows for dynamic memory allocations (Moon Lang does). We could
simply force the user to deallocate memory explicitly, but GCs are a very interesting topic and I think
it is definitely worth the time of taking a look at the basics at least, so in the last tutorial we will
focus on the VM, GC and other runtime supporting features, as well as some final notes on optimization and future work.

----

**†** The term *syntax tree* is also sometimes prefixed with the word *abstract*, then abbreviated to AST.
The "abstract" is to mean that some of the information is stored implicitly by the ordering of the
nodes, that is, a leaf node has different meaning than an inner node. In any case, when talking
about syntax trees in the context of compilers, if the name is used with or without the "abstract"
prefix is of no difference, they mean the same thing. In these tutorials we will use the term syntax tree
because it is shorter, and just ST when abbreviating.

^^^^^ Need to clarify the above. There is actually some difference... But we just use the term ST in this project...
**FIXME**

**¶** As the name suggests, a *bytecode* instruction is usually stored as a single byte.
This means that a Virtual Machine can handle up to 256 different bytecode instructions.

----

## Suggested readings

Lastly, to warm up for the next parts of these series, I suggest taking the time
to read the [Bytecode chapter in the **Game Programming Patterns**][link_gpp] online book.
Well, really, just read the whole book if you haven't yet, it's and excellent read!
Or reread the chapter if you have already read the book. It will give you some insight
about how our VM and runtime will be implemented.

And for a more in-depth read, which you might take along these tutorials, the famous,
and still probably canonical reading on the subject: [**Compilers: Principles, Techniques & Tools**][link_dragon],
AKA "the dragon book". This one is a massive beast indeed, so you will take a while to read it,
but it will give you an expert understanding of the topics we will cover more broadly over here `:)`


[link_git]:         https://github.com/glampert/moon-lang
[link_mit]:         https://opensource.org/licenses/MIT
[link_codesampler]: http://www.codesampler.com/source/custom_scripting_language.zip
[link_bison]:       https://www.gnu.org/software/bison/
[link_flex]:        http://flex.sourceforge.net/
[link_bytecode]:    https://en.wikipedia.org/wiki/Bytecode
[link_ast]:         https://en.wikipedia.org/wiki/Abstract_syntax_tree
[link_gpp]:         http://gameprogrammingpatterns.com/bytecode.html
[link_dragon]:      https://en.wikipedia.org/wiki/Compilers:_Principles,_Techniques,_and_Tools
[link_lua]:         https://www.lua.org/
[link_ms]:          https://github.com/leafo/moonscript
[link_rust]:        https://www.rust-lang.org/
[link_part2]:       #
[link_part3]:       #
[link_part4]:       #
[link_part5]:       #


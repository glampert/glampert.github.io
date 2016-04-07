---
layout:     post
title:      An ever evolving coding style
author:     Guilherme Lampert
categories: Programming C C++
thumbnail:  cpp-lang
highlight:  true
---

* Contents
{:toc}

## Intro

Perhaps the most important quality of a software developer is quick adaptability to change.
Software/programming is a very volatile field, with new technologies and tools arising and
disappearing faster than we can learn them! Game development is no different, perhaps even
more volatile in some aspects. A game can be considered legacy software as soon as it is shipped.

In any case, that's not what I'm here to talk about today. I want to talk about coding style
and practices. But I wanted to start with that paragraph to mention that when it comes to tools
and new technologies, programmers are usually fast and willing to adopt them. This is not necessarily
true when it comes to changing the way one writes code. The way we write code is deeply rooted in
our consciences, it is almost automatic. It's hard to drop a coding habit the same way it
is hard to drop the habit of pronouncing a word incorrectly or with a regional accent.

Nevertheless, adapting to change is the basic ingredient of survival in any environment.
Programmers that are not willing to change their ways are not fit for the job of programming.
That's why I recently set down and reconsidered a few of the practices that I had been using on
auto-pilot for quite some time. To remind myself of the changes I should make, I wrote a somewhat
detailed doc with new guidelines to follow and old guidelines that should be remembered.

So that's what this post is mostly about, my coding guidelines as of today, 2015.
This pertains mostly to C++, but there is some wisdom applicable to C as well as to
other C-like languages. For additional references, I also suggest reading the style-guide of
[LLVM](http://llvm.org/docs/CodingStandards.html), which some of the points listed below are derived from.

Also note that I maintain a few projects that predate C++11, therefore, a few points relate
to efforts of maintaining the code backward compatible. Those cases are clearly noted as such.

## My (current) coding guidelines

### Naming conventions

User Defined Type (UDT) names, such as classes, structs, enums and typedefs,
use `PascalCase` notation, to stand out from native and library types. Examples:

{% highlight c++ %}

FileReader
HttpHeader
XmlWriter
IdString
AssetDb
AsciiTable
Model3d

{% endhighlight %}

Notice that names containing multi-letter abbreviations or initialisms,
such as `HttpHeader`, only employ the first letter of the abbreviation as uppercase.
This style is similar to the [style used by the .Net](https://msdn.microsoft.com/en-us/library/ms229043.aspx) libraries.

{% highlight c++ %}

// Yes
class HttpHeader { ... };

// No
class HTTPHeader { ... };

{% endhighlight %}

Typedefs for native types (or any typedef for that matter) should follow the same notation.
I make an exception for types that are used very frequently, such as unsigned integers,
bytes and unsigned longs. Since those types are used very often, there is some gain
in reducing the number of keystrokes required to declare a variable. For that reason,
typedefs such as the following are fine by me:

{% highlight c++ %}

// Exceptions to the PascalCase rule:
int8
uint8
int16
uint16
int32
uint32
int64
uint64

{% endhighlight %}

Those use all lowercase, thus breaking the `PascalCase` rule for types in favor
of avoiding a <kbd>SHIFT</kbd> key press whenever you need to declare a native integer.

Another minor suggestion regarding typedefs, when related to defining a function signature
typedef or a typedef to a functor object, I advise adding the `Func` or `Function` words
to the type name, to make it clearer about its purpose. Example:

{% highlight c++ %}

// Signature of a generic hash function.
typedef uint32 (* HashFuncType)(const void *, uint);

{% endhighlight %}

#### Variables and compile-time constants

Variable names are always `camelCase`, independent of scope or purpose. Examples:

{% highlight c++ %}

int count;        /* Single word, good */
int appleCount;   /* Multi-word camelCase, good */
int apple_count:  /* Nope */
int _apple_count; /* No, no, no */

{% endhighlight %}

Variable, type or method names containing underscores (`_`) are not used. Underscores are only
used on macro names and template parameter names. Names starting with an underscore (including
macros or template params) [are not legal C++ names in some contexts](http://stackoverflow.com/q/228783/1198654),
so these are expressly forbidden.

Non-macro compile-time constants are always declared using `PascalCase`,
following the same rules applied to type names. Examples:

{% highlight c++ %}

enum class VarType
{
    String,
    Integer,
    Decimal
};

const int MaxConnections = 10;
constexpr int Cpp11Const = 2011;

{% endhighlight %}

**Note:** Also remember to favor C++11's `constexpr` whenever practical. If compiling to a target
where C++11 is not available, it is safe to redefine `constexpr` to a plain `const`. However, this
will not work for `constexpr` functions that are used as constant expressions, so `constexpr`
usage on functions should be avoided for projects that require pre-11 compatibility.

#### Macros and template parameters

Macro constants and function-like macros should be avoided as much as possible.
If used, they follow the universal macro notation of `ALL_UPPERCASE`. Examples:

{% highlight c++ %}

#define LOG_ERROR(errorMessage) \
    logErr((errorMessage), __FILE__, __LINE__)

#ifndef A_BUILD_SYSTEM_CONST
    #define A_BUILD_SYSTEM_CONST 42
#endif

{% endhighlight %}

The only other category of names that is allowed to use `ALL_UPPERCASE` are template parameter
names. Ideally, try to keep template parameter names short. Single letter parameters,
like the popular `T` for a type, are the ideal. If you need a longer or possibly multi-word
parameter name, then use the `ALL_UPPERCASE` notation.

#### Namespaces

C++ namespace names are always lowercase. Also try to avoid long namespace names. Prefer single word ones.

{% highlight c++ %}

// Good
namespace engine { ... }

// Bad/too long!
namespace EngineModule { ... }

{% endhighlight %}

A namespace should be thought of as the C++ equivalent of a module. Nesting namespaces is fine,
but some care should be taken to avoid excessively long namespace nesting. Two to three
levels of nesting should be the limit, such as in `game::core::memory`, for instance.

#### Methods and functions

Method names or free function names are always `camelCase` and follow the same rules
applied to type names regarding acronyms and initialisms. Examples:

{% highlight c++ %}

bool initSystem();
void loadGame();
void saveGame();
int  getModel3dCount() const;

{% endhighlight %}

**Note:** The rationale behind using `camelCase` names for both variables and functions/methods
is that all C++ entities that can have its memory address taken should share the same naming style.

Lightweight get/set methods should always be prefixed accordingly:

{% highlight c++ %}

int  getElementCount() const;
void setElementCount(int count);

{% endhighlight %}

**Note:** When the variables being get or set are related to a count or number
of items, prefer a name ending in `Count`. Examples:

{% highlight c++ %}

int getElementCount() const; /* Good/preffered */
int getNumElements()  const; /* Not great, but passable... */
int getNbElements()   const; /* Worse. 'Nb' is even less clear than 'Num' */

{% endhighlight %}

#### Source files

Source files are always named using the `snake_case` notation, that is, each word in a name being
separated by an underscore and all letters in lowercase. This might seem like an inconsistency,
since the bulk of the code uses either `PascalCase` or `camelCase`, however, this decision is
a practical one. Code should always be multi-platform/portable and not all the platforms out there
have case-sensitive file systems. So, to avoid name conflicts, I choose `snake_case` for file names
as this notation avoids the problem of case-insensitivity.

C++ source files are always named with the `.cpp` extension and, for orthogonality and to
distinguish between C and C++ header files, C++ headers are always named with the `.hpp` extension.

`.inl` files are generally discouraged. Fully inline templates or classes should be
declared and defined inside the same `.hpp` file, to avoid having to maintain extra
files and to keep related things together.

#### Miscellaneous

Hexadecimal literals should be always uppercase, with the exception of the `x` in the `0x` prefix:

{% highlight c++ %}

0xBADF00D
0xCAFEBABE
0x012345

{% endhighlight %}

Type suffixes should be always lowercase (e.g.: `u`, `ul`, `f`, `lf`),
to differentiate them from the hexadecimal letters:

{% highlight c++ %}

// Mersenne Twister tempering constants:
constexpr ulong A = 0x9908B0DFul;
constexpr ulong L = 0x7FFFFFFFul;
constexpr ulong U = 0x80000000ul;

// Explicit floats:
const float E     = 2.71828182845904523536f;
const float Pi    = 3.14159265358979323846f;
const float TwoPi = 2.0f * Pi;

{% endhighlight %}

Recursive functions are recommended to be suffixed with `Recursive` or to have
the word in some part of its name to make this aspect clear to the caller:

{% highlight c++ %}

void visitTreePostOrderRecursive(Node * subtreeRoot);

{% endhighlight %}

### Spacing and indenting

I use real <kbd>TAB</kbd>s to indent code, with each <kbd>TAB</kbd> equal to **four (4)** spaces.
Naturally, always indent to the proper scope on any control-flow statement,
function or class/structure declaration with one <kbd>TAB</kbd> per level.
**Note:** Namespaces are not indented (more about this at the end).

Line length should aim at a **100** columns soft limit and a **120** columns hard limit.
Special cases where there is a compelling reason not to break the line might exist,
but those should be the exception. So try to keep lines short!

Operators and expressions must be always well spaced, with one
space between each operator, to make them clearly visible.

{% highlight c++ %}

// Bad spacing:
float epsilon=0.0001f;
for(int i=0; i<N; ++i) { ... }

// Correct spacing:
float epsilon = 0.0001f;
for (int i = 0; i < N; ++i) { ... }

{% endhighlight %}

I prefer to put a space on **both sides** of the `*` in a pointer declaration.
Same is true for a C++ reference declaration.

{% highlight c++ %}

// Examples:

int * ptr = ...;
const char * str = "...";

Mesh & meshRef = getMesh(i);
...
void writeFile(const std::string & filePath);

{% endhighlight %}

Notice in the above that the `*` and `&` are not bound to any side of the expression.
The rationale is that this makes the punctuation more visible, thus reducing the time it
takes for the reader to scan through the code.

In a pointer dereference or when taking the address of a variable, no extra spacing is needed.
The above only applies to declarations/parameters.

### Curly braces positioning and parenthesis

#### Curly braces

Curly braces `{ }` are always placed on their own lines. This is of little consequence and mostly
personal preference; I think the code is more evenly spaced into paragraphs this way. Examples:

{% highlight c++ %}

if (foo < bar)
{
    ...
}

while (baz)
{
    ...
}

do
{
    ...
}
while (abc);

struct Vec3
{
    ...
};

class Matrix4
{
    ...
};

namespace game
{
    ...
}

{% endhighlight %}

**Note:** Curly braces **are mandatory** for all flow control statements, **including single line ones**.
This eases maintenance and shields the code from silly bugs resulting of adding lines to unbraced statements.

#### Parenthesis

Making operator precedence explicit with the use of parenthesis is good. Examples:

{% highlight c++ %}

int x = (y * z) - w;
...
Tile t = tileMap[x + (y * width)];

{% endhighlight %}

Unnecessary parenthesis should be avoided on conditionals,
loops or assignments, C++ is already verbose enough:

{% highlight c++ %}

// Good:
if (a == b || c == d)
{
}

// Excessive use of '( )'!
if ((a == b) || (c == d))
{
}

// Good:
for (int i = total - 1; i >= 0; --i)
{
}

// Excessive use of '( )'!
for (int i = (total - 1); i >= 0; --i)
{
}

// Good:
const float ratio = width / height;

// Excessive use of '( )'!
const float ratio = (width / height);

{% endhighlight %}

**Important:** A `return` statement **is not a function**, so never do this:

{% highlight c++ %}

// Don't do this!
return (true);

{% endhighlight %}

This is also excessive use of parenthesis:

{% highlight c++ %}

return (x == y); // Wrong

// Wrong
return (std::strcmp("hello", data) == 0);

{% endhighlight %}

Should be just:

{% highlight c++ %}

return x == y; // Good

// Good
return std::strcmp("hello", data) == 0;

{% endhighlight %}

### More miscellaneous, details and other general guidelines

- C++ makes no practical distinction between `struct` and `class` types. My convention is
that `struct` should only be used for Plain Old Data (POD) types and behavior-less types.
`class` is for everything else. Always use `class` for polymorphic types and interfaces.

- Multiple inheritance should be avoided as much as possible. The acceptable cases are
in the use of "mixin" classes (non-virtual multiple inheritance or aggregation).

- Virtual methods are also to be used conservatively, since they are not as runtime
efficient as non-virtual methods and increase executable image size.

- Order of appearance for class methods and data is always:
**public**, **protected** and lastly **private**. Public stays at the top because
it is usually the most relevant part of a class to the user. Private and protected
are implementation details, so they should not need to stand out as much.

- Make consistent and frequent use of `const`. Always mark methods that don't mutate
member data with `const`. Read-only function parameters are always `const`. Also, enforce
single-assignment of variable instances by making them `const` on the declaration.

- **Never add a virtual destructor "just in case"**. If a class is not meant to be inherited from,
then it doesn't need a virtual destructor. Even for classes that are inherited from, prefer
to define the base type's destructor as protected and non-virtual if possible. Virtual destructors
have a runtime cost and add vtables to the classes, which are best avoided whenever possible.

- Consider marking classes that are not meant to be inherited from with the C++11 [`final`](http://en.cppreference.com/w/cpp/language/final)
specifier. Using it might enable some compiler optimizations and it is simple and safe to redefine it to do
nothing if we need to compile where C++11 is not available. The same is true for the [`override`](http://en.cppreference.com/w/cpp/language/override)
specifier. Use it freely. It can be redefined to nothing when compiling for older platforms.

- Always use [`nullptr`](http://en.cppreference.com/w/cpp/language/nullptr) for null pointers.
Don't use `NULL` or `0`. Again, it is easy to provide a fallback for non-C++11 compilers, and it
provides better compiler diagnostics when building with C++11 and above.

- Assert regularly and liberally, but don't count on the assertions to be always enabled!
Don't use assertions for checks that must be always there. Use them freely to aid debugging
and catch errors early. Even when an error seems improbable, add an assertion anyway to be sure.

- Template and inline code should be used conservatively. Too much inlining and template types
will bloat the executable image and bring compile times to a crawl. Use templates where they might
reduce code duplication and use inlining where there might be a performance gain, but judge this
well taking into account code size and the number of source files that might reference your header file.

- [`auto`](http://en.cppreference.com/w/cpp/language/auto) is the missing feature that C++ should have
had from day one. Type inference is such a basic thing that it is sad to think we have lived without it
for such a long time... Use `auto` anywhere you would have to write the type of something more than once ([DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)).
But don't abuse it! There are cases where explicitly declaring the type makes the code more clear about
its intents. If it is not obvious what type is being assigned to an `auto` instance, then it is perhaps
better to write the actual type name instead.

- Use unnamed/anonymous namespaces for file scoped constants, variables, types and functions,
instead of `static`. Static is a C-idiom and it is not applicable to types. The use of local/file
scoping is encouraged, as it allow the compiler to better optimize the code and might also speed up link times.

- C++ namespaces **should not be indented**. Indenting a namespace adds nothing to the better
understanding of the code, and adds a level of indentation that is arguably negative, for
making lines longer.

{% highlight c++ %}

namespace module
{

class A
{
    ...
};

struct B
{
    ...
};

void funcC();

} /* namespace module */

{% endhighlight %}

**Note:** It is useful to add a comment to the end of the
namespace, such as `// namespace X` to visually mark the end of it.

### Unit tests

Unit tests are always placed inside a namespace called `unittest`, which can be a child of any namespace.
When naming test functions, the notation `Test_<functionName|ClassName>_<Situation>()` is used. Examples:

{% highlight c++ %}

namespace unittest
{

// Test a function named 'binarySearch()'
void Test_binarySearch();

// Test a function named 'strCopy()'
void Test_strCopy();

// Test a class/struct named 'SpatialSorter' that sorts a specific 'DrawVertex' type.
void Test_SpatialSorter_DrawVertexSorting();

} /* namespace unittest */

{% endhighlight %}

**Note:** Naming of test functions does not follow the conventions of regular functions.
They use `PascalCase` for the `Test_` prefix part and are also allowed to use underscores
in the middle of the name. This is intentional, since test functions are not called by
regular application code, only inside test modules. Calling a unit test function in the application
or library code would be an error, so by using this special naming convention it makes them
stand out more easily if called by accident where they shouldn't.

----

Overall, the above has been working quite well for me. It feels good to keep the code uniform
and consistent across projects. Also, having the guidelines written down lifts the burden of
remembering everything. If you happen to forget some finer point, no sweat, just open the file
and read it again. Much easier then hunting down some code snippet where you think you might have used
the given style. So I recommend that everyone take some time to write down their coding styles/guidelines
and also review what is working and what should be thrown away!

Also, it is important to note that the above guidelines are my own personal ones, and are by
no means a one-size-fits-all style. More important so, they are always open for review,
so expect them to change radically over time!


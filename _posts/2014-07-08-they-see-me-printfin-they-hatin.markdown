---
layout:     post
title:      They see me printfin' they hatin'
date:       '2014-07-07T20:49:00.000-07:00'
author:     Guilherme Lampert
categories: Programming C C++
thumbnail:  printf-vs-cout
highlight:  true
---

Gotta tell you folks, I'm a C++ coder that uses printf-like functions. Jokes apart, there are some
serious holy wars involving the use of those format functions in C++, functions like [`std::printf()`][link_printf],
[`std::sscanf()`][link_scanf] and similar C functions that take a variable amount of parameters.

Sure C++ has its `<< >>` stream operators that can do the same job <strike>in a way nobody can easily read</strike>,
but I just think that nothing beats the simplicity and clarity of a `printf`:

{% highlight c++ %}

const char * name = "Lampert";
const int answer  = 42;

std::printf("Hello %s, the answer is: %i\n", name, answer);

{% endhighlight %}

I mean, there is no way you can't read that, even if you come from a language that lets you concatenate strings
with the `+` operator. Now compare that to an `std::cout`:

{% highlight c++ %}

const char * name = "Lampert";
const int answer  = 42;

std::cout << "Hello " << name << ", the answer is: " << answer << "\n";

{% endhighlight %}

Actually, that example doesn't look that bad in the `std::cout` version.
Now how about printing a simple hexadecimal number? Things start to get worse for Mister `cout`:

{% highlight c++ %}

std::printf("0x%04x\n", 0x424);

// Versus:

std::cout << "0x" << std::hex << std::setfill('0') << std::setw(4) << 0x424 << "\n";

{% endhighlight %}

The main problem with these [variadic][link_variadic_fn] or "format" functions, however,
is that they make it super easy for you to shoot yourself in the foot.

I'll always remember a day when a friend asked me for help on how to parse a string read from a file.
I suggested that he used `std::sscanf()`. He did, only he was new to these functions (coming from C# to C++)
and tried to pass an `std::string` object to the function. The compiler accepted that happily, but of course,
the state of the program was corrupted after the `sscanf` call returned. Variadic functions, being inherited from C,
can only deal with native types. They don't understand the concept of C++ objects and would try to treat them as raw bytes.

There are several replacements for the old C format functions these days, Boost provides a fantastic
[Formating Library][link_boostfmt]. With C++11, we can now implement safer [templated printf-like][link_variadic_template]
functions that accept any data type and are type-safe.

But way before Boost and C++11 there was a way to avoid errors like the one I've described above.
GCC has the [`__attribute__((format))`][link_gcc_attr] extension. Clang on OSX also fully supports it.

So if you declare your format functions as:

{% highlight c++ %}

void my_printf(const char * format, ...) __attribute__((format(printf, 1, 2)));

{% endhighlight %}

And try do do something silly like passing a C++ string to it, the compiler will pull your years:

{% highlight c++ %}

std::string name = "Lampert";
const int answer = 42;

my_printf("Hello %s, the answer is: %d\n", name, answer);

/*
$ clang++ test.cpp

test.cpp:12:45: error: cannot pass non-POD object of type 'std::string'
   (aka 'basic_string) to variadic function; expected type from
      format string was 'char *' [-Wnon-pod-varargs]
        my_printf("Hello %s, the answer is: %d\n", name, answer);
                         ~~                        ^~~~

test.cpp:12:45: note: did you mean to call the c_str() method?
        my_printf("Hello %s, the answer is: %d\n", name, answer);
                          ^
*/

{% endhighlight %}

Yey! The compiler is doing its job! You will be able to get some sleep tonight.
This also produces a warning if you pass types that are incompatible with the format flag
in the string, such as mismatching `int` (`%d/%i`) with `float|double` (`%f/%lf`).

{% highlight c++ %}

const float f = 3.141592;
my_printf("f is %d", f);

/*
$ clang++ test.cpp

test.cpp:10:22: warning: format specifies type 'int'
   but the argument has type 'float' [-Wformat]
        my_printf("f is %d", f);
                        ~~   ^
                        %f
*/

{% endhighlight %}

`__attribute__((format))` can be used with any type of function, including class methods.
But there is one little detail when using it in a class. A class method has an implicit first parameter,
the `this` pointer. So you need to increment the `string-index` and `first-to-check` of `format()` by one:

{% highlight c++ %}

class DebugLog
{
public:
    void logComment(const char * format, ...) __attribute__((format(printf, 2, 3)));
};

{% endhighlight %}

In fact, this is such a basic feature that even Microsoft has finally added it to
Visual Studio with the [`SA_FormatString`][link_sa_fmt] annotation:

{% highlight c++ %}

#include <CodeAnalysis\SourceAnnotations.h>

void my_printf([SA_FormatString(Style="printf")] const char * format, ...);

{% endhighlight %}

A slightly weird syntax, but does the job.

So if you love variadic function like I do, then do yourself a favor and use these source annotations/attributes
and let the compiler do the validation for you (and don't ignore the warnings when you get them, obviously!).

[link_printf]:            http://www.cplusplus.com/reference/cstdio/printf/
[link_scanf]:             http://www.cplusplus.com/reference/cstdio/sscanf/
[link_boostfmt]:          http://www.boost.org/doc/libs/1_55_0/libs/format/
[link_variadic_fn]:       https://en.wikipedia.org/wiki/Variadic_function
[link_variadic_template]: https://en.wikipedia.org/wiki/Variadic_template
[link_gcc_attr]:          https://gcc.gnu.org/onlinedocs/gcc/Function-Attributes.html
[link_sa_fmt]:            https://msdn.microsoft.com/en-us/library/ms182046(v=vs.100).aspx


---
layout:     post
title:      Clang-Format and how it can help you understand complex code
date:       '2015-07-01T13:25:00.000-07:00'
author:     Guilherme Lampert
categories: Programming C C++ Clang
thumbnail:  clang-format
highlight:  true
---

* Contents
{:toc}

I've recently re-watched [this presentation from GoingNative 2013][link_gn].
Excellent talk about the Clang tools ecosystem. Clang and LLVM are not just compilers, but also frameworks
for compiler and source-level tool building, and thought it would be nice to talk about some of these tools.

The first one mentioned in the presentation is [Clang-Format][link_clangfmt], a C, C++ and Objective-C source
code reformatting tool. One use that I've found it is perfect for is in integrating third-party code into your projects.
It not only helps to make the third-party source more compatible with the style of your project, but it can also aid
tremendously in the understanding of "ugly" or complex code that is outside of your control.

A library that I have used in several occasions is the awesome Public Domain [STB Image][link_stbi].
In a nutshell, it provides image loading and decompression for several common image file formats.

Some of the great things about this library:

- It is super easy to integrate. The library consists of a single C/C++ header file. Include it and you are set.

- It is very configurable. For instance, you can supply a custom memory allocator, among other things.

- It is Public Domain. No licensing restrictions and boilerplate to worry about.

The main issues, in my opinion:

- The code is very complex and unreadable. The author(s) follow a very particular coding style that is not very friendly.

- Very hard do modify, due to the above. If you happen to find a bug or need to make a lower-level change to the library,
  it would cost you a lot of time just to begin to understand the code.

This is where Clang-Format comes into play. Since the code is PD, you can copy, modify and redistribute.
So we can run the tool on it to clean up the main formatting issues. This ought to make it much more readable,
with zero effort from the programmer.

So lets look into a few instances where I think the tool really helped and made the code easier to read and follow.
Note also that this is only a text formatting tool, so it can't make other improvements like replacing the use of magic
numbers by named constants, fix the lack of `{ }` on control-flow statements or give variables better names. Now that is
something I would even be willing to pay for! `;)`

Lets look into `stb_image.h` at once. The Clang-Format invocation used was:

> `$ clang-format -style=webkit stb_image.h > stb_image_new.h`

### Function `stbi__convert_format()`

**Issue:** The switch statement it very poorly spaced. Operators are barely
visible in that wall of text. Lets see how Clang-Format did.

**Before:**

{% highlight c %}

static unsigned char *stbi__convert_format(unsigned char *data, int img_n, int req_comp, unsigned int x, unsigned int y)
{
   int i,j;
   unsigned char *good;

   if (req_comp == img_n) return data;
   STBI_ASSERT(req_comp >= 1 && req_comp <= 4);

   good = (unsigned char *) stbi__malloc(req_comp * x * y);
   if (good == NULL) {
      STBI_FREE(data);
      return stbi__errpuc("out-of-memory", "Out of memory");
   }

   for (j=0; j < (int) y; ++j) {
      unsigned char *src  = data + j * x * img_n   ;
      unsigned char *dest = good + j * x * req_comp;

      #define COMBO(a,b)  ((a)*8+(b))
      #define CASE(a,b)   case COMBO(a,b): for(i=x-1; i >= 0; --i, src += a, dest += b)
      // convert source image with img_n components to one with req_comp components;
      // avoid switch per pixel, so use switch per scanline and massive macros
      switch (COMBO(img_n, req_comp)) {
         CASE(1,2) dest[0]=src[0], dest[1]=255; break;
         CASE(1,3) dest[0]=dest[1]=dest[2]=src[0]; break;
         CASE(1,4) dest[0]=dest[1]=dest[2]=src[0], dest[3]=255; break;
         CASE(2,1) dest[0]=src[0]; break;
         CASE(2,3) dest[0]=dest[1]=dest[2]=src[0]; break;
         CASE(2,4) dest[0]=dest[1]=dest[2]=src[0], dest[3]=src[1]; break;
         CASE(3,4) dest[0]=src[0],dest[1]=src[1],dest[2]=src[2],dest[3]=255; break;
         CASE(3,1) dest[0]=stbi__compute_y(src[0],src[1],src[2]); break;
         CASE(3,2) dest[0]=stbi__compute_y(src[0],src[1],src[2]), dest[1] = 255; break;
         CASE(4,1) dest[0]=stbi__compute_y(src[0],src[1],src[2]); break;
         CASE(4,2) dest[0]=stbi__compute_y(src[0],src[1],src[2]), dest[1] = src[3]; break;
         CASE(4,3) dest[0]=src[0],dest[1]=src[1],dest[2]=src[2]; break;
         default: STBI_ASSERT(0);
      }
      #undef CASE
   }

   STBI_FREE(data);
   return good;
}

{% endhighlight %}

**After:**

{% highlight c %}

static unsigned char* stbi__convert_format(unsigned char* data, int img_n, int req_comp, unsigned int x, unsigned int y)
{
    int i, j;
    unsigned char* good;

    if (req_comp == img_n)
        return data;
    STBI_ASSERT(req_comp >= 1 && req_comp <= 4);

    good = (unsigned char*)stbi__malloc(req_comp * x * y);
    if (good == NULL) {
        STBI_FREE(data);
        return stbi__errpuc("out-of-memory", "Out of memory");
    }

    for (j = 0; j < (int)y; ++j) {
        unsigned char* src = data + j * x * img_n;
        unsigned char* dest = good + j * x * req_comp;

#define COMBO(a, b) ((a)*8 + (b))
#define CASE(a, b)    \
    case COMBO(a, b): \
        for (i = x - 1; i >= 0; --i, src += a, dest += b)

        // convert source image with img_n components to one with req_comp components;
        // avoid switch per pixel, so use switch per scanline and massive macros
        switch (COMBO(img_n, req_comp)) {
            CASE(1, 2) dest[0] = src[0], dest[1] = 255;
            break;
            CASE(1, 3) dest[0] = dest[1] = dest[2] = src[0];
            break;
            CASE(1, 4) dest[0] = dest[1] = dest[2] = src[0], dest[3] = 255;
            break;
            CASE(2, 1) dest[0] = src[0];
            break;
            CASE(2, 3) dest[0] = dest[1] = dest[2] = src[0];
            break;
            CASE(2, 4) dest[0] = dest[1] = dest[2] = src[0], dest[3] = src[1];
            break;
            CASE(3, 4) dest[0] = src[0], dest[1] = src[1], dest[2] = src[2], dest[3] = 255;
            break;
            CASE(3, 1) dest[0] = stbi__compute_y(src[0], src[1], src[2]);
            break;
            CASE(3, 2) dest[0] = stbi__compute_y(src[0], src[1], src[2]), dest[1] = 255;
            break;
            CASE(4, 1) dest[0] = stbi__compute_y(src[0], src[1], src[2]);
            break;
            CASE(4, 2) dest[0] = stbi__compute_y(src[0], src[1], src[2]), dest[1] = src[3];
            break;
            CASE(4, 3) dest[0] = src[0], dest[1] = src[1], dest[2] = src[2];
            break;
        default:
            STBI_ASSERT(0);
        }

#undef CASE
    }

    STBI_FREE(data);
    return good;
}

{% endhighlight %}

### Function `stbi__process_frame_header()`

**Issue:** Spacing is lacking on parts of the function and indentation is odd. The problem is aggravated by excessively
long lines and the peculiar style of placing `if`s on the same line of variable declarations and other statements.

Next are just the first few lines of `stbi__process_frame_header()`. Original code followed by the reformatted output.

**Before:**

{% highlight c %}

static int stbi__process_frame_header(stbi__jpeg *z, int scan)
{
   stbi__context *s = z->s;
   int Lf,p,i,q, h_max=1,v_max=1,c;
   Lf = stbi__get16be(s);         if (Lf < 11) return stbi__err("bad SOF len","Corrupt JPEG"); // JPEG
   p  = stbi__get8(s);            if (p != 8) return stbi__err("only 8-bit","JPEG format not supported: 8-bit only"); // JPEG baseline
   s->img_y = stbi__get16be(s);   if (s->img_y == 0) return stbi__err("no header height", "JPEG format not supported: delayed height"); // Legal, but we don't handle it--but neither does IJG
   s->img_x = stbi__get16be(s);   if (s->img_x == 0) return stbi__err("0 width","Corrupt JPEG"); // JPEG requires
   c = stbi__get8(s);
   if (c != 3 && c != 1) return stbi__err("bad component count","Corrupt JPEG");    // JFIF requires
   s->img_n = c;
   for (i=0; i < c; ++i) {
      z->img_comp[i].data = NULL;
      z->img_comp[i].linebuf = NULL;
   }

   if (Lf != 8+3*s->img_n) return stbi__err("bad SOF len","Corrupt JPEG");

   for (i=0; i < s->img_n; ++i) {
      z->img_comp[i].id = stbi__get8(s);
      if (z->img_comp[i].id != i+1)   // JFIF requires
         if (z->img_comp[i].id != i)  // some version of jpegtran outputs non-JFIF-compliant files!
            return stbi__err("bad component ID","Corrupt JPEG");
      q = stbi__get8(s);
      z->img_comp[i].h = (q >> 4);  if (!z->img_comp[i].h || z->img_comp[i].h > 4) return stbi__err("bad H","Corrupt JPEG");
      z->img_comp[i].v = q & 15;    if (!z->img_comp[i].v || z->img_comp[i].v > 4) return stbi__err("bad V","Corrupt JPEG");
      z->img_comp[i].tq = stbi__get8(s);  if (z->img_comp[i].tq > 3) return stbi__err("bad TQ","Corrupt JPEG");
   }

{% endhighlight %}

**After:**

{% highlight c %}

static int stbi__process_frame_header(stbi__jpeg* z, int scan)
{
    stbi__context* s = z->s;
    int Lf, p, i, q, h_max = 1, v_max = 1, c;
    Lf = stbi__get16be(s);
    if (Lf < 11)
        return stbi__err("bad SOF len", "Corrupt JPEG"); // JPEG
    p = stbi__get8(s);
    if (p != 8)
        return stbi__err("only 8-bit", "JPEG format not supported: 8-bit only"); // JPEG baseline
    s->img_y = stbi__get16be(s);
    if (s->img_y == 0)
        return stbi__err("no header height", "JPEG format not supported: delayed height"); // Legal, but we don't handle it--but neither does IJG
    s->img_x = stbi__get16be(s);
    if (s->img_x == 0)
        return stbi__err("0 width", "Corrupt JPEG"); // JPEG requires
    c = stbi__get8(s);
    if (c != 3 && c != 1)
        return stbi__err("bad component count", "Corrupt JPEG"); // JFIF requires
    s->img_n = c;
    for (i = 0; i < c; ++i) {
        z->img_comp[i].data = NULL;
        z->img_comp[i].linebuf = NULL;
    }

    if (Lf != 8 + 3 * s->img_n)
        return stbi__err("bad SOF len", "Corrupt JPEG");

    for (i = 0; i < s->img_n; ++i) {
        z->img_comp[i].id = stbi__get8(s);
        if (z->img_comp[i].id != i + 1) // JFIF requires
            if (z->img_comp[i].id != i) // some version of jpegtran outputs non-JFIF-compliant files!
                return stbi__err("bad component ID", "Corrupt JPEG");
        q = stbi__get8(s);
        z->img_comp[i].h = (q >> 4);
        if (!z->img_comp[i].h || z->img_comp[i].h > 4)
            return stbi__err("bad H", "Corrupt JPEG");
        z->img_comp[i].v = q & 15;
        if (!z->img_comp[i].v || z->img_comp[i].v > 4)
            return stbi__err("bad V", "Corrupt JPEG");
        z->img_comp[i].tq = stbi__get8(s);
        if (z->img_comp[i].tq > 3)
            return stbi__err("bad TQ", "Corrupt JPEG");
    }

{% endhighlight %}

### Function `stbi__parse_zlib_header()`

**Issue:** Formatting in this function is a mess. This is a place where Clang-Format shines the most.

**Before**:

{% highlight c %}

static int stbi__parse_zlib_header(stbi__zbuf *a)
{
   int cmf   = stbi__zget8(a);
   int cm    = cmf & 15;
   /* int cinfo = cmf >> 4; */
   int flg   = stbi__zget8(a);
   if ((cmf*256+flg) % 31 != 0) return stbi__err("bad zlib header","Corrupt PNG"); // zlib spec
   if (flg & 32) return stbi__err("no preset dict","Corrupt PNG"); // preset dictionary not allowed in png
   if (cm != 8) return stbi__err("bad compression","Corrupt PNG"); // DEFLATE required for png
   // window = 1 << (8 + cinfo)... but who cares, we fully buffer output
   return 1;
}

{% endhighlight %}

**After:**

{% highlight c %}

static int stbi__parse_zlib_header(stbi__zbuf* a)
{
    int cmf = stbi__zget8(a);
    int cm = cmf & 15;
    /* int cinfo = cmf >> 4; */
    int flg = stbi__zget8(a);
    if ((cmf * 256 + flg) % 31 != 0)
        return stbi__err("bad zlib header", "Corrupt PNG"); // zlib spec
    if (flg & 32)
        return stbi__err("no preset dict", "Corrupt PNG"); // preset dictionary not allowed in png
    if (cm != 8)
        return stbi__err("bad compression", "Corrupt PNG"); // DEFLATE required for png
    // window = 1 << (8 + cinfo)... but who cares, we fully buffer output
    return 1;
}

{% endhighlight %}

### Data tables with no space between the constants

**Issue:** There are several constant tables in the library. Some have the member constants properly spaced,
but most have the values all tightly packed. Some are also laid out in one very long line.

**Before:**

{% highlight c %}

static int stbi__zlength_base[31] = {
   3,4,5,6,7,8,9,10,11,13,
   15,17,19,23,27,31,35,43,51,59,
   67,83,99,115,131,163,195,227,258,0,0 };

static int stbi__zlength_extra[31]=
{ 0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0 };

static int stbi__zdist_base[32] = { 1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,
257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0};

{% endhighlight %}

**After:**

{% highlight c %}

static int stbi__zlength_base[31] = {
    3, 4, 5, 6, 7, 8, 9, 10, 11, 13,
    15, 17, 19, 23, 27, 31, 35, 43, 51, 59,
    67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
};

static int stbi__zlength_extra[31] = {
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2,
    2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0
};

static int stbi__zdist_base[32] = {
    1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
    257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
    8193, 12289, 16385, 24577, 0, 0
};

{% endhighlight %}

### General cases of odd formatting or spurious white space

Possibly resulting from the conversion from different editors or line endings.

Example: `function stbi_is_hdr()`.

**Before:**

{% highlight c %}

STBIDEF int      stbi_is_hdr          (char const *filename)
{
   FILE *f = stbi__fopen(filename, "rb");
   int result=0;
   if (f) {
      result = stbi_is_hdr_from_file(f);
      fclose(f);
   }
   return result;
}

{% endhighlight %}

**After:**

{% highlight c %}

STBIDEF int stbi_is_hdr(char const* filename)
{
    FILE* f = stbi__fopen(filename, "rb");
    int result = 0;
    if (f) {
        result = stbi_is_hdr_from_file(f);
        fclose(f);
    }
    return result;
}

{% endhighlight %}

### Conclusions

The above are just a few examples where I think Clang-Format did an awesome job. The STB library
is much larger, so there are countless other instances that have benefited.

Even though some aspects of code formatting are mainly opinion based, proper spacing and indenting of the
text are certainly not. Do the test yourself if you don't agree. Try to read plain text with missing spaces
between words or random paragraphs; count the amount of time you took to read it and then compare with a
properly formatted version.

I think it would be fantastic if the authors of STB Image applied Clang-Format to the library.
That would certainly raise the bar even more and make it more appealing to new users. Writing
readable and maintainable code is a super important aspect of Open Source Software, just as important
as writing bug free code. If users can't understand your code, then it will be of little use to them,
because they will feel intimidated if the need to make a change in the code ever arises, thus leading
to the "I'll just write it myself, at least I'll be able to understand the code" kind of mentality,
which only serves to duplicate effort in the long run.

Lastly, another big thanks to Sean Barrett and the contributors of STB Image.
Despite any flaws it might have, your work still rocks!

And big thanks, of course, to the people involved on the [Clang][link_clang] and [LLVM][link_llvm] projects.

[link_gn]:       https://channel9.msdn.com/Events/GoingNative/2013/The-Care-and-Feeding-of-C-s-Dragons
[link_clangfmt]: http://clang.llvm.org/docs/ClangFormat.html
[link_stbi]:     https://github.com/nothings/stb/blob/master/stb_image.h
[link_clang]:    http://clang.llvm.org/
[link_llvm]:     http://llvm.org/


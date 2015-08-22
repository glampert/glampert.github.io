---
layout:     post
title:      Encryption, home made style
date:       '2014-07-21T19:25:00.000-07:00'
author:     Guilherme Lampert
categories: Programming C
thumbnail:  encryption
highlight:  true
---

A while back I worked on an embedded system where we had some data that had to be encrypted.
The hardware was very limited, talking about an 8bit processor, so a proper encryption algorithm
was a no-no. Luckily, the security constraints weren't too hight, and some basic obfuscation of the
data would do. For that I revisited the good old `XOR` encryption/hashing, adding a few personal touches to it.

{% highlight c %}

#ifndef ENCRYPTION_H
#define ENCRYPTION_H

/* =====================================
 * Data Encryption/Decryption Routines
 * ===================================== */

/* Must be a power of two! */
#define KEY_MAX_BYTES 8

/* One extra byte for the rotation count */
#define KEY_TOTAL_BYTES (KEY_MAX_BYTES + 1)

/**
 * Do a XOR plus bit rotation encryption with the input data, using the specified key.
 */
void * Encrypt(void * data, UInt16 numBytes, const char * key);

/**
 * Revert the encryption if the key is the right one.
 */
void * Decrypt(void * data, UInt16 numBytes, const char * key);

#endif /* ENCRYPTION_H */

{% endhighlight %}

{% highlight c %}

#include "Encryption.h"

/* rotate right */
#define ROR_BYTE(x, shift) ((x) >> (shift)) | ((x) << (8 - (shift)))

/* rotate left  */
#define ROL_BYTE(x, shift) ((x) << (shift)) | ((x) >> (8 - (shift)))

void * Encrypt(void * data, UInt16 numBytes, const char * key)
{
    UInt16 i;
    UInt16 keyIndex = 0;

    char shift;
    unsigned char * p;

    shift = key[KEY_MAX_BYTES]; /* Last byte is the rotation count, range: [0,7] */
    p = (unsigned char *)data;

    for (i = 0; i < numBytes; ++i)
    {
        /* XOR */
        p[i] ^= key[keyIndex];

        /* Add to magic constant */
        p[i] += 0x7F;

        /* Rotate Right */
        p[i] = ROR_BYTE(p[i], shift);

        keyIndex = (keyIndex + 1) & (KEY_MAX_BYTES - 1);
    }

    return data;
}

void * Decrypt(void * data, UInt16 numBytes, const char * key)
{
    UInt16 i;
    UInt16 keyIndex = 0;

    char shift;
    unsigned char * p;

    shift = key[KEY_MAX_BYTES]; /* Last byte is the rotation count, range: [0,7] */
    p = (unsigned char *)data;

    for (i = 0; i < numBytes; ++i)
    {
        /* Rotate Left */
        p[i] = ROL_BYTE(p[i], shift);

        /* Subtract from magic constant */
        p[i] -= 0x7F;

        /* XOR */
        p[i] ^= key[keyIndex];

        keyIndex = (keyIndex + 1) & (KEY_MAX_BYTES - 1);
    }

    return data;
}

#undef ROR_BYTE
#undef ROL_BYTE

{% endhighlight %}

The code above should speak for itself: It is a basic byte-wise `XOR` with the encryption key, plus an addition
to a "magic" constant that reduces the occurrence of the value `0` in the output, toped with a bit rotation,
with rotation amount defined by the caller as the last byte in the key vector.

It worked very well for the application and was pretty fast and low power consuming. I think it is actually a
pretty neat way to obfuscate data, specially with the bit rotation, which makes harder for a hacker to break the "encryption".


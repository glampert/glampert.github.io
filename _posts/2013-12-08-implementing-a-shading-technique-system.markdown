---
layout:     post
title:      Implementing a Shading Technique System for GLSL
date:       '2013-12-08T15:24:00.002-08:00'
author:     Guilherme Lampert
categories: Programming OpenGL
thumbnail:  glsl-teapot
highlight:  true
---

* Contents
{:toc}

Pretty much since I started programming computer graphics I have spent time writing small rendering engines
for learning purposes. For the past few years I have been working on an engine dubbed "The BigGun Engine", like the [AC/DC song][link_acdc] `;)`,
which is a large scale rendering engine that I probably won't ever complete, but will serve me well as a learning tool for most of
the modern rendering techniques that we see on Triple-A titles today.

One of the goals was to implement a portable shading technique or effect system, based on description files such as the
ones used by frameworks like [CgFx][link_cg] and [HLSL][link_hlsl]. Since the idea was to have a hands-on approach,
the tools used were C++ (which is my programming language of choice) and GLSL. In a more real-life scenario,
using CgFx would be a better option, since you can achieve the same, or better results, with orders of magnitude
less coding and debugging, so take this post as the description of a purely learning project where I will outline
some details of implementing a shading effect system from scratch. I'm in no way saying my solution aims to be
better than the existing ones.

OK, so the first thing needed was a description language/format for the technique files.
XML could be a viable option, but I find it rather verbose and a parser can be complex and memory consuming.
[JSON][link_json] (JavaScript Object Notation) is a nicer format, but I didn't want to add a dependency to a
proper JSON parser library neither write my own. Well not a full JSON parser at least. So for that I decided
to define my own simplified version of the JSON language, which I named BON, for BigGun Object Notation.
The BON language is a simplified JSON, and the focus of the parser is to be easy to implement/maintain and
keep memory allocations to a minimum.

I won't go into the details of the parser here; just show the basic structure of the BON language.
The BON language is built around two basic elements: An **Object** and a **Property**.

An object is declared as:
{% highlight c %}
my_object: { }
{% endhighlight %}

And properties:
{% highlight c %}
my_string_property: "a b c d"
my_number_property: 3.141592
my_vector_property: (1, 2, 3)
{% endhighlight %}

An object can contain properties and other child objects. The object is defined by a name followed by `:` and `{ }`.
A property, unlike an object must be followed by a value, which can be a number, a string, a vector (a 2D, 3D or 4D vector,
not to be confused with an array. There is no generic array support) and a matrix (again a matrix in the geometry sense,
not a multi-dimensional array).

As you can see, the structure of the BON is identical to the XML and JSOM structures:
A name (Object) followed by set of values (Properties) that can turn out to also be child objects.

The goals of the shading technique system were the following:

- Support several versions of the OpenGL Shading Language, easing the task of providing fall-back support for older hardware.

- Have a way to mix several GLSL source files together, since GLSL didn't have an `#include` mechanism
  until very recently (see `GL_ARB_shading_language_include`).

- Simplify the declaration of vertex formats, fragment output formats and uniform variables/buffers.

- Provide support for multi-pass shading techniques, just like in CgFx and HLSL.

- Other small things like reloading shaders on-the-fly and caching to avoid duplicates and unnecessary loading.

Adding support for dynamically building shaders during runtime from code fragments is definitely
doable, but I didn't get to this point, since I don't really need such feature right now, but with the
basic shading technique system available, it is a lot easier to do so.

### Shader declaration

A shader block in a technique file is declared as the following:

{% highlight c %}

shader: {

    name: "my_shader",    // String type. User defined name for this shader.
    type: "vertexShader", // Type identifier string:
                          //   "vertexShader", "fragmentShader" and "geometryShader".

    // vertexFormat or fragOutputFormat
    // For a vertex shader, defines the vertex input format.
    // Right now, only a few built-in formats are supported,
    // but it can be extended to let the user define their own.
    // The same goes for the fragment shader output format,
    // which is the layout of the render target the shader write to.

    // uniform: { ... },
    // Shader uniform blocks:
    // Can be a simple uniform variable, such as a vec3:
    uniform: {
        name: "my_vec3",
        type: "vec3",         // Type name matches the GLSL types.
        init: (1.1, 2,2, 3.3) // Optional initial value.
    },

    // Or it can be a uniform "buffer" declaration,
    // also referred to as "uniform block" by D3D:
    uniform: {
        name: "my_uniform_buffer",
        type: "buffer",   // Type must be "buffer".
        dynamic: "no",    // Translates to GL_STREAM_DRAW or GL_DYNAMIC_DRAW.
        shareable: "yes", // If "yes", the buffer can be shared with other shaders.

        // And a list of buffer fields:
        field: {
            name: "field_0",
            type: "vec3"
        },
        field: {
            name: "field_1",
            type: "mat4"
        },
        field: {
            name: "field_2",
            type: "float[5]"
        }
    },

    // Also, the uniform buffer can be declared as:
    uniform: {
        type: "buffer",
        share: "bufferName"
    },
    // Which instructs the parser to find an existing buffer with
    // "bufferName" that is shared globally (had the "shareable"
    // property set) and use it instead.

    // And finally, the source files:
    srcFiles: {
        ns: "file_1",
        ns: "file_2"
        // and so on ...
    }
    // The files defined in the 'srcFiles' block are the actual
    // GLSL source code files. The 'ns' property name stands for
    // "native shader" or maybe "native source" whichever you like the most ;)
}

{% endhighlight %}

A native shader source file will contain only the GLSL code necessary for the shading algorithm,
and no uniform variable or vertex input declarations. These things are automatically generated by
the "GLSL preprocessor" based on the data declared in a technique file. This way we can easily have
a fallback for platforms that, for example, don't support uniform buffers. The preprocessor can break
the uniform buffer declaration in the technique file into individual uniform variable declarations.

Other things that we can do after the technique files are parsed is to concatenate the contents
of all native source files that were declared in the technique and replace non portable things like
`varyings` or `in/out` attributes with the correct names for the platform or shading language version.

Vertex formats (or vertex inputs if you will) are also generated based on information from the shading technique file.

### Technique declaration

A technique block is declared as the following:

{% highlight c %}

technique: {
    name: "my_tech", // User defined name identifier.

    // And a list of passes:
    pass: {
        name: "pass0", // Pass name.
        vs: "my_vs",   // Vertex shader to use.
        fs: "my_fs",   // Fragment shader to use.

        // And a list of optional render states:
        depthTest: "on",
        alphaBlend: "off"
    }
}

{% endhighlight %}

A technique can also have a Geometry Shader (`gs` property) and in the future I intend to add support for tessellation control shaders.
New render states can also be added at will, according to the needs of the engine. A technique can have an arbitrary number of passes.

### An example of a complete technique file

{% highlight c %}

shader: {
    name: "DebugVS",
    type: "vertexShader",
    vertexFormat: "DebugVertex",
    uniform: {
        name: "u_modelViewProjectionMatrix",
        type: "mat4",
        init: [ (1, 0, 0, 0), (0, 1, 0, 0), (0, 0, 1, 0), (0, 0, 0, 1) ]
    },
    srcFiles: {
        ns: "DebugVS"
    }
},

shader: {
    name: "DebugFS",
    type: "fragmentShader",
    fragOutputFormat: "DefaultFragOutput",
    srcFiles: {
        ns: "DebugFS"
    }
},

technique: {
    name: "DebugRenderingTechnique",
    pass: {
        name: "debugPass",
        vs: "DebugVS",
        fs: "DebugFS",
        depthTest: "on",
        alphaBlend: "off"
    }
}

{% endhighlight %}

And the two GLSL shaders used with it:

#### DebugVS

{% highlight c++ %}

// Vertex attributes generated from technique info:
// - vec3 a_position
// - vec3 a_color
// - vec3 a_texCoords_pointSize
//
// Uniform variables generated from technique info:
// - mat4 u_modelViewProjectionMatrix
//
// Built-in outputs (varyings):
// - vec4  v_transformedPosition
// - float v_pointSize
// - float v_clipDistance[]

// Stage outputs:
varying(0) vec3 v_color;
varying(1) vec2 v_texCoords;

void main()
{
    v_color     = a_color;
    v_texCoords = vec2(a_texCoords_pointSize.xy); // xy are the texture coordinates
    v_pointSize = a_texCoords_pointSize.z;        // and z stores the point size

    // Position is transformed and passed to the next stage:
    v_transformedPosition = vec4(u_modelViewProjectionMatrix * vec4(a_position, 1.0));
}

{% endhighlight %}

#### DebugFS

{% highlight c++ %}

// Fragment outputs (render targets), generated from technique info:
// - vec4 rt_fragColor

// Inputs from previous shader stage:
varying(0) vec3 v_color;
varying(1) vec2 v_texCoords;

void main()
{
    rt_fragColor = vec4(v_color, 1.0); // Always opaque (alpha = 1)
}

{% endhighlight %}

### Things to do...

One thing that I will very likely implement in the future will be some sort of inheritance mechanism.
For example: Shading technique `RenderWithAnimation` inherits from technique `RenderStaticMesh`.
That way I can reuse uniform variable declarations, vertex format and source files from a base
technique and only overwrite parts of it.

[link_acdc]: https://en.wikipedia.org/wiki/Big_Gun
[link_cg]:   https://developer.nvidia.com/cg-toolkit
[link_hlsl]: https://msdn.microsoft.com/en-us/library/windows/desktop/bb509561(v=vs.85).aspx
[link_json]: https://en.wikipedia.org/wiki/JSON


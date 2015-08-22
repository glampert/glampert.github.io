---
layout:     post
title:      Adding custom shaders to Cocos2D iOS
date:       '2014-05-01T11:59:00.001-07:00'
author:     Guilherme Lampert
categories: Programming Objective-C iOS OpenGL
thumbnail:  cocos2d-iphone
highlight:  true
---

I have recently started writing a small Space Shooter game for iOS using the [Cocos2D framework](http://www.cocos2d-iphone.org/).
Unfortunately, current versions of Cocos don't have support for user defined shader programs. Even though the library uses GLSL
shaders internally, the functionality is not exposed to the programmer. I'm pretty sure the next revisions will expose this feature,
but for now if you need shaders you'll have to do some hacking `;)`.

It is really not that difficult to add custom shaders to Cocos. There are two basic approaches that can be taken.
You can play safe and don't change the library at all, preserving compatibility with future versions. All you have to do
then is overwrite the `-(void)draw` methods of `CCSprite/CCNode` and do your custom GL drawing. The problem with this approach
though it that you have to rewrite all the drawing code that the sprites already do, when what you really want is just to change
the shader that is used. So I decided to do some small changes to the library and avoid completely rewriting the `-(void)draw` method myself.

Lets start by taking a look at the implementation of `[CCSprite draw]` (I've omitted some unimportant lines used for debugging and profiling).

{% highlight objectivec %}

-(void)draw
{
    ccGLBlendFunc(_blendFunc.src, _blendFunc.dst);
    ccGLBindTexture2D([_texture name]);

    CC_NODE_DRAW_SETUP();

    ccGLEnableVertexAttribs(kCCVertexAttribFlag_PosColorTex);

    #define kQuadSize sizeof(_quad.bl)
    long offset = (long)&_quad;

    // vertex
    NSInteger diff = offsetof(ccV3F_C4B_T2F, vertices);
    glVertexAttribPointer(kCCVertexAttrib_Position, 3, GL_FLOAT,
                          GL_FALSE, kQuadSize, (void*)(offset + diff));

    // texCoods
    diff = offsetof(ccV3F_C4B_T2F, texCoords);
    glVertexAttribPointer(kCCVertexAttrib_TexCoords, 2, GL_FLOAT,
                          GL_FALSE, kQuadSize, (void*)(offset + diff));

    // color
    diff = offsetof(ccV3F_C4B_T2F, colors);
    glVertexAttribPointer(kCCVertexAttrib_Color, 4, GL_UNSIGNED_BYTE,
                          GL_TRUE, kQuadSize, (void*)(offset + diff));

    glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);
}

{% endhighlight %}

OK, just some standard OpenGL drawing code. And I don't want to just copy and paste that it into my custom draw method.
Now where is the shader setup anyway? `CC_NODE_DRAW_SETUP()` is a good place to look for it:

{% highlight objectivec %}

#define CC_NODE_DRAW_SETUP()                                                \
do {                                                                        \
    ccGLEnable( _glServerState );                                           \
    NSAssert1(_shaderProgram, @"No shader program set for node: %@", self); \
    [_shaderProgram use];                                                   \
    [_shaderProgram setUniformsForBuiltins];                                \
} while (0)

{% endhighlight %}

Right, `CC_NODE_DRAW_SETUP()` sets the shader program. It is mixed in the middle of the draw method.
But it doesn't have to be. So what I did was to split `draw` into two methods:

{% highlight objectivec %}

// Added by Lampert on 29/April/2014 to allow overwriting [CCSprite draw] and apply a custom shader.
-(void)drawInternal
{
    ccGLBlendFunc(_blendFunc.src, _blendFunc.dst);
    ccGLBindTexture2D([_texture name]);

    ccGLEnableVertexAttribs(kCCVertexAttribFlag_PosColorTex);

    #define kQuadSize sizeof(_quad.bl)
    long offset = (long)&_quad;

    // vertex
    NSInteger diff = offsetof(ccV3F_C4B_T2F, vertices);
    glVertexAttribPointer(kCCVertexAttrib_Position, 3, GL_FLOAT,
                          GL_FALSE, kQuadSize, (void*)(offset + diff));

    // texCoods
    diff = offsetof(ccV3F_C4B_T2F, texCoords);
    glVertexAttribPointer(kCCVertexAttrib_TexCoords, 2, GL_FLOAT,
                          GL_FALSE, kQuadSize, (void*)(offset + diff));

    // color
    diff = offsetof(ccV3F_C4B_T2F, colors);
    glVertexAttribPointer(kCCVertexAttrib_Color, 4, GL_UNSIGNED_BYTE,
                          GL_TRUE, kQuadSize, (void*)(offset + diff));

    glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);
}

-(void)draw
{
    CC_NODE_DRAW_SETUP();
    [self drawInternal];
}

{% endhighlight %}

As you can see, the standard draw remains. The change is only local and it doesn't affect any other file in the library.
Good. But I'm going to need to call `drawInternal` in my custom Sprite class, so a public declaration for `drawInternal`
must be provided in the header file (`CCSprite.h`). No big deal, just a recompile of the library and we are set.

Now that the shader setup is external to `drawInternal`, we can easily overwrite draw to add a custom shader,
without having to copy and paste the Cocos drawing code. In my custom Sprite class, for example, its draw method looks like:

{% highlight objectivec %}

- (void)draw
{
    if (self.displayDamageEffect)
    {
        // Set custom shader program:
        [GLProgMgr enableProgram:GLPROG_COLOR_REPLACE];

        // Set model-view-projection matrix:
        kmMat4 matrixP;
        kmMat4 matrixMV;
        kmMat4 matrixMVP;
        kmGLGetMatrix(KM_GL_PROJECTION, &matrixP);
        kmGLGetMatrix(KM_GL_MODELVIEW,  &matrixMV);
        kmMat4Multiply(&matrixMVP, &matrixP, &matrixMV);
        [GLProgMgr setProgramParam:u_MVPMatrix floatMat4:matrixMVP.mat];

        // Compute new color for damage effect:
        float hsvReplaceWith[3];
        const vec4_t cFinal = mix(cGreen, cRed, self.damageAmount);
        rgb2hsv(cFinal.x, cFinal.y, cFinal.z, hsvReplaceWith);
        [GLProgMgr setProgramParam:u_hsvReplaceWith floatVec3:hsvReplaceWith];

        // Custom draw:
        [super drawInternal];

        // Restore Cocos2D shader program:
        [GLProgMgr restore];
    }
    else
    {
        // Standard draw:
        [super draw];
    }
}

{% endhighlight %}

This way you can also easily switch between your custom rendering and Cocos. Note that the matrices needed for the node are gathered
via the [Kazmath API](https://github.com/Kazade/kazmath), which is used internally by Cocos but is included with the project and publicly
visible. It emulates old fixed-function OpenGL. To be sure, I also restore the previous shader to make my custom rendering as "invisible"
to Cocos as possible.

Unfortunately Cocos does not have a unified drawing architecture. So other node types, such as `CCSpriteBatchNode`, will also have their
own specific draw method. I did in fact had to overwrite `[CCSpriteBatchNode draw]` in much the same way I did with `CCSprite`.
Just added a `drawInternal` and moved `CC_NODE_DRAW_SETUP()` out of it. Then defined a custom `SpriteBatchNode` that only overwrites the draw method.

As a side note, another way to achieve the goal of custom shaders in Cocos2D is to make use of the internal shader management classes
and inject your custom shaders directly inside Cocos. It is also super simple, but implies more changes to the library internals.

As a bonus, I've written my own shader program manager, just for fun. It follows in the next two code listing.

### `GLProgManager.h`

{% highlight objectivec %}

// Vertex attribute pair [mane,index]
typedef struct sVertexAttrib {
    const char * name;
    int index;
} VertexAttrib;

// Custom built-in shade programs used by the app.
// Once you add a new entry here, make sure to update the list in corresponding .m
typedef enum eGLProgId {
    GLPROG_COLOR_REPLACE,
    NUM_GLPROGS
} GLProgId;

// ======================================================
// GLProgManager interface:
// ======================================================

@interface GLProgManager : NSObject

- (id)    init;
- (void)  enableProgram: (GLProgId) prog;
- (void)  restore; // Restore previous GL program for Cocos2D to proceed.

// Get/set shader program uniforms for currently enabled program:
- (GLint) getProgramParamHandle: (GLProgId) prog paramName: (NSString *) name;
- (BOOL)  setProgramParam: (GLint) paramId floatValue: (float) val;
- (BOOL)  setProgramParam: (GLint) paramId floatVec4:  (const float *) val;
- (BOOL)  setProgramParam: (GLint) paramId floatVec3:  (const float *) val;
- (BOOL)  setProgramParam: (GLint) paramId floatMat4:  (const float *) val;

@end

{% endhighlight %}

### `GLProgManager.m`

{% highlight objectivec %}

#import "GLProgManager.h"

// ======================================================
// Helper macros:
// ======================================================

#define GLPROG_LIST_BEGIN() \
static struct { \
    GLuint glid; \
    const char * name; \
    const char * vs; \
    const char * fs; \
    const VertexAttrib * const * vtxAttribs; \
} customPrograms[] = {

#define DECLARE_GLPROG(progId) \
    { 0, #progId, progId##_vs, progId##_fs, progId##_vtxAttribs },

#define GLPROG_LIST_END() };

// Accessors:
#define GLPROG_GLID(progId)              customPrograms[(int)(progId)].glid
#define GLPROG_NAME(progId)              customPrograms[(int)(progId)].name
#define GLPROG_VS_SOURCE(progId)         customPrograms[(int)(progId)].vs
#define GLPROG_FS_SOURCE(progId)         customPrograms[(int)(progId)].fs
#define GLPROG_VERTEX_ATTRIBUTES(progId) customPrograms[(int)(progId)].vtxAttribs

// ======================================================
// List of custom program matching the GLProgId enum:
// ======================================================

// Every program id declared in the GLProgId enum
// must be defined here:

extern const char GLPROG_COLOR_REPLACE_vs[];
extern const char GLPROG_COLOR_REPLACE_fs[];
extern const VertexAttrib * GLPROG_COLOR_REPLACE_vtxAttribs[];

GLPROG_LIST_BEGIN()
    DECLARE_GLPROG(GLPROG_COLOR_REPLACE)
GLPROG_LIST_END()

// ======================================================
// GLProgManager implementation:
// ======================================================

@implementation GLProgManager
{
    // Save and restore Cocos2D GL prog when drawing with our custom programs.
    GLint oldProgram;
}

// Keep track of accidental multiple initializations.
static BOOL glProgMgrCreated = NO;

//
// Methods:
//

- (void) printInfoLogs: (GLuint) progId vs: (GLuint) vsId fs: (GLuint) fsId
{
    GLsizei charsWritten;
    char infoLogBuf[4096];

    charsWritten = 0;
    glGetShaderInfoLog(vsId, ARRAY_LEN(infoLogBuf) - 1, &charsWritten, infoLogBuf);
    if (charsWritten > 0)
    {
        infoLogBuf[ARRAY_LEN(infoLogBuf) - 1] = '\0';
        NSLog(@"------ VS INFO LOG ------ \n%s\n", infoLogBuf);
    }

    charsWritten = 0;
    glGetShaderInfoLog(fsId, ARRAY_LEN(infoLogBuf) - 1, &charsWritten, infoLogBuf);
    if (charsWritten > 0)
    {
        infoLogBuf[ARRAY_LEN(infoLogBuf) - 1] = '\0';
        NSLog(@"------ FS INFO LOG ------ \n%s\n", infoLogBuf);
    }

    charsWritten = 0;
    glGetProgramInfoLog(progId, ARRAY_LEN(infoLogBuf) - 1, &charsWritten, infoLogBuf);
    if (charsWritten > 0)
    {
        infoLogBuf[ARRAY_LEN(infoLogBuf) - 1] = '\0';
        NSLog(@"------ PROGRAM INFO LOG ------ \n%s\n", infoLogBuf);
    }
}

- (GLuint) createSingleProgram: (const char *) name vs: (const char *) vsSrc
                                                    fs: (const char *) fsSrc
                                         vertexAttribs: (const VertexAttrib * const *) vtxAttribs
{
    assert(name  != NULL);
    assert(vsSrc != NULL);
    assert(fsSrc != NULL);
    assert(vtxAttribs != NULL);

    // Allocate ids:
    GLuint progId = glCreateProgram();
    GLuint vsId   = glCreateShader(GL_VERTEX_SHADER);
    GLuint fsId   = glCreateShader(GL_FRAGMENT_SHADER);

    if ((progId <= 0) || (vsId <= 0) || (fsId <= 0))
    {
        NSLog(@"Problems when creating shader program '%s'. Failed to alloc GL ids!", name);

        if (glIsProgram(progId)) { glDeleteProgram(progId); }
        if (glIsShader(vsId))    { glDeleteShader(vsId);    }
        if (glIsShader(fsId))    { glDeleteShader(fsId);    }
        return 0;
    }

    // Compile & attach shaders:
    glShaderSource(vsId, 1, (const GLchar **)&vsSrc, NULL);
    glCompileShader(vsId);
    glAttachShader(progId, vsId);

    glShaderSource(fsId, 1, (const GLchar **)&fsSrc, NULL);
    glCompileShader(fsId);
    glAttachShader(progId, fsId);

    // Set vertex attributes:
    for (int i = 0; vtxAttribs[i] != NULL; ++i)
    {
        glBindAttribLocation(progId, vtxAttribs[i]->index, vtxAttribs[i]->name);
    }

    // Link the shader program:
    glLinkProgram(progId);

    // Print errors/warnings for the just compiled shaders and program:
    [self printInfoLogs:progId vs:vsId fs:fsId];

    // After attached to a program the shader objects can be deleted.
    glDeleteShader(vsId);
    glDeleteShader(fsId);

    return progId;
}

- (void) loadCustomPrograms
{
    assert(ARRAY_LEN(customPrograms) == NUM_GLPROGS);
    NSLog(@"Loading custom GL shader programs...");

    for (int i = 0; i < NUM_GLPROGS; ++i)
    {
        NSLog(@"Creating custom shader program '%s'...", GLPROG_NAME(i));

        GLPROG_GLID(i) = [self createSingleProgram:GLPROG_NAME(i)
                                                vs:GLPROG_VS_SOURCE(i)
                                                fs:GLPROG_FS_SOURCE(i)
                                     vertexAttribs:GLPROG_VERTEX_ATTRIBUTES(i)];
        if (GLPROG_GLID(i) != 0)
        {
            NSLog(@"Custom GL prog '%s' created.", GLPROG_NAME(i));
        }
    }
}

- (id) init
{
    assert(glProgMgrCreated == NO);

    self = [super init];
    if (!self)
    {
        return nil;
    }

    oldProgram = 0;
    [self loadCustomPrograms];

    glProgMgrCreated = YES;
    NSLog(@"GLProgManager initialized...");
    return self;
}

- (void) dealloc
{
    // Cleanup. Not strictly necessary for singletons.
    for (int i = 0; i < NUM_GLPROGS; ++i)
    {
        if (GLPROG_GLID(i))
        {
            glDeleteProgram(GLPROG_GLID(i));
            GLPROG_GLID(i) = 0;
        }
    }
}

- (void) enableProgram: (GLProgId) prog
{
    assert((int)prog < NUM_GLPROGS);

    // Save current so that we ca [restore] it afterwards
    // to allows further Cocos2D drawings.
    oldProgram = 0;
    glGetIntegerv(GL_CURRENT_PROGRAM, &oldProgram);

    if (GLPROG_GLID(prog) == 0)
    {
        NSLog(@"Attention! Custom shader program '%s' (%d) is null!",
              GLPROG_NAME(prog), (int)prog);

        return;
    }

    // Set the custom shader program:
    glUseProgram(GLPROG_GLID(prog));
}

- (void) restore
{
    // Restore Cocos2D shader:
    glUseProgram(oldProgram);
}

- (GLint) getProgramParamHandle: (GLProgId) prog paramName: (NSString *) name
{
    assert(name != nil);
    assert((int)prog < NUM_GLPROGS);

    const char * nameCStr = [name cStringUsingEncoding:NSUTF8StringEncoding];
    GLint loc = glGetUniformLocation(GLPROG_GLID(prog), nameCStr);

    if (loc == -1)
    {
        NSLog(@"Failed to get location for shader uniform '%@'. ProgId: '%s' (%d)",
              name, GLPROG_NAME(prog), (int)prog);
    }

    return loc;
}

- (BOOL) setProgramParam: (GLint) paramId floatValue: (float) val
{
    if (paramId != -1)
    {
        glUniform1f(paramId, val);
        return YES;
    }
    return NO;
}

- (BOOL) setProgramParam: (GLint) paramId floatVec4: (const float *) val
{
    assert(val != nil);
    if (paramId != -1)
    {
        glUniform4f(paramId, val[0], val[1], val[2], val[3]);
        return YES;
    }
    return NO;
}

- (BOOL) setProgramParam: (GLint) paramId floatVec3: (const float *) val
{
    assert(val != nil);
    if (paramId != -1)
    {
        glUniform3f(paramId, val[0], val[1], val[2]);
        return YES;
    }
    return NO;
}

- (BOOL) setProgramParam: (GLint) paramId floatMat4: (const float *) val
{
    assert(val != nil);
    if (paramId != -1)
    {
        glUniformMatrix4fv(paramId, 1, GL_FALSE, val);
        return YES;
    }
    return NO;
}

@end

{% endhighlight %}



/*
 * Common scripts used by the whole website.
 * - Performs setup of a few dynamic elements.
 * - Loads deferred images.
 * - DOM processing starts on jQuery.ready().
 *
 * Dependencies:
 *  jQuery
 *  BootstrapJS
 *
 */

"use strict";

function myImgOnLoad(jqImg, callback) {
    // The callback gets fired once the image loads, even
    // after a dynamic reset of the 'src' attribute.
    jqImg.one("load", function() {
        callback();
    });
}

function myImgLoadDeferred(jqImg) {
    // Slides and thumbnails set the 'defpath' attribute
    // with the image path, so that we can delay-load them.
    jqImg.attr("src", jqImg.attr("defpath"));
    jqImg.attr("defpath", null);
}

function myImgIsLoaded(jqImg) {
	// Initially, the image should have no 'src', to avoid
	// sending invalid requests to the server. We also clear
	// the custom 'defpath' property to be sure once it is loaded.
    return jqImg.attr("src")     != null &&
           jqImg.attr("defpath") == null;
}

function setUpCategoryDisplay() {
    var imgFadeInDelay = 600;

    // Show "All" and load the deferred images for the visible thumbnails:
	// ('img.defpath' property will have the actual path)
    $(".post-list-body>div[post-cate!=All]").hide();
    $(".post-list-body>div[post-cate=All] img").each(function(index, img) {
        var jqImg = $(img);
        if (!myImgIsLoaded(jqImg)) {
            myImgOnLoad(jqImg, function() { jqImg.fadeIn(imgFadeInDelay); });
            myImgLoadDeferred(jqImg);
        }
    });

    // Show category when clicking the categories list:
    $(".categories-list-item").click(function() {
        var category = $(this).attr("cate");
        $(".post-list-body>div[post-cate!='" + category + "']").hide(250);
        $(".post-list-body>div[post-cate='"  + category + "'] img").each(
            function(index, img) {
                var jqImg = $(img);
                if (!myImgIsLoaded(jqImg)) {
                    myImgOnLoad(jqImg, function() { jqImg.fadeIn(imgFadeInDelay); });
                    myImgLoadDeferred(jqImg);
                }
        });
        $(".post-list-body>div[post-cate='"  + category + "']").show(400);
    });
}

function setUpTableOfContents() {
    // Properly displays the main post list or the post contents.
    if (typeof $("#markdown-toc").html() === "undefined") {
        $("#content").hide();
        $("#my-article").removeClass("col-sm-9").addClass("col-sm-12");
    } else {
        $("#content .content-text").html("<ul>" + $("#markdown-toc").html() + "</ul>");
    }
}

function setUpBackToTopButton() {
    $(window).scroll(function() {
        if ($(window).scrollTop() > 100) {
            $("#back-to-top-button").fadeIn(500);
        } else {
            $("#back-to-top-button").fadeOut(500);
        }
    });

    $("#back-to-top-button").click(function() {
        // NOTE: Firefox requires both 'html' and 'body' to auto-scroll!
        $("html, body").animate({ "scrollTop": 0 }, 500);
        return false;
    });

    // Tooltip on mouse hover.
    $(function() {
        $("[data-toggle='tooltip']").tooltip();
    });
}

function setUpSlideShowContainers() {
    /*
     * Only loads the first image/slide. The following images are loaded
     * when the user clicks the given slide button, if not yet loaded.
     *
     * The img tags in the HTML must follow this convention:
     *
     *   <img defpath="path/to/image.ext">
	 *
	 * No 'src' is required.
     */

    // Constants:
    var slideFadeMilliseconds = 300;
    var activeButtonClass     = "slideshow-active-button";
    var buttonGroupClass      = "slideshow-buttons";
    var slideShowClass        = "slideshow-container";
    var buttonTargetHref      = "javascript:;";

    // Find all slide-shows and iterate them:
    $("." + slideShowClass).each(function(index, slideShowContainer) {

        // Find all images inside the slideShowContainer, then load the first deferred image:
        var childImages = $(slideShowContainer).find("img");
        var jqImg       = $(childImages[0]);

        if (jqImg) {
            // Show the image only when loading completes.
            myImgOnLoad(jqImg, function() {
                jqImg.fadeIn(slideFadeMilliseconds);
            });
            // Start the download.
            myImgLoadDeferred(jqImg);
        }

        // If the container has a single image, don't add the slide buttons.
        // Also shrink the base border to undo the "polaroid" look.
        if (childImages.length == 1) {
            jqImg.css("border-bottom-width", "10px");
            return;
        }

        // Array to contain the buttons and their corresponding images.
        var buttons = [];

        // Record which button/image is currently active.
        var current = 0;

        // Build a div to contain the buttons:
        var buttonsContainer = $("<div>").addClass(buttonGroupClass);

        // Iterate each child image to add the buttons:
        childImages.each(function(index, img) {

            // Build a new button. If it's the first button it should be active.
            var button = $("<a>").prop("href", buttonTargetHref);

            if (index == 0) {
                button.addClass(activeButtonClass);
            }

            buttons.push({ "button": button, "image": img });
            buttonsContainer.append(button);

            button.click(function() {
                if (current == index) {
                    return; // Clicking the currently active button. Do nothing.
                }

                function slideFade(jqImgIn, waitForLoading) {
                    // Fade out the old current image:
                    $(buttons[current].image).fadeOut(slideFadeMilliseconds,
                        function() {
                            // then fade in this slide/image:
                            if (waitForLoading) {
                                myImgOnLoad(jqImgIn, function() {
                                    jqImgIn.fadeIn(slideFadeMilliseconds);
                                });
                                myImgLoadDeferred(jqImgIn);
                            } else {
                                jqImgIn.fadeIn(slideFadeMilliseconds);
                            }
                        });

                    $(buttons[current].button).removeClass(activeButtonClass);
                    $(buttons[index].button).addClass(activeButtonClass);
                    current = index; // Remember the active button.
                }

                // Load the image if not yet loaded. If it is loading for the first
				// time, then defer the fade-in until loading completes.
                var jqImg = $(img);
                if (!myImgIsLoaded(jqImg)) {
                    slideFade(jqImg, /* waitForLoading = */ true); // Show the image only when loading completes.
                } else {
                    slideFade(jqImg, /* waitForLoading = */ false); // Already loaded, fade-in/out now.
                }
            });
        });

        // Add the expanded slide-show to the page:
        slideShowContainer.appendChild(buttonsContainer[0]);
    });
}

function fixMissingImageCaptions() {
    //
    // Some post images don't have a caption.
    // Now that I've added the "polaroid"-like bottom
    // caption area, it looks better to make sure all
    // images have this description text. Some don't
    // have it, but they have a 'title' property, which
    // can be repurposed as a caption.
    //
    $(".post img").each(function(index, img) {
        var jqImg = $(img);

        // If an <em> follows, it has a caption already.
        var immediateSibling = jqImg.next();
        if (immediateSibling && !$(immediateSibling).is("em")) {

            // We won't add a caption to the profile picture
            // and the StackExchange flair thingy. Slide-show
            // images also don't get a caption.
            var id = jqImg.attr("id");
            var parentClass = jqImg.parent().attr("class");

            if (!$(immediateSibling).html() &&
                (id != "profile-pic") && (id != "stackexchange-flair") &&
                (parentClass != "slideshow-img-list")) {

                var title = jqImg.attr("title");
                var imgCaption = $("<em>");
                imgCaption.html(title);
                jqImg.after(imgCaption);
            }
        }
    });
}

function addBlankTargetToExternalLinks() {
    // This should make external links always open in a new browser tab.
    $("a[href^='http']").each(function() {
        $(this).attr("target", "_blank");
    });
}

//
// Sets up the dynamic site elements
// when the pages finish loading.
//
$(document).ready(function() {
    setUpCategoryDisplay();
    setUpTableOfContents();
    setUpBackToTopButton();
    setUpSlideShowContainers();
    fixMissingImageCaptions();
    addBlankTargetToExternalLinks();
});


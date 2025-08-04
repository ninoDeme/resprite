# [Resprite](https://resprite.ninodeme.com)

Resprite is a tool for converting images/screenshots of pixel art, into proper resolution pixel art images.

## How it works

First we have to assume that the original image still contains the pixel art in a grid with properly spaced pixels,
then by definig where the pixels start and the spacing between each pixel we can take the color of the exact center of
each pixel to generate the output image.

This differs by just resizing the image using a default nearest neighbor algorithm because we can determine exactly
what part of the original image each pixel samples, so it should work when the source resolution is not a multiple of
the output resolution, and when the pixel art is not properly aligned in the original image.

## Usage

1. Load an image
1. Set the offset so that the first indicator is properly aligned with the center of the first pixel.
1. Adjust the pixel size until all the other indicators are properly in the center of each pixel.
1. Change the output resolution until all the pixels are properly covered.
1. After you think the preview image is correct, Press "Save Output".
1. Check the image in a proper image editor if theres anything that needs adjusting.



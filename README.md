# H5P.RealityBox
Set up 3D models and annotate them with H5P content

## Structure
This content type consists of three libraries:
- H5P.RealityBox
- [H5P.BabylonBox](https://github.com/rwth-acis/h5p-babylonbox)
- [H5PEditor.RealityBox](https://github.com/rwth-acis/h5p-editor-realitybox)
- [H5PEditor.ThreeDModelLoader (modified, draft)](https://github.com/rwth-acis/h5p-editor-3d-model-loader)

In addition, the following libraries must also be installed:
- [H5P.KewArCode 0.2](https://github.com/otacke/h5p-kewar-code)
- [H5P.DragNBar 1.5](https://github.com/h5p/h5p-drag-n-bar)
- [H5P.Column 1.13](https://github.com/h5p/h5p-column)
- [H5PEditor.Wizard 1.2](https://github.com/h5p/h5p-editor-wizard)
- [FontAwesome 4.5](https://github.com/h5p/font-awesome)

## Changes for operation
At this point in time, some minor changes need to be made to the core of H5P so that this module can be used without any problems.
It must be noted that each time the core is overwritten, e.g. by an update, these changes must be made again.

### Add gltf to the allowed file types
The H5P team added the required types gltf and glb to the H5P core on GitHub in June 2021.
This updated core is not yet available to all plugins for the individual LMSs and CMSs.
So until further notice this modification still needs to be done.

This change is to be made in the file **h5p.classes.php**.
It can be found in different places on the individual platforms:

- Wordpress
  - wp-content/plugins/h5p/h5p-php-library/h5p.classes.php
- Moodle
  - mod/hvp/library/h5p.classes.php
  - h5p/h5p/lib/joubel/core/h5p.classes.php
  - h5p/h5plib/v.../joubel/core/h5p.classes.php
- Drupal
  - In Drupal, this change has no effect.\
    Instead, you have to manually add this to the allowed file types input in the H5P settings at the administration.

Change:
- Old
  ```php
  public static $defaultContentWhitelist = 'json png jpg jpeg gif bmp tif tiff svg eot ttf woff woff2 otf webm mp4 ogg mp3 m4a wav txt pdf rtf doc docx xls xlsx ppt pptx odt ods odp xml csv diff patch swf md textile vtt webvtt';
  ```
- New
  ```php
  public static $defaultContentWhitelist = 'json png jpg jpeg gif bmp tif tiff svg eot ttf woff woff2 otf webm mp4 ogg mp3 m4a wav txt pdf rtf doc docx xls xlsx ppt pptx odt ods odp xml csv diff patch swf md textile vtt webvtt gltf glb';
  ```
  
### Prevent rendering of FullscreenBar for this content type
This change is to be made in the file **h5peditor-form.js**.\
It can be found at Moodle here:
- h5p/h5plib/v.../joubel/editor/scripts/h5peditor-form.js
  
Change:
- Old
  ```js
  if (library.indexOf('H5P.CoursePresentation') === -1 &&
      library.indexOf('H5P.BranchingScenario') === -1 &&
      library.indexOf('H5P.InteractiveVideo') === -1) {
    ns.FullscreenBar(this.$form, library);
  }
  ```
- New
  ```js
  if (library.indexOf('H5P.CoursePresentation') === -1 &&
      library.indexOf('H5P.BranchingScenario') === -1 &&
      library.indexOf('H5P.InteractiveVideo') === -1 &&
      library.indexOf('H5P.RealityBox') === -1) {
    ns.FullscreenBar(this.$form, library);
  }
  ```

## Build distribution files
### Required
- [Node Package Manager (NPM)](https://www.npmjs.com/)
- [Webpack](https://webpack.js.org/)

Clone this repository on git and go into the folder. Then run on the command line to install all dependencies:
```
npm install
```
After that you can build with Webpack the distribution files:
```
npx webpack
```

## Build H5P package for installation
### Required
- [h5p-cli](https://github.com/h5p/h5p-cli)

Note: It is important that all libraries to be packed into the H5P package are git repositories. Otherwise they will be ignored by h5p-cli.

Use the [pack command](https://h5p.org/h5p-cli-guide#packcmd) of h5p-cli to bundle and compress all required libraries into a H5P package named realitybox.h5p:

```
h5p pack [-r] H5P.RealityBox H5P.BabylonBox H5PEditor.RealityBox H5PEditor.ThreeDModelLoader realitybox.h5p
```


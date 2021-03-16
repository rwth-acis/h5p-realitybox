import Preview from './preview.js';
import Viewer from './viewer.js';

H5P.RealityBox = (function ($) {

  /**
   * Constructor function
   * @param {Object} options - Config object for RealityBox
   * @param {string} id - ID of RealityBox instance
   */
  function RealityBox(options, id) {
    console.log(options);
    // console.log(H5P.getPath(options.realitybox.model.path, id))
    // Extend defaults with provided options
    this.options = $.extend(true, {}, {
      welcomeText: 'N/A'
    }, options);
    // Keep provided id
    this.id = id;

    /**
     * Attach function called by H5P framework to insert H5P content into page
     * @param {jQuery} $container
     */
    this.attach = ($container) => {
      $container.addClass('h5p-realitybox');
      const preview = new Preview($container);
      $container.append(`<div class="welcome">${this.options.welcomeText}</div>`)
      const babylonBox = H5P.newRunnable({
        library: 'H5P.BabylonBox 1.0',
        params: {}
      }, this.id, undefined, undefined, {parent: this});
      babylonBox.attach(preview.$box);
      const viewer = new Viewer(babylonBox.$canvas, $container, babylonBox);
      $container.find('.trigger--show-viewer').click(() => {
        viewer.show();
      });
    }

  }

  return RealityBox;

})(H5P.jQuery);

export default H5P.RealityBox;

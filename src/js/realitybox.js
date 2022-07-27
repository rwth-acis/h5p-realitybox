import Preview from './preview.js';
import Viewer from './viewer.js';

H5P.RealityBox = (function ($) {

  /**
   * Constructor function
   * @param {Object} options - Config object for RealityBox
   * @param {string} id - ID of RealityBox instance
   */
  function RealityBox(options, id) {

    // Only for evaluation purposes (remove in production)
    // Create global Data4Thesis instance for evaluation
    //window.d4t = new Data4Thesis('https://ginkgo.informatik.rwth-aachen.de/ballmann/index.php');

    // Extend defaults with provided options
    this.options = options.realitybox;
    this.description = options.description;
    // Keep provided id
    this.id = id;
  }

  /**
   * Attach function called by H5P framework to insert H5P content into page
   * @param {jQuery} $container
   */
  RealityBox.prototype.attach = async function ($container) {
      $container.addClass('h5p-realitybox');
      const preview = new Preview($container);

      if (this.description) {
        const $descriptionBox = $(`<div />`).appendTo($container);
        $descriptionBox.html(this.description);
      }

      let modelUrl = H5P.getPath(this.options.model.path, this.id);
      let params = $.extend(
        {},
        { modelUrl },
        { annotations: this.options.annotations }
      );
      const babylonBox = H5P.newRunnable({
        library: 'H5P.BabylonBox 1.0',
        params
      }, this.id, undefined, undefined, {parent: this});

      await babylonBox.attach(preview.$box);

      if (
        this.options.settings === true ||
        (this.options.settings && this.options.settings.autoRotation)
      ) {
        babylonBox.camera.startAutoRotation();
      }

      this._viewer = new Viewer(
        babylonBox.$canvas,
        $container,
        babylonBox,
        this.id,
        this.options
      );

      babylonBox.on('ready', () => {
        preview.addControls();
        $container.find('.trigger--show-viewer').click(() => {
          this._viewer.show();
        });
      });

      this._checkHash();
      window.onhashchange = this._checkHash;
  }

  /**
   * Checks whether viewer should shown directly
   * @private
   */
  RealityBox.prototype._checkHash = function () {
    if (location.hash === '#openViewer=' + this.id) {
      this._viewer.show();
      this._viewer.$el.find('.trigger--vr').click();

      // only for evaluation
      //d4t.set('usedQuickHash', 1)
    }
  }

  return RealityBox;

})(H5P.jQuery);

export default H5P.RealityBox;

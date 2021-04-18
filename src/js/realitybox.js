import Preview from './preview.js';
import Viewer from './viewer.js';

H5P.RealityBox = (function ($) {

  /**
   * Constructor function
   * @param {Object} options - Config object for RealityBox
   * @param {string} id - ID of RealityBox instance
   */
  function RealityBox(options, id) {
    // Extend defaults with provided options
    this.options = options.realitybox;
    // Keep provided id
    this.id = id;
    console.log(this.options);
  }

  /**
   * Attach function called by H5P framework to insert H5P content into page
   * @param {jQuery} $container
   */
  RealityBox.prototype.attach = function ($container) {
      $container.addClass('h5p-realitybox');
      const preview = new Preview($container);
      $container.append(`<div class="welcome">This is the model viewer.</div>`)

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
      babylonBox.attach(preview.$box);

      this._viewer = new Viewer(
        babylonBox.$canvas,
        $container,
        babylonBox,
        this.id
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
      console.log("hash opens viewer");
      this._viewer.show();
    }
  }

  return RealityBox;

})(H5P.jQuery);

export default H5P.RealityBox;

const Preview = (function ($) {

  /**
   * Constructor function
   * Attachs preview box to content container
   * @params {jQuery} $container - Content container
   */
  function Preview($container) {
    this.$box = $(`<div class="h5p-realitybox--preview"></div>`).appendTo($container);
  }

  /**
   * Attachs 3D badge and open button to preview box
   */
  Preview.prototype.addControls = function () {
      $(`<div class="preview--vr-badge">
        <span>3D</span>
      </div>
      <div class="preview--cta">
        <button class="button cta trigger--show-viewer">
          Open model
        </button>
      </div>`).appendTo(this.$box);
  }

  return Preview;

})(H5P.jQuery);

export default Preview;

const Preview = (function ($) {

  /**
   * Attach preview box to content container
   * @params {jQuery} $container - Content container
   */
  function Preview($container) {
    this.$box = $(
      `<div class="h5p-realitybox--preview">
        <div class="preview--vr-badge">
          <span>3D</span>
        </div>
        <div class="preview--cta">
          <button class="button cta trigger--show-viewer">
            Open model
          </button>
        </div>
      </div>
    `).appendTo($container);
  }

  return Preview;

})(H5P.jQuery);

export default Preview;

const Tooltip = (function ($) {

  /**
   * Constructor function
   * Attach preview box to content container
   * @params {jQuery} $container - Content container
   */
  function Tooltip() {
    this.$el = $(`<div class="h5p-realitybox--tooltip"></div>`);
    this.visible = false;
  }

  /**
   * Shows tooltip that follows the cursor
   * @param {string} content - HTML content that is to be shown in the tooltip
   */
  Tooltip.prototype.show = function (content) {
    this.$el.html(content).appendTo('body');
    this._mousemoveHandler = (event) => {
      this.$el.css({
        left: event.clientX - (this.$el.outerWidth() / 2),
        top: event.clientY - 30
      });
    }
    $('body').on('mousemove', this._mousemoveHandler);
    this.visible = true;
  }

  /**
   * Hides tooltip
   */
  Tooltip.prototype.hide = function () {
    if (!this.visible) {
      return;
    }
    this.$el.detach();
    $('body').off('mousemove', this._mousemoveHandler);
    this.visible = false;
  }

  return Tooltip;

})(H5P.jQuery);

export default Tooltip;

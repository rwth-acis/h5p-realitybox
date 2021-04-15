const Tooltip = (function ($) {

  /**
   * Constructor function
   */
  function Tooltip() {
    this.$el = $(`<div class="h5p-realitybox--tooltip"></div>`);
    this.isVisible = false;
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
    this.isVisible = true;
  }

  /**
   * Hides tooltip
   */
  Tooltip.prototype.hide = function () {
    if (!this.isVisible) {
      return;
    }
    this.$el.detach();
    $('body').off('mousemove', this._mousemoveHandler);
    this.isVisible = false;
  }

  return Tooltip;

})(H5P.jQuery);

export default Tooltip;

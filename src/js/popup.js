const Popup = (function ($) {

  /**
   * Constructor function
   * @param {string} title - Title of popup
   * @param {string} content - HTML content of popup
   * @param {number} maxWidth - maximal width of popup container in px
   */
  function Popup(title, content, maxWidth) {
    this.$el = $(`<div class="viewer--popup">
      <div class="container">
        <div class="header">
          <div class="header--title"></div>
          <div>
            <button class="trigger--popup-close">
              <i class="material-icons">close</i>
            </button>
          </div>
        </div>
        <div class="content">
          Content of the tab
        </div>
      </div>
    </div>`);
    this.$container = this.$el.find('.container');
    if (maxWidth) {
      this.$container.css('max-width', maxWidth + 'px');
    }
    this.$el.find('.trigger--popup-close').click(() => {
      this.close();
    });
    this.$el.find('.header--title').html(title);
    this.$content = this.$el.find('.content').html(content);
  }

  /**
   * Opens the modal
   */
  Popup.prototype.open = function () {
    $('body').append(this.$el);
    this._closeIfOutside = (event) => {
      if (!this.$container.is(event.target) && this.$container.has(event.target).length === 0) {
        this.close();
      }
    }
    $('html').on('click', this._closeIfOutside);
  }

  /**
   * Closes the popup
   */
   Popup.prototype.close = function () {
     console.log('close popup');
     this.$el.detach();
     $('html').off('click', this._closeIfOutside);
   }

  return Popup;

})(H5P.jQuery);

export default Popup;

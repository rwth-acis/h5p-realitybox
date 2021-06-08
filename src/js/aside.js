const Aside = (function ($) {

  /**
   * Constructor function
   * @extends H5P.EventDispatcher
   * @params {jQuery} $container - Container where aside should be placed in
   * @params {jQuery} $content - Content box where the main content is shown on the left side
   * @params {BABYLON.Engine} engine - Engine to resize while show or hide animation
   */
  function Aside($container, $content, engine) {
    H5P.EventDispatcher.call(this);
    this.$el = $(`<aside class="viewer--aside">
      <div class="aside--header">
        <div class="item title aside--title">Untitled</div>
        <div class="item">
          <button class="button trigger--close-aside">
            <i class="material-icons">close</i>
          </button>
        </div>
      </div>
      <div class="aside--content">
        No content available
      </div>
    </aside>`).appendTo($container);
    this._$container = $container;
    this._$content = $content;
    this._engine = engine;
    this.isShown = false;

    this.$el.find('.trigger--close-aside').on('click', () => {
      this.hide();
    });
  }

  // extends H5P.EventDispatcher
  Aside.prototype = Object.create(H5P.EventDispatcher.prototype);
  Aside.prototype.constructor = Aside;

  /**
   * Shows aside
   * @param {string} content - HTML content that is to be shown in the tooltip
   */
  Aside.prototype.show = function () {
    if (this.isShown) {
      return;
    }
    this.isShown = true;
    this._resizeHandler = () => {
      if (!this.isShown) {
        this.$el.css({ right: -1 * this.$el.outerWidth() })
      }
    }
    $(window).on('resize', this._resizeHandler);

    this._animate();
  }

  /**
   * Hides aside
   */
  Aside.prototype.hide = function () {
    if (!this.isShown) {
      return;
    }
    this.isShown = false;

    $(window).off('resize', this._resizeHandler);

    this._animate();
    this.trigger('close');
  }

  /**
   * Slides aside in
   * @private
   */
  Aside.prototype._animate = function () {
    const width = this.$el.outerWidth();
    if (this.isShown) {
      this.$el.addClass('is-shown');
    }
    const positionRight = this.isShown ? 0 : -1 * width;
    this.$el.animate({ right: positionRight }, width, () => {
      if(!this.isShown) {
        this.$el.removeClass('is-shown');
      }
    });
    let paddingRight = 0;
    if (this._$container.outerWidth() - width >= 550 && this.isShown) {
      paddingRight = width;
    }
    this._$content.animate(
      {
        'padding-right': paddingRight
      },
      {
        duration: width,
        step: () => {
          this._engine.resize();
        }
      }
    );
  }

  /**
   * Set title of aside
   * @param {string} title - Title to set
   */
  Aside.prototype.setTitle = function (title) {
    this.$el.find('.aside--title').text(title);
  }

  return Aside;

})(H5P.jQuery);

export default Aside;

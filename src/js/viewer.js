import tippy, { createSingleton, followCursor } from 'tippy.js';
import Aside from './aside.js';
import VRPopup from './vrPopup.js';
import Tooltip from './tooltip.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

/**
 * HEADER_ITEMS object
 * @type {Object}
 * @property {string} HEADER_ITEMS.type - Type of item (button or title)
 * @property {string} HEADER_ITEMS.addClass - CSS classes that should be added to item
 * @property {string} HEADER_ITEMS.tooltip - Text of related tooltip
 * @property {string[]} HEADER_ITEMS.kbd - Associated key board shortcut
 * @property {string} HEADER_ITEMS.content - HTML content of item
 */
const HEADER_ITEMS = [
  {
    type: 'button',
    addClass: 'button icon trigger--close',
    tooltip: 'Close',
    kbd: ['Esc'],
    content: '<i class="material-icons">arrow_back</i>'
  },
  {
    type: 'title',
    content: '<span style="transform:translateY(1px)" id="mainTitle">RealityBox</span>'
  },
  {
    type: 'button',
    addClass: 'button icon trigger--toggle-rotation',
    tooltip: 'Toggle rotation',
    kbd: ['Space'],
    content: '<i class="material-icons">pause</i>'
  },
  /*
  Button for switch in quiz mode
  {
    type: 'button',
    addClass: 'switch',
    tooltip: 'Switch to QUIZ MODE',
    kbd: ['Ctrl', 'Z'],
    content: `
      <div class="active"><i class="material-icons">visibility</i></div>
      <div><i class="material-icons">help_outline</i></div>
    `
  }, */
  /*{
    type: 'button',
    addClass: 'button icon',
    tooltip: 'Info',
    kbd: ['Alt', '-'],
    content: '<i class="material-icons">info</i>'
  }*/
]

const VR_BUTTON = {
  type: 'button',
  addClass: 'button dark trigger--vr',
  hide_tooltip: true,
  tooltip: 'Open on VR device',
  kbd: ['Alt', '.'],
  content: '<span class="transform:translate(0.5px)">VR</span>'
};

const Viewer = (function ($) {

    /**
     * Constructor function
     * @param {jQuery} $canvas - Canvas that is used in preview by Babylon.js
     * @param {jQuery} $container - Content container
     * @param {BabylonBox} babylonBox - BabylonBox instance
     * @param {string} id - ID of H5P.RealityBox instance
     * @param {Object} options - The options for this Realitybox instance
     */
    function Viewer($canvas, $container, babylonBox, id, options) {
      this._$canvas = $canvas;
      this.$container = $container;
      this._babylonBox = babylonBox;
      this.options = options;
      this.id = id;
      this.isShown = false;
      this.isAsideShown = false;
      this.activeAnnotation = null;
    }

    /**
     * Show viewer
     */
    Viewer.prototype.show = function () {
      this._append();
      $('body').css('overflow', 'hidden');
      this._$viewerContent = this.$el.find('.viewer--content');
      // append preview canvas to viewer
      this._$viewerContent.append(this._$canvas);
      this.$el.show();
      this._babylonBox.engine.resize();
      this.isShown = true;

      //d4t.startTimer('timeInViewer');
    }

    /**
     * Hide and detach viewer
     */
    Viewer.prototype.close = function () {
      this._babylonBox.exitWebXRExperience();
      this._aside.hide();
      $('body').css('overflow', 'auto');
      // append canvas back to preview
      this.$container.find('.h5p-realitybox--preview').prepend(this._$canvas);
      this._babylonBox.engine.resize();
      this.$el.detach();
      this.isShown = false;

      //d4t.stopTimer('timeInViewer');
      /*d4t.showStarRating(
        'viewer',
        'https://limesurvey.com/abcxyz',
        'https://github.com/rwth-acis/h5p-realitybox'
      );*/
    }

    /**
     * Handles start or pause of auto rotation
     * @private
     * @param {boolean} isActive - True if rotation should started
     */
    Viewer.prototype._setRotation = function (isActive) {
      const $btnIcon = this.$el.find('.trigger--toggle-rotation i.material-icons');
      if (isActive) {
        $btnIcon.text('pause');
        this._babylonBox.camera.startAutoRotation();
        return;
      }
      $btnIcon.text('play_arrow');
      this._babylonBox.camera.pauseAutoRotation();
    }

    /**
     * Append viewer to body
     * @private
     */
    Viewer.prototype._append = function () {
      if (this.$el) {
        this.$el.appendTo('body');
        return;
      }
      this.$el = $(
        `<div class="h5p-realitybox--modal" tabindex="0">
          <div class="viewer">
            <nav class="viewer--header"></nav>
            <div class="viewer--content"></div>
          </div>
        </div>
      `).appendTo('body');

      this._aside = new Aside(
        this.$el.find('.viewer'),
        this.$el.find('.viewer--content'),
        this._babylonBox.engine
      );

      this._aside.on('close', () => {
        if (this.activeAnnotation) {
          this._babylonBox.setAnnotationState('inactive', this.activeAnnotation);
          this.activeAnnotation = null;
        }
      });

      this._createNav(this.options.hideVrButton ? HEADER_ITEMS : [...HEADER_ITEMS, VR_BUTTON]);
      this._initTooltips();
      this._initTrigger();
      this._setRotation(this._babylonBox.camera.autoRotationEnabled);
    }

    /**
     * Creates navigation bar
     * @private
     * @param {Object} - HEADER_ITEMS object
     */
    Viewer.prototype._createNav = function (items) {
      for (const item of items) {
        const outer = $('<div class="item"></div>')
        if (item.type === 'title') {
          outer.addClass('title');
          outer.html(item.content);
        }
        else {
          const inner = $('<' + item.type + ' />', {
            class: item.addClass || [],
            html: item.content,
            appendTo: outer
          });
          if (item.tooltip) {
            if (!item.hide_tooltip) {
              inner.addClass('trigger--tooltip');
            }
            let tooltipContent = '<div>' + item.tooltip + '</div>';
            if (item.kbd && item.kbd.length > 0) {
              tooltipContent += '<div>';
              for (const k of item.kbd) {
                tooltipContent += '<kbd>' + k + '</kbd>';
              }
              tooltipContent += '</div>';
            }
            inner.attr('data-tooltip-content', tooltipContent);
          }
        }
        this.$el.find('.viewer--header').append(outer);
      }
    }

    /**
     * Creates tooltips for navigation bar
     * @private
     */
    Viewer.prototype._initTooltips = function () {
      const infoTooltipProps = {
        allowHTML: true,
        interactive: true,
        theme: 'dark',
        placement: 'bottom',
        content(ref) {
          return $(ref).data('tooltip-content');
        },
        onCreate(instance) {
          $(instance.popper).addClass('tooltip--info');
        },
        zIndex: 10000
      };
      const infoTooltip = tippy('.trigger--tooltip', infoTooltipProps);

      const regex = new RegExp('vrGotIt', 'g');
      const cookieExists =
        document.cookie &&
        decodeURIComponent(document.cookie).match(regex) &&
        decodeURIComponent(document.cookie).match(regex).length > 0;

      if (cookieExists) {
        const vrButton = this.$el.find('.trigger--vr')[0];
        tippy(vrButton, infoTooltipProps);
        return;
      }

      // call-to-action popup for vr button
      const vrTooltip = tippy('.trigger--vr', {
        allowHTML: true,
        interactive: true,
        theme: 'light',
        placement: 'bottom',
        content: `
          <div>
            VR device available?
          </div>
          <div>
            <button class="button got-it trigger--popper-close">
              Got it.
            </button>
          </div>
        `,
        onCreate(instance) {
          const popper = $(instance.popper);
          popper.addClass('tooltip--cta');
          popper.find('.trigger--popper-close').click(() => {
            instance.destroy();
            tippy(instance.reference, infoTooltipProps);
            document.cookie += 'vrGotIt=1;'
          });
        },
        showOnCreate: true,
        hideOnClick: false,
        trigger: 'click'
      });
    }

    /**
     * Creates all event listeners for navigation bar items
     * @private
     */
    Viewer.prototype._initTrigger = function () {

      let btn;
      this.$el.on('keydown', (event) => {
        let btn;
        if (event.which === 27) { // ESC
          btn = '.trigger--close'
        }
        else if (event.which === 32) { // Space
          //btn = '.trigger--toggle-rotation';
        }
        else if (event.altKey && event.which === 190) { // Alt+.
          //btn = '.trigger--vr';
        }
        if (btn) {
          this.$el.find(btn).click();
        }
      });

      // trigger for button events
      this.$el.find('.trigger--close').click(() => {
        this.close();
      });

      this.$el.find('.trigger--toggle-rotation').click(() => {
        this._setRotation(!this._babylonBox.camera.autoRotationEnabled);
      });

      this.$el.find('.trigger--vr').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!this.vrPopup) {
          let uri = window.location.toString();
          if (uri.indexOf('#') > 0) {
            // remove hash in uri
            uri = uri.substring(0, uri.indexOf("#"));
          }
          this.vrPopup = new VRPopup(uri + '#openViewer=' + this.id);

          this.vrPopup.on('start webxr', async ({ data }) => {
            //d4t.set('requestWebXR', 1);

            if (data.showAnnotations) {
              this._babylonBox.showAllAnnotations();
            }
            else {
              this._babylonBox.hideAllAnnotations();
            }
            await this._babylonBox.startWebXRExperience();
          });

        }
        this.vrPopup.popout('vr');
      });

      // trigger for pointer events of BabylonBox

      this._babylonBox.on('annotation pointerover', ({ data }) => {
        this._babylonBox.setAnnotationState('hover', data);
        if (
          typeof(data.content.metadata.title) !== 'undefined' &&
          !this._babylonBox.webXR.inWebXR
        ) {
          if (!this._titleTooltip) {
            this._titleTooltip = new Tooltip();
          }
          this._titleTooltip.show(data.content.metadata.title);
        }
      });

      this._babylonBox.on('annotation pointerout', ({ data }) => {
        if (this.activeAnnotation !== data) {
          this._babylonBox.setAnnotationState('inactive', data);
        }
        if (this._titleTooltip) {
          this._titleTooltip.hide();
        }
      });

      this._babylonBox.on('annotation picked', ({ data }) => {
        if (this._babylonBox.webXR.inWebXR) {
          this.activeAnnotation = null;

          // Commented out to fix a bug, this.activeAnnotation is null
          // Code is not needed by RealityboxCollab anyway

          //this._babylonBox.guiLabel.show(
            //this.activeAnnotation.content.metadata.title
          //);
          return;
        }
        this.activeAnnotation = data;
        this._babylonBox.setAnnotationState('active', this.activeAnnotation);
        this._loadContentInAside();
        this._titleTooltip.hide();
      });
    }

    /**
     * Insert content in aside and call showAside afterwards
     * @private
     */
    Viewer.prototype._loadContentInAside = function () {
      if (typeof(this.activeAnnotation.content) === 'undefined') {
        this._aside.hide();
        return;
      }
      delete this._h5pContent;
      this._h5pContent = H5P.newRunnable(
        this.activeAnnotation.content,
        this.id
      );
      const $contentBox = this._aside.$el.find('.aside--content').empty();
      this._h5pContent.attach($contentBox);
      $.each(this.$el.find('.h5p-column-content'), (i, el) => {
        $(el).height(el.scrollHeight);
      });
      this._aside.setTitle(this.activeAnnotation.content.metadata.title);
      this._aside.show();
    }

    return Viewer;

})(H5P.jQuery);

export default Viewer;

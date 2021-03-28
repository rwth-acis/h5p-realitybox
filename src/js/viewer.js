import tippy, {createSingleton} from 'tippy.js';
import VRPopup from './vrPopup.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

/**
 * HeaderItems object
 * @type {Object}
 * @property {string} headerItems.type - Type of item (button or title)
 * @property {string} headerItems.addClass - CSS classes that should be added to item
 * @property {string} headerItems.tooltip - Text of related tooltip
 * @property {string[]} headerItems.kbd - Associated key board shortcut
 * @property {string} headerItems.content - HTML content of item
 */
const headerItems = [
  {
    type: 'button',
    addClass: 'button icon trigger--close',
    tooltip: 'Close',
    kbd: ['Esc'],
    content: '<i class="material-icons">arrow_back</i>'
  },
  {
    type: 'title',
    content: '<span style="transform:translateY(1px)">Skelett</span>'
  },
  {
    type: 'button',
    addClass: 'button icon',
    tooltip: 'Stop animation',
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
  {
    type: 'button',
    addClass: 'button dark trigger--vr',
    hide_tooltip: true,
    tooltip: 'Open on VR device',
    kbd: ['Ctrl', 'D'],
    content: '<span class="transform:translate(0.5px)">VR</span>'
  },
  {
    type: 'button',
    addClass: 'button icon',
    tooltip: 'Info',
    kbd: ['Ctrl', 'I'],
    content: '<i class="material-icons">info</i>'
  }
]

const Viewer = (function ($) {

    /**
     * Constructor function
     * @param {jQuery} $canvas - Canvas that is used in preview by Babylon.js
     * @param {jQuery} $container - Content container
     * @param {BabylonBox} babylonBox - BabylonBox instance
     */
    function Viewer($canvas, $container, babylonBox, id) {
      this._$canvas = $canvas;
      this.$container = $container;
      this._babylonBox = babylonBox;
      this.id = id;
      this.isShown = false;
    }

    /**
     * Show viewer
     */
    Viewer.prototype.show = function () {
      this._append();
      $('body').css('overflow', 'hidden');
      // append preview canvas to viewer
      this.$el.find('.viewer--content').append(this._$canvas);
      this.$el.show();
      this._babylonBox.engine.resize();
      this.isShown = true;
    }

    /**
     * Hide and detach viewer
     */
    Viewer.prototype.close = function () {
      this._babylonBox.exitWebXRExperience();
      $('body').css('overflow', 'auto');
      // append canvas back to preview
      this.$container.find('.h5p-realitybox--preview').append(this._$canvas);
      this._babylonBox.engine.resize();
      this.$el.detach();
      this.isShown = false;
    }

    /**
     * Append viewer to body
     * @private
     */
    Viewer.prototype._append = function () {
      this.$el = $(
        `<div class="h5p-realitybox--modal">
          <div class="viewer">
            <nav class="viewer--header"></nav>
            <aside class="viewer--aside"></aside>
            <div class="viewer--content"></div>
          </div>
        </div>
      `).appendTo($('body'));
      this._createNav(headerItems);
      this._initTooltips();
      this._initTrigger();
    }

    /**
     * Creates navigation bar
     * @private
     * @param {Object} - headerItems object
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
          return $(ref).attr('data-tooltip-content');
        },
        onCreate(instance) {
          $(instance.popper).addClass('tooltip--info');
        },
        zIndex: 10000
      };
      const infoTooltip = tippy('.trigger--tooltip', infoTooltipProps);

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
      $('.trigger--close').click(() => {
        this.close();
      });
      $('.trigger--vr').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!this.vrPopup) {
          const uri = window.location.toString();
          const clean_uri = (uri.indexOf("#") > 0) ? uri.substring(0, uri.indexOf("#")) : uri;
          this.vrPopup = new VRPopup(clean_uri + '#openViewer=' + this.id);
          this.vrPopup.on('start webxr', async () => {
            console.log('starting vr...');
            await this._babylonBox.startWebXRExperience();
          });
        }
        this.vrPopup.popout('vr');
      });
    }

    return Viewer;

})(H5P.jQuery);

export default Viewer;

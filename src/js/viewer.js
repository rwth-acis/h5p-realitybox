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
     * @param {string} id - ID of H5P.RealityBox instance
     */
    function Viewer($canvas, $container, babylonBox, id) {
      this._$canvas = $canvas;
      this.$container = $container;
      this._babylonBox = babylonBox;
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
    }

    /**
     * Hide and detach viewer
     */
    Viewer.prototype.close = function () {
      this._babylonBox.exitWebXRExperience();
      $('body').css('overflow', 'auto');
      // append canvas back to preview
      this.$container.find('.h5p-realitybox--preview').prepend(this._$canvas);
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
            <div class="viewer--content"></div>
          </div>
        </div>
      `).appendTo('body');

      this._aside = new Aside(this.$el.find('.viewer'), this.$el.find('.viewer--content'), this._babylonBox.engine.resize);

      this._createNav(HEADER_ITEMS);
      this._initTooltips();
      this._initTrigger();
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

      // trigger for button events

      $('.trigger--close').click(() => {
        this.close();
      });

      $('.trigger--vr').click(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!this.vrPopup) {
          let uri = window.location.toString();
          if (uri.indexOf('#') > 0) {
            // remove hash in uri
            uri = uri.substring(0, uri.indexOf("#"));
          }
          this.vrPopup = new VRPopup(uri + '#openViewer=' + this.id);
          this.vrPopup.on('start webxr', async () => {
            console.log('starting vr...');
            await this._babylonBox.startWebXRExperience();
          });
        }
        this.vrPopup.popout('vr');
      });

      // trigger for pointer events of BabylonBox

      this._babylonBox.on('annotation pointerover', ({ data }) => {
        this._babylonBox.setAnnotationState('hover', data);
        if (typeof(data.content.metadata.title) !== 'undefined') {
          if (!this._titleTooltip) {
            this._titleTooltip = new Tooltip();
          }
          this._titleTooltip.show(data.content.metadata.title);
        }
      });

      this._babylonBox.on('annotation pointerout', ({ data }) => {
        this._babylonBox.setAnnotationState('inactive', data);
        if (this._titleTooltip) {
          this._titleTooltip.hide();
        }
      });

      this._babylonBox.on('annotation picked', ({ data }) => {
        this.activeAnnotation = data;
        this._babylonBox.setAnnotationState('active', this.activeAnnotation);
        this._loadContentInAside();
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
      this._aside.show();
    }

    return Viewer;

})(H5P.jQuery);

export default Viewer;

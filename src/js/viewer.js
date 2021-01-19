import tippy, {createSingleton} from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

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
    content: 'VR'
  },
  {
    type: 'button',
    addClass: 'button icon',
    tooltip: 'Info',
    kbd: ['Ctrl', 'I'],
    content: '<i class="material-icons">info</i>'
  }
]

const $ = H5P.jQuery;

export default class {
    constructor($canvas, $container, babylon) {
      this.$canvas = $canvas;
      this.$container = $container;
      this.babylon = babylon;
    }

    show() {
      if (!this.isAppend) {
        this.append();
        this.isAppend = true;
      }
      $('body').css('overflow', 'hidden');
      this.el.find('.viewer--content').append(this.$canvas);
      this.el.show();
      this.babylon.engine.resize();
    }

    close() {
      $('body').css('overflow', 'auto');
      this.$container.find('.h5p-realitybox--preview').append(this.$canvas);
      this.babylon.engine.resize();
      this.el.hide();
    }

    append() {
      const html = `
        <div class="h5p-realitybox--modal">
          <div class="viewer">
            <nav class="viewer--header"></nav>
            <aside class="viewer--aside"></aside>
            <div class="viewer--content"></div>
          </div>
        </div>
      `;
      this.el = $(this.$container.append(html).find('.h5p-realitybox--modal')[0]);
      this.createNav();
      this.initTooltips();
      this.initTrigger();
    }

    createNav() {
      for (const item of headerItems) {
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
        this.el.find('.viewer--header').append(outer);
      }
    }

    initTooltips() {

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

    initTrigger() {
      $('.trigger--close').click(() => {
        this.close();
      })
    }
}

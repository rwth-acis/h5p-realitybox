import Popup from './popup.js';

const VRPopup = (function ($) {

  /**
   * Constructor function
   * @extends H5P.EventDispatcher
   * @param {string} url - URL of the viewer
   */
  function VRPopup(url) {
    H5P.EventDispatcher.call(this);
    this._url = url;
    const html =`<div class="vr-popup--content">
        <div class="tabs">
          <button class="tab show-tab-mobile">Mobile device</button>
          <button class="tab show-tab-vr">VR headset</button>
        </div>
        <div class="inner-content">
          <div class="tab-mobile">
            Open the viewer on your mobile device with help of the following URL.
            <div class="kewar"></div>
            <div>${this._url}</div>
          </div>
          <div class="tab-vr">
            <button class="trigger--start-webxr">Start VR Experience</button>
          </div>
        </div>
    </div>`;
    this.popup = new Popup('Show in VR', html, 500);
    this.$content = this.popup.$content;
    this._kewar = H5P.newRunnable({
      library: 'H5P.KewArCode 0.2',
      params: {
        codeType: 'url',
        url: this._url,
        behaviour: {
          maxSize: '150px'
        }
      }
    }, this.id, undefined, undefined, {parent: this});
    this._kewar.attach(this.$content.find('.kewar'));

    this.$content.find('.trigger--start-webxr').click(() => {
      console.log('start webxr this.trigger');
      this.trigger('start webxr');
    });

    this.tabs = ['mobile', 'vr'];
    this._initTabs();
    this._showTab('mobile');
  }

  // extends H5P.EventDispatcher
  VRPopup.prototype = Object.create(H5P.EventDispatcher.prototype);
  VRPopup.prototype.constructor = VRPopup;

  /**
   * Opens the VR popup
   */
  VRPopup.prototype.popout = function (tab) {
    const tabToShow = tab || this.tabs[0];
    this._showTab(tabToShow);
    this.popup.open();
  }

  /**
   * Closes the VR popup
   */
   VRPopup.prototype.hide = function () {
     this.popup.close();
     this.trigger('close');
   }

   VRPopup.prototype._initTabs = function () {
     for (const tab of this.tabs) {
       this.$content.find('.show-tab-' + tab).click(() => {
         this._showTab(tab);
       });
     }
   }

   /**
    * Activate specific tab
    * @private
    * @param {string} activeTab - Name of tab to activate
    */
   VRPopup.prototype._showTab = function (activeTab) {
     console.log('Show tab: ' + activeTab);
     for (const tab of this.tabs) {
       this.$content.find('.show-tab-' + tab).removeClass('active');
       this.$content.find('.tab-' + tab).hide();
     }
     this.$content.find('.show-tab-' + activeTab).addClass('active');
     this.$content.find('.tab-' + activeTab).show();
   }

  return VRPopup;

})(H5P.jQuery);

export default VRPopup;

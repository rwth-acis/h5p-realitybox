import Preview from './preview.js';
import Viewer from './viewer.js';

H5P.RealityBox = (function ($) {

  /**
   * Constructor function
   * @param {Object} options - Config object for RealityBox
   * @param {string} id - ID of RealityBox instance
   */
  function RealityBox(options, id) {
    // Extend defaults with provided options
    this.options = $.extend(true, {}, {
      annotations: [
        // example annotation
        {
          "position": {
            "x": -1.0482898860948549,
            "y": 0,
            "z": -0.8716415454633013
          },
          "normalRef": {
            "x": 0,
            "y": 1,
            "z": 0
          },
          "content": {
            "library": "H5P.Column 1.13",
            "params": {
              "content": [
                {
                  "content": {
                    "params": {
                      "text": "<p>Blender???</p>\n"
                    },
                    "library": "H5P.AdvancedText 1.1",
                    "metadata": {
                      "contentType": "Text",
                      "license": "U",
                      "title": "Untitled Text",
                      "authors": [],
                      "changes": []
                    },
                    "subContentId": "37562dae-d032-4af3-89dc-2662e11ffd25"
                  },
                  "useSeparator": "auto"
                }
              ]
            },
            "subContentId": "8a887435-a7cf-47c0-b91b-2028d94be53d",
            "metadata": {
              "contentType": "Column",
              "license": "U",
              "title": "Suzanne",
              "authors": [],
              "changes": [],
              "extraTitle": "Suzanne"
            }
          },
          "id": "5894a580-ce7d-476c-bbe4-9e50496e3b42"
        }
      ]
    }, options.realitybox);
    // Keep provided id
    this.id = id;
    console.log(this.options);
  }

  /**
   * Attach function called by H5P framework to insert H5P content into page
   * @param {jQuery} $container
   */
  RealityBox.prototype.attach = function ($container) {
      $container.addClass('h5p-realitybox');
      const preview = new Preview($container);
      $container.append(`<div class="welcome">This is the model viewer.</div>`)

      let modelUrl = H5P.getPath(this.options.model.path, this.id);
      let params = $.extend(
        {},
        { modelUrl },
        { annotations: this.options.annotations }
      );
      console.log(params);
      const babylonBox = H5P.newRunnable({
        library: 'H5P.BabylonBox 1.0',
        params
      }, this.id, undefined, undefined, {parent: this});
      babylonBox.attach(preview.$box);

      this._viewer = new Viewer(
        babylonBox.$canvas,
        $container,
        babylonBox,
        this.id
      );

      babylonBox.on('ready', () => {
        preview.addControls();
        $container.find('.trigger--show-viewer').click(() => {
          this._viewer.show();
        });
      });

      this._checkHash();
      window.onhashchange = this._checkHash;
  }

  /**
   * Checks whether viewer should shown directly
   * @private
   */
  RealityBox.prototype._checkHash = function () {
    if (location.hash === '#openViewer=' + this.id) {
      console.log("hash opens viewer");
      this._viewer.show();
    }
  }

  return RealityBox;

})(H5P.jQuery);

export default H5P.RealityBox;

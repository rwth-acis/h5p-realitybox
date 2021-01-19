import Preview from './preview.js';
import Viewer from './viewer.js';

import '../css/material-icons/material-icons.css';

const $ = H5P.jQuery;

H5P.RealityBox = class {

  /**
   * Constructor function
   */
  constructor(options, id) {
    console.log(options);
    console.log(H5P.getPath(options.realitybox.model.path, id))
    // Extend defaults with provided options
    this.options = $.extend(true, {}, {
      welcomeText: 'N/A'
    }, options);
    // Keep provided id
    this.id = id;
  }

  /**
   * Attach function called by H5P framework to insert H5P content into page
   * @param {jQuery} $container
   */
  attach($container) {
    $container.addClass('h5p-realitybox');
    const preview = new Preview($container);
    $container.append(`<div class="welcome">${this.options.welcomeText}</div>`)
    const canvas = $container.find('.h5p-realitybox--preview .renderCanvas')[0];
    const $canvas = $(canvas);
    const babylon = H5P.newRunnable({
      library: 'H5P.BabylonBox 1.0',
      params: {}
    }, this.id, undefined, undefined, {parent: this});
    babylon.init(canvas);
    const viewer = new Viewer($canvas, $container, babylon);
    $container.find('.trigger--show-viewer').click(() => {
      viewer.show();
    });
    $canvas.dblclick(() => {
      const picked = babylon.scene.pick(babylon.scene.pointerX, babylon.scene.pointerY);
      if (picked && picked.pickedMesh && picked.pickedMesh.isPickable && picked.pickedMesh.id === 'box') {
        const marker = {
          id: babylon.markers.length,
          picked: {
            ref: [picked.pickedPoint.x, picked.pickedPoint.y, picked.pickedPoint.z],
            refNormal: [picked.getNormal(true, true).x, picked.getNormal(true, true).y, picked.getNormal(true, true).z]
          }
        }
        babylon.markers.create(marker);
      }
    })
  }

}

export default H5P.RealityBox;

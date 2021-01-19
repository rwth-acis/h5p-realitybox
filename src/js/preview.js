const $ = H5P.jQuery;

export default class {

  constructor($container) {
    this.$container = $container;
    this.append();
  }

  append() {
    const html = `
      <div class="h5p-realitybox--preview">
        <div class="preview--vr-badge">
          <span>3D</span>
        </div>
        <div class="preview--cta">
          <button class="button cta trigger--show-viewer">
            Open model
          </button>
        </div>
        <canvas class="renderCanvas"></canvas>
      </div>
    `
    this.$container.append(html);
  }

}

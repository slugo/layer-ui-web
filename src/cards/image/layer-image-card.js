/**
 *
 * @class layerUI.handlers.message.CardView
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';
import { settings as UISettings } from '../../base';
import CardMixin from '../card-mixin';
import CardPrimitiveMixin from '../card-primitive-mixin';

import ImageManager from 'blueimp-load-image/js/load-image';
import 'blueimp-load-image/js/load-image-orientation';
import 'blueimp-load-image/js/load-image-meta';
import 'blueimp-load-image/js/load-image-exif';

registerComponent('layer-image-card', {
  mixins: [CardMixin, CardPrimitiveMixin],
  style: `layer-image-card {
      display: block;
      overflow: hidden;
    }
    layer-image-card img {
      display: block;
    }
    layer-card-view.layer-image-card > * {
      cursor: pointer;
    }
 `,
  properties: {
    parentComponent: {
      set() {
        this.onRerender();
      },
    },
    widthType: {
      get() {
        return this.parentComponent.isShowingMetadata ? 'flex-card' : 'chat-bubble';
      },
    },
    maxHeight: {
      value: 300,
    },
  },
  methods: {
    onCreate() {
      this.isHeightAllocated = false;
    },

    onAttach: {
      mode: registerComponent.MODES.AFTER,
      value() {
        this.onRerender();
      },
    },

    /**
     * Render the Message.
     *
     * Primarily, this method determines whether to call _renderCanvas on the preview or the image.
     *
     * @method
     * @private
     */
    onRerender() {
      // wait until the parentComponent is a Card Container
      if (!this.properties._internalState.onAttachCalled) return;
      const maxCardWidth = this._getMaxCardWidth();

      // maxSizes should be removed
      const width = this.model.previewWidth || this.model.width || maxCardWidth;
      const height = this.model.previewHeight || this.model.height || this.maxHeight;

      const isSmallImage = width < maxCardWidth;
      const isSmallAndWideImage = isSmallImage && maxCardWidth > height;
      this.toggleClass('layer-image-card-small-image', isSmallImage && !isSmallAndWideImage);

      if (this.model.source || this.model.preview) {
        this.model.getBlob(blob => this._renderCanvas(blob, maxCardWidth));
      } else {
        while (this.firstChild) this.removeChild(this.firstChild);
        const img = this.createElement('img', {
          classList: isSmallImage ? [] : ['layer-top-content-for-border-radius'],
          parentNode: this,
        });
        img.addEventListener('load', evt => (this.isHeightAllocated = true));
        img.src = this.model.previewUrl || this.model.sourceUrl;
        img.style.maxWidth = maxCardWidth + 'px';
        img.style.maxHeight = this.maxHeight + 'px';
      }
    },

    _getMaxCardWidth() {
      if (this.cardView.classList.contains('layer-root-card')) {
        const parent = this.cardView.parentNode;
        if (!parent || !parent.clientWidth) return 0;
        let width = parent.clientWidth;
        if (width > 600) width = width * 0.6;
        else width = width * 0.8;
        return width;
      } else {
        return this.cardView.parentNode.clientWidth;
      }
    },


    /**
     * Rendering Rules:
     *
     * * Images whose height is less than width and width is less than 192px are scaled to 192px
     * * Images whose height is greater than width and width is less than 192px are scaled to height 192px?
     * * Images whose width and height are equal, and less than 192px should be scaled up to 192px
     * * Images between 192-350 are sized as-is
     * * However, if there is metadata, scale images up to 350px
     *
     * @param {*} blob
     */
    _renderCanvas(blob, maxCardWidth) {
      let width = this.model.previewWidth || this.model.width || maxCardWidth;
      let height = this.model.previewHeight || this.model.height || this.maxHeight;
      const minWidth = this.parentComponent.getPreferredMinWidth();
      const minHeight = this.parentComponent.getPreferredMinHeight();
      const maxHeight = this.parentComponent.getPreferredMaxHeight();

      // Read the EXIF data
      ImageManager.parseMetaData(
        blob, (data) => {
          const options = {
            canvas: true,
            orientation: this.model.orientation,
          };

          if (data.imageHead && data.exif) {
            options.orientation = data.exif.get('Orientation') || 1;
          }
          options.maxWidth = maxCardWidth;
          options.maxHeight = maxHeight;

          // Write the image to a canvas with the specified orientation
          ImageManager(blob, (canvas) => {
            if (canvas instanceof HTMLElement) {
              if (width < minWidth && height < minHeight) {
                if (width > height) {
                  canvas = ImageManager.scale(canvas, { minWidth });
                } else {
                  canvas = ImageManager.scale(canvas, { minHeight });
                }
              }

              while (this.firstChild) this.removeChild(this.firstChild);
              this.appendChild(canvas);
              if (canvas.width >= minWidth) this.parentComponent.style.width = canvas.width + 'px';
              this.isHeightAllocated = true;
            } else {
              console.error(canvas);
            }
          }, options);
        },
      );
    },

    handleContainerEvent(name, evt) {
      switch (name) {
        case 'click':
        case 'tap':
          this.model.getBestQualityUrl(url => window.open(url));
          break;
      }
    },
  },
});

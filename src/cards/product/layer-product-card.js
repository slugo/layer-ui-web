/**
 *
 * @class layerUI.handlers.message.CardView
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';
import CardMixin from '../card-mixin';

registerComponent('layer-product-card', {
  style: `layer-product-card {
    display: block;
  }
  layer-card-view.layer-product-card {
    cursor: pointer;
  }
  layer-product-card.layer-no-image .layer-card-top {
    display: none;
  }
  `,
  template: `
    <div layer-id='UIContainer' class='layer-card-top'>
      <img layer-id="image" />
    </div>
    <div class="layer-card-body-outer">
        <div class="layer-card-product-header">
          <div layer-id="brand" class="layer-card-product-brand"></div>
          <div layer-id="model" class="layer-card-product-model"></div>
        </div>
        <div layer-id="name" class="layer-card-product-name"></div>

        <div layer-id="price" class="layer-card-product-price"></div>
        <div layer-id="choices" class="layer-card-product-choices"></div>
        <div layer-id="description" class="layer-card-product-description"></div>
    </div>
  `,
  mixins: [CardMixin],
  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    widthType: {
      value: 'full-card',
    },
    preferredMaxWidth: {
      value: 500,
    },
  },
  methods: {
    onCreate() {
      this.isHeightAllocated = false;
    },
    onRerender() {
      this.nodes.name.innerHTML = this.model.name;
      this.nodes.brand.innerHTML = this.model.brand;
      this.nodes.price.innerHTML = this.model.getFormattedPrice();
      this.nodes.description.innerHTML = this.model.description;

      this.nodes.image.src = this.model.imageUrls[0];
      this.nodes.image.addEventListener('load', evt => (this.isHeightAllocated = true));

      this.toggleClass('layer-no-image', this.model.imageUrls.length === 0);
      this.isHeightAllocated = this.model.imageUrls.length === 0;

      const optionsParent = this.nodes.choices;

      if (!optionsParent.firstChild) {
        this.model.options.forEach((optionsModel) => {
          optionsModel.action = { event: this.model.actionEvent, data: this.model.data || { url: this.model.url } };
          this.createElement('layer-card-view', {
            message: this.model.message,
            rootPart: optionsModel.part,
            model: optionsModel,
            //cardContainerTagName: false,
            cardBorderStyle: 'none',
            parentNode: this.nodes.choices,
          });
        });
      }
      /*
      if (this.model.detailModel) {
        this.createElement('layer-card-view', {
          message: this.model.message,
          rootPart: this.model.detailModel.part,
          model: this.model.detailModel,
          //cardContainerTagName: false,
          cardBorderStyle: 'none',
          parentNode: this,
        });
      }*/
    },

    /**
     *
     * @method
     */
    onRender() {

    },
  },
});

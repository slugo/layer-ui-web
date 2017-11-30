/*
  var imgBase64 = "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAECElEQVR4Xu2ZO44TURREa0SAWBASKST8xCdDQMAq+OyAzw4ISfmLDBASISERi2ADEICEWrKlkYWny6+77fuqalJfz0zVOXNfv/ER8mXdwJF1+oRHBDCXIAJEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8waWjX8OwHcAv5f9Me3fPRugvbuxd14C8B7AVwA3q0oQAcYwtr2+hn969faPVSWIAG2AT3rXJvz17CcAN6ptgggwrwDb4JeVIALMJ8AY/JISRIB5BGDhr3/aZwDXKxwHEWC6AJcBvAOwfuBjvuNfABcBfGGGl5yJANPabYV/B8DLaT96nndHgPYeu4c/RI8AbQJIwO9FgDMAfrVxWuRdMvB7EOA+gHsALgD4uQjO3b6pFPzqAjwA8HTF5weA8weWQA5+ZQGOw1//jR5SAkn4VQV4CODJls18CAmuAHjbcM8vc9U76ZSrdgt4BODxyLG8Twla4P8BcLfKPX/sEaeSAAz8fR4H8vArHQHXAHwYs3Xj9SU3gQX8SgKcAvBitTp38WAJCWzgVxJg+F0qSGAFv5oAh5bADn5FAQ4lwVUAb3a86nX1tL/tXK10Czj+O+7zOLCFX3UDrEXYhwTW8KsLsPRx0Ap/+A/fq12uKpVnqx4BSx8Hgb9quAcB5t4EgX/sz6sXAeaSIPA3zqOeBJgqwTMAzxuuelJn/ubzSG8CTJFg12ex4Z4vDb+HW8A2aK1XRFYCC/g9C7DkJrCB37sAS0hgBV9BgDklGODfBvCaPScU5np8CPxf71OfCSzhq2yAqZ8d2MJXE6DlOLCGryjALhLYw1cVgJEg8Dv7MKjlgXvbg2Hgd/ph0BwSBH7nHwZNkeCW4z1/rDCV/wOM5RyOg7MAvo0Nur3uIoAbVzpvBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hz8BzIXtYE3VcPnAAAAAElFTkSuQmCC";

  FileModel = layer.Client.getCardModelClass('FileModel');

  new FileModel({
    source: layer.Util.base64ToBlob(imgBase64, 'image/png'),
    mimeType: 'image/png',
    author: 'PNG Generator',
    size: layer.Util.base64ToBlob(imgBase64, 'image/png').size,
    title: 'This is a file.png',
    fileExt: 'png'
  }).generateMessage($("layer-conversation-view").conversation, message => message.send())

  new FileModel({
    source: layer.Util.base64ToBlob(imgBase64, 'image/png'),
    mimeType: 'image/png',
    author: 'PNG Generator',
    size: layer.Util.base64ToBlob(imgBase64, 'image/png').size,
    title: 'This is a file with a longish title that you won\'t be bothered to read just yet if ever',
    fileExt: 'png'
  }).generateMessage($("layer-conversation-view").conversation, message => message.send())

  new FileModel({
    sourceUrl: "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
    mimeType: "image/png",
    title: "This is a logo for someone in silicon valley"
  }).generateMessage($("layer-conversation-view").conversation, message => message.send())

  new FileModel({
    sourceUrl: "",
    mimeType: "image/png",
    title:  'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.  And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.'
  }).generateMessage($("layer-conversation-view").conversation, message => message.send())
* @class layerUI.cards.FileModel
* @extends layer.model
*/


import { Client, MessagePart, CardModel } from '@layerhq/layer-websdk';


class FileModel extends CardModel {
  _generateParts(callback) {
    const source = this.source;
    let sourcePart;

    if (source) {
      if (!this.title) this.title = source.name;
      if (!this.size) this.size = source.size;
      if (!this.mimeType) this.mimeType = source.type;
      this.size = source.size;
    }

    if (!this.fileExt && this.title) this.fileExt = this.title.replace(/^.*\.(.*)$/, '$1');
    const body = this._initBodyWithMetadata(['sourceUrl', 'author', 'size', 'title', 'mimeType']);
    this.part = new MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });

    if (source) {
      sourcePart = new MessagePart(this.source);
      sourcePart.mimeAttributes.role = 'source';
      sourcePart.mimeAttributes['parent-node-id'] = this.part.getNodeId();
    }

    callback(this.source ? [this.part, sourcePart] : [this.part]);
  }

  _parseMessage(payload) {
    super._parseMessage(payload);

    // setup this.source and any other roles that should be saved as properties
    this.childParts.forEach(part => (this[part.mimeAttributes.role] = part));

    if (!this.mimeType && this.source) this.mimeType = this.source.mimeType;

    if (!this.fileExt) {
      if (this.sourceUrl) {
        this.fileExt = this.sourceUrl.replace(/^.*\.(.*)$/, '$1');
      } else if (this.title.match(/\.\w{2,4}$/)) {
        this.fileExt = this.title.replace(/^.*\./, '');
      } else if (this.source && this.source.url.indexOf('.') !== -1) {
        this.fileExt = this.source.url.replace(/^.*\.(.*)$/, '$1');
      } else if (this.source) {
        this.fileExt = this.source.mimeType.replace(/^.*\./, '').substr(0, 3);
      }
    }

  }

  fetchSourceUrl(callback) {
    if (this.sourceUrl) callback(this.sourceUrl);
    else {
      this.source.fetchStream(url => callback(url));
    }
  }

  __getSourceUrl() {
    if (this.__sourceUrl) return this.__sourceUrl;
    if (this.source) {
      if (this.source.url) {
        return this.source.url;
      }
    }
  }

  __getTitle() {
    if (this.__title) return this.__title;
    if (this.source && this.source.mimeAttributes.name) return this.source.mimeAttributes.name;
    if (this.__sourceUrl) return this._sourceUrl.replace(/.*\/(.*)$/, '$1');
  }

  getTitle() { return this.title.replace(/\..{2,5}$/, ''); }
  getDescription() { return this.author; }
  getFooter() { return (Math.floor(this.size / 1000)).toLocaleString() + 'K'; }
}

FileModel.prototype.source = null;
FileModel.prototype.sourceUrl = '';
FileModel.prototype.author = '';
FileModel.prototype.title = '';
FileModel.prototype.size = '';
FileModel.prototype.fileExt = '';
FileModel.prototype.mimeType = '';

FileModel.Label = 'File';
FileModel.defaultAction = 'open-file';
FileModel.cardRenderer = 'layer-file-card';
FileModel.MIMEType = 'application/vnd.layer.card.file+json';
MessagePart.TextualMimeTypes.push(FileModel.MIMEType);

// Register the Card Model Class with the Client
Client.registerCardModelClass(FileModel, 'FileModel');

module.exports = FileModel;



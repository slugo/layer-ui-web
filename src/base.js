/**
 * @class layerUI
 * @static
 *
 * The layerUI contains utilities for working with the layerUI components.
 *
 * The key method to know here is the `init()` method.  Any use of the library will need a call:
 *
 * ```
 * layerUI.init({
 *   appId: 'layer:///apps/staging/my-app-id'
 * });
 * ```
 *
 * Or
 *
 * layerUI.init({
 *   appId: 'layer:///apps/staging/my-app-id'
 * });
 * ```
 *
 * See layerUI.settings for more options to layerUI.init.
 *
 * One other property deserving special mention: layerUI.adapters.  Adapters help you to use these widgets within other UI frameworks.
 * It is not required to use an adapter, but it solves many inconsistencies in how these frameworks handle webcomponents built using this framework.
 *
 * While there are many other methods defined here, for new projects ignore everything except layerUI.settings, layerUI.init and layerUI.adapters.
 */
import Layer from 'layer-websdk';

/*
 * NOTES TO MAINTAINER:
 *
 * * Avoid using `this`, rather use `layerUI` instead.  Otherwise usage such as:
 *   `import { registerMessage} from 'layer-ui-web'` will give developers a method that
 *   needs scope but won't have it.
 */
const layerUI = {};

/**
 * The settings object stores a hash of configurable properties to change widget Behaviors.
 *
 * The settings object is typically set using layerUI.init().
 *
 * Below are the available settings and their defintions.
 *
 * @property {Object} settings
 *
 * @property {String} [settings.appId]      The app ID to use for all webcomponents.
 *    Setting this is a short-hand for using the `app-id` property on each widget;
 *    you can leave out `app-id` if using this setting.
 *
 * @property {Number} [settings.messageGroupTimeSpan=30,0000]   Messages are grouped based on sender,
 *    as well as time between when Messages are sent
 *    How much time must pass before messages are no longer in the same group? Measured in miliseconds.
 *
 * @property {Boolean} [settings.disableTabAsWhiteSpace=false]   By default hitting TAB in the Composer adds space.
 *    Disable this for tab to go to next component.
 *
 * @property {Number} [settings.markReadDelay=2500]    Delay before marking a Message as read.
 *    This property configures the number of miliseconds to wait after a message becomes visible
 *    before its marked as read.  A value too small means it was visible but the user may not
 *    have actually had time to read it as it scrolls quickly past.
 *
 *    The above code will prevent the `layer-avatar` widget
 *    from being initialized, and allow you to provide your own definition for this html tag.  Your definition
 *    must be registered using the WebComponents `document.registerElement` call.  Call `registerElement` after loading layerUI
 *    because layerUI contains the WebComponents polyfills.
 *
 * @property {Object} [settings.defaultHandler]    The default message renderer for messages not matching any other handler
 * @property {String[]} [settings.textHandlers=['autolinker', 'emoji', 'images', 'newline', 'youtube']] Specify which text handlers you want
 *    Note that any custom handlers you add do not need to be in the settings, they can be called after calling `init()` using layerUI.registerTextHandler.
 * @property {Object} [settings.maxSizes]  The maximum width/height for image and video previews
 * @property {Object} [settings.verticalMessagePadding=0]  Message handlers that must hard code a height into their dom nodes can be
 *     hard to add borders and padding around.  Use this property to offset any hardcoded height by this number of pixels
 */
layerUI.settings = {
  appId: '',
  messageGroupTimeSpan: 1000 * 60 * 30,
  disableTabAsWhiteSpace: false,
  markReadDelay: 2500,
  defaultHandler: {
    tagName: 'layer-message-unknown',
  },
  textHandlers: ['autolinker', 'emoji', 'images', 'newline', 'youtube'],
  maxSizes: { width: 512, height: 512 },
  verticalMessagePadding: 0,
};

/**
 * Array of message handlers.  See layerUI.registerMessageHandler.
 *
 * @property {Object[]} handlers
 * @private
 */
layerUI.handlers = [];

/**
 * Hash of Text Handlers.  See layerUI.registerTextHandler.
 *
 * @property {Object} handlers
 * @private
 */
layerUI.textHandlers = {};


/**
 * Hash of components defined using layerUI.components.Component.
 *
 * @property {Object} components
 * @private
 */
layerUI.components = {};

/**
 * Any utilities that need global access will be added here.
 *
 * Utils object has no built-in properties, but rather components in the utils
 * folder will register their utilities here to simplify access to CDN users.
 *
 * @property {Object} utils
 */
layerUI.utils = {};


/**
 * Utility for getting a node for use in List Item `customNodeAbove` and `customNodeBelow`
 *
 * ```
 * if (!listItem.customNodeAbove) {
 *    var node = layerUI.createItemSeparator();
 *    node.appendChild(newSeparatorContent);
 *    listItem.customNodeAbove = node;
 * }
 * ```
 * @method createItemSeparator
 * @returns HTMLElement
 */
layerUI.createItemSeparator = () => {
  const node = document.createElement('div');
  node.classList.add(layerUI.itemSeparatorParentClassName);
  return node;
};

/**
 * Class to use with layerUI.createItemSeparator() created ndoes
 *
 * @property {String} [itemSeparatorParentClassName=layer-list-item-separator-parent]
 */
layerUI.itemSeparatorParentClassName = 'layer-list-item-separator-parent';

/**
 * Adds a separator between list items.
 *
 * While one can directly assign a node to `listItem.customNodeAbove`, there may be many processes that run
 * and which consider adding content between two list items. To do this, there should be a parent container,
 * as well as the ability to find this content and remove it from that parent container.
 *
 * ```
 * layerUI.addListItemSeparator(messageListItem, 'You have read up to here', 'layer-item-separator-read-indicator', true);
 * ```
 *
 * Or
 *
 * ```
 * var node = document.createElement('div');
 * node.innerHTML = 'You have read up to here';
 * layerUI.addListItemSeparator(messageListItem, node, 'layer-item-separator-read-indicator', true);
 * ```
 *
 * Both of these calls will result in `messageListItem.customNodeAbove` looking like:
 *
 * ```
 * <div class='layer-list-item-separator-parent'>
 *     <div class='layer-item-separator-read-indicator'>
 *         You have read up to here
 *     </div>
 * </div>
 * ```
 *
 * @method addListItemSeparator
 * @param {layerUI.mixins.ListItem} listItem    The List Item that the separator is associated with
 * @param {String/HTMLElement} content          The content to put in the separator
 * @param {String} contentClass                 Create a div with this class to put the content into; this allows us to see
 *                                               if there is already a node of that class.
 * @param {Boolean} isAboveItem                 If true, `listItem.customNodeAbove` is used, else `listItem.customNodeBelow`
 */
layerUI.addListItemSeparator = function addListItemSeparator(listItemNode, content, contentClass, isAboveItem) {
  const nodeName = isAboveItem ? 'customNodeAbove' : 'customNodeBelow';
  let node;

  if (content) {
    node = document.createElement('div');
    node.classList.add(contentClass);
  }

  if (content) {
    if (typeof content === 'string') {
      node.innerHTML = content;
    } else {
      node.appendChild(content);
    }
  }

  // If there is already a layer-list-item-separator-parent, then we just need to make sure it has this content
  if (listItemNode[nodeName] && node) {
    // If it looks like the content already exists, replace it
    const existingContent = listItemNode[nodeName].querySelector('.' + contentClass);
    if (existingContent) {
      existingContent.parentNode.replaceChild(node, existingContent);
    } else {
      listItemNode[nodeName].appendChild(node);
    }
  } else if (!listItemNode[nodeName] && node) {
    // Create a parent node and then add this to it
    const parent = layerUI.createItemSeparator();
    parent.appendChild(node);
    listItemNode[nodeName] = parent;
  } else if (listItemNode[nodeName] && !node) {
    const existingContent = listItemNode[nodeName].querySelector('.' + contentClass);
    if (existingContent) {
      existingContent.parentNode.removeChild(existingContent);
    }
  }
};

/**
 * A library of adapters for working with various Javascript frameworks.
 *
 * The following adapters are provided built-in:
 *
 * * layerUI.adapters.react
 * * layerUI.adapters.angular (Angular 1.x; does not handle Angular 2.x)
 * * layerUI.adapters.backbone
 *
 * @property {Object} adapters
 */
const adapterError = 'You must call layerUI.init() before you can use an adapter';
layerUI.adapters = {
  angular: () => {
    throw new Error(adapterError);
  },
  backbone: () => {
    throw new Error(adapterError);
  },
  react: () => {
    throw new Error(adapterError);
  },
};

/**
 * Provide a handler for a message containing a specific set of mimeTypes.
 *
 * Your testFunction will return true if it handles the input message.
 * Handlers are evaluated in the order they are registered, so if you have
 * multiple handlers that handle a specific combination of parts, put the default
 * one first.  Handlers can be reordered by directly accessing and manipulating the layerUI.handlers array.
 *
 * ```
 * layerUI.registerMessageHandler({
 *     tagName: 'text-image-location-part',
 *     label: 'Map',
 *     handlesMessage: function(message, container) {
 *       return (message.parts.length === 3 && message.parts[0].mimeType.match(/image\/jpeg/ && message.parts[1].mimeType === 'text/plain' && message.parts[2].mimeType === 'location/json');
 *    }
 * });
 * ```
 *
 * This example will create a `<text-image-locaton-part />` dom node to process any message with 3 parts:
 * an image/jpeg, text/plain and location/json parts.  Note that its up to your application to define a webcomponent for `text-image-location-part`
 * which receives the Message using its `item` property.
 *
 * Note that you can use the `container` argument to prevent some types of content from rendering as a Last Message within a Conversation List,
 * or use it so some MessageLists render things differently from others.
 *
 * @method registerMessageHandler
 * @static
 * @param {Object} options
 * @param {Function} options.handlesMessage
 * @param {layer.Message} options.handlesMessage.message    Message to test and handle with our handler if it matches
 * @param {HTMLElement} options.handlesMessage.container     The container that this will be rendered within; typically identifies a specific
 *                                                          layerUI.MessageList or layerUI.ConversationItem.
 * @param {Boolean} options.handlesMessage.returns          Return true to signal that this handler accepts this Message.
 * @param {String} options.tagName                          Dom node to create if this handler accepts the Message.
 * @param {String} options.label                            Label to show when we can't render the whole message.
 *                                                          Typically identifies the type of content to the user.
 * @param {Number} [options.order=0]                        Some handlers may need to be tested before other handlers to control which one gets
 *                                                          selected; Defaults to order=0, this handler is first
 */
layerUI.registerMessageHandler = function registerMessageHandler(options) {
  if (!options.order) options.order = 0;
  let pushed = false;
  for (let i = 0; i < layerUI.handlers.length; i++) {
    if (options.order <= layerUI.handlers[i].order) {
      layerUI.handlers.splice(i, 0, options);
      pushed = true;
      break;
    }
  }
  if (!pushed) layerUI.handlers.push(options);
};

/**
 * Return the handler object needed to render this Message.
 *
 * This function calls the `handlesMessage` call for each handler registered via layerUI.registerMessageHandler and
 * returns the first handler that says it will handle this Message.
 *
 * @method getHandler
 * @static
 * @param {layer.Message} message
 * @param {HTMLElement} container     The container that this will be rendered within
 * @return {Object} handler     See layerUI.registerMessageHandler for the structure of a handler.
 */
layerUI.getHandler = (message, container) => {
  const handlers =
    layerUI.handlers.filter(handler => handler.handlesMessage(message, container));
  return handlers[0] || layerUI.settings.defaultHandler;
};

/**
 * Provide a text processor for a `text/plain` message.
 *
 * There is a lot of preprocessing of text that may need to be done before rendering text:
 *
 * * Replacing `\n` with `<br/>`
 * * Turning emoticons symbols into images
 * * Replacing image URLs with image tags
 * * Adding HTML formatting around quoted text
 * * Replacing youtube links with youtube videos
 * * Make up your own...
 *
 * You can enable a predefined Text Handler with:
 *
 * ```
 * layerUI.registerTextHandler({
 *    name: 'emoji'
 * });
 * ```
 *
 * You can define your own handler (defaults to enabled) with:
 *
 * ```
 * layerUI.registerTextHandler({
 *    name: 'youtube',
 *    order: 200,
 *    handler: function(textData, message) {
 *       textData.text = textData.text.replace(/https:\/\/(www\.)?(youtu\.be|youtube\.com)\/(watch\?.*v=)?([a-zA-Z0-9\-]+)/g, function(ignore1, ignore2, ignore3, ignore4, videoId) {
 *       return '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>';
 *   });
 * });
 * ```
 *
 * You can append data after your message using `afterText`:
 *
 * ```
 * layerUI.registerTextHandler({
 *    name: 'youtube',
 *    order: 200,
 *    handler: function(textData, message) {
 *       var matches = textData.text.match(/https:\/\/(www\.)?(youtu\.be|youtube\.com)\/(watch\?.*v=)?([a-zA-Z0-9\-]+)/g);
 *       if (matches[3) {
 *           textData.afterText.push('<iframe width="560" height="315" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>');
 *       }
 *   });
 * });
 * ```
 *
 * @method registerTextHandler
 * @static
 * @param {Object} options
 * @param {String} options.name      A unique name to give your handler
 * @param {Number} options.order     A number used to sort your handler amongst other handlers as order
 *      of execution can matter for any text handler that modifies the text parsed by subsequent parsers.
 * @param {Function} options.handler
 * @param {Object} options.handler.textData
 * @param {String} options.handler.textData.text          Use this to read the current text value and write an update to it
 * @param {String[]} options.handler.textData.afterText   Append elements to this array to add stuff to be rendered below the text.
 *      Anything that goes into `afterText` should NOT be parsed by any text handler.
 * @param {layer.Message} options.handler.message         If your text processor needs access to the original message, this is it, but should be treated as a read-only object in this context.
 * @param {Boolean} [requiresEnable=false]                If provided, this registers the handler but won't use the handler
 *       without a separate call to opt in.  Opt in later using with `layerUI.registerTextHandler({name: handlerName})`
 *       and no handler function.  (For Internal use only)
 * @param {Boolean} options.handler.isMessageListItem     If rendering the results in a MessageList, returns true, else we may be rendering this in a Toast popup, Conversation List Last Message, or elsewhere.  Emojis you may want in all places, but `afterText` will be ignored if its not in a Message List

 */
layerUI.registerTextHandler = function registerTextHandler(options) {
  if (layerUI.textHandlers[options.name]) {
    if (options.handler) {
      Object.keys(options).forEach((optionKey) => {
        layerUI.textHandlers[options.name][optionKey] = options[optionKey];
      });
    } else {
      layerUI.textHandlers[options.name].enabled = true;
    }
  } else {
    options.enabled = !options.handler || !options.requiresEnable;
    if (!('order' in options)) options.order = 100000;
    layerUI.textHandlers[options.name] = options;
  }
};

/**
 * Register your template for use by an existing Component.
 *
 * Assumes that the specified Component has already been defined using layerUI.components.Component.
 *
 * This can be used to associate a template with the Component, or to overwrite the default template
 * with your custom template.
 *
 * Consider this `avatar.html` file:
 *
 * ```
 *
 * <template>
 *    <style>....</style>
 *    <img></img>
 * </template>
 * < script >
 *    // Register the template in this *.html file to be the layer-avatar template.
 *    window.layerUI.registerTemplate('layer-avatar')
 * </script>
 *
 * ```
 *
 * The call to layerUI.registerTemplate will find the template tag in avatar.html, and associate it with `layer-avatar`.
 *
 * NOTE: the above code assumes that `layerUI` has been attached to `window`; accessing `layerUI` from a template file may otherwise pose challenges.
 *
 * One can also register a template that wasn't created in a standalone template file such as `avatar.html`:
 *
 * * One could create a template using `document.createElement('template')`
 * * One could create a template by putting `<template id='my-avatar'>` within your index.html
 *
 * For these cases, you would need to pass a pointer to that template into `registerTemplate`:
 *
 * ```
 * var template = document.createElement('template');
 * template.innerHTML = '<img></img>';
 * layerUI.registerTemplate('layer-avatar', template);
 *
 * // OR
 * layerUI.registerTemplate('layer-avatar', document.getElementById('my-avatar');
 * ```
 *
 * Note that any styles you write for your template will require the tag-name to be a part of your CSS rules.
 * For those familiar with Shadow Dom and how it simplifies your CSS, we are **not** using Shadow Dom; these CSS
 * rules can affect everything on your page.
 *
 * @method registerTemplate
 * @static
 * @param {String} className                The tag name for the widget your setting the template for; 'layer-avatar'
 * @param {HTMLTemplateElement} [template]  Template node to register.  If none provided, will check the ownerDocument for a template.
 */
layerUI.registerTemplate = function registerTemplate(className, template) {
  if (!template) template = document._currentScript.ownerDocument.querySelector('template');

  // Since we aren't doing shadowDOM, and we don't want to insert the template <style/> tag a thousand times
  // for repeated components, remove the style from the template, and instead cache the styles in
  const styleMatches = template.innerHTML.match(/<style>([\s\S]*?)<\/style>/);
  const styles = styleMatches && styleMatches[1];
  if (styles) {
    template.innerHTML = template.innerHTML.replace(/<style>[\s\S]*?<\/style>/, '');
  }

  // Write template and style as static properties of the Component.
  layerUI.components[className].template = template;
  layerUI.components[className].style = styles;
  template.setAttribute('layer-template-registered', 'true');
};

/**
 * Register this template by passing in a string representation of the template.
 *
 * This is comparable to layerUI.registerTemplate except that
 *
 * 1. Instead of taking as input an HTMLTemplateElement, it instead takes a string containing the HTML for the template.
 * 2. Styles should have been removed from the string before calling this; failure to do so will cause the style to be added to your document
 * once per instanceo of this element.  Having 100 of the same style blocks can be a nuisance.
 *
 * @method buildAndRegisterTemplate
 * @static
 * @protected
 * @param {String} className          The tag name for the widget your setting the template for; 'layer-avatar'
 * @param {String} templateStr        Template string to register.
 */
layerUI.buildAndRegisterTemplate = function buildTemplate(className, templateStr) {

  // Generate a template node
  const template = document.createElement('template');
  template.innerHTML = templateStr;

  // Write it as a static property of the Component
  layerUI.components[className].template = template;
  template.setAttribute('layer-template-registered', 'true');
};

/**
 * Add the style for the template by passing in a string representation of the CSS rules.
 *
 * You do NOT need to call this if using layerUI.registerTemplate.
 *
 * This is comparable to layerUI.registerTemplate except that It only handles styles, not the template itself.
 *
 * @method buildStyle
 * @static
 * @protected
 * @param {String} className           The tag name for the widget your setting the template for; 'layer-avatar'
 * @param {String} styleStr            Style string to associate with this component.  Specifically, expects the output of `Function.toString()`
 */
layerUI.buildStyle = function buildStyles(className, styleStr) {
  layerUI.components[className].style = styleStr;
};

/**
 * Turn a hyphenated name into a camel case name.
 *
 * @method camelCase
 * @static
 * @param {String} str  a-hyphenated-string
 * @returns {String} aCamelCasedString
 */
layerUI.camelCase = str =>
  str.replace(/-(.)/g, (match, value) => value.toUpperCase());

/**
 * Turn a camel case name into a hyphenated name
 *
 * @method hyphenate
 * @static
 * @param {String} aCamelCasedString
 * @returns {String} a-hyphenated-string
 */
const regexHyphenate = /([a-z])([A-Z])/g;
layerUI.hyphenate = str =>
  str.replace(regexHyphenate, (match, part1, part2) =>
    part1 + '-' + part2.toLowerCase());


/**
 * Utility returns whether or not the window is in the background.
 *
 * @method isInBackground
 * @static
 * @returns {Boolean}
 */
layerUI.isInBackground = () => !document.hasFocus() || document.hidden;

/**
 * An adapter is a bit of JS Framework specific code for making this framework work with other UI Frameworks.
 *
 * See layerUI.adapters for examples.
 *
 * An adapter does not need to be registered via `addAdapter` to be used, but doing so makes it available to anyone using this framework.
 *
 * ```
 * layerUI.addAdapter('my-odd-js-framework', function() {....});
 * ```
 *
 * @method addAdapter
 * @static
 * @param {String} name      Name of the adapter. Namespaces it within layerUI.adapters
 * @param {Function} adapter The adapter to make available to apps
 */
layerUI.addAdapter = (name, adapter) => { layerUI.adapters[name] = adapter; };

/**
 * Call init with any custom settings, and to register all components with the dom.
 *
 * Note that `init()` must be called prior to putting any webcomponents into a document.
 *
 * Note as well that if passing in your appId, you must have instantiated a layer.Client with that appId
 * prior to putting any webcomponents into your document.
 *
 * ```javascript
 * layerUI.init({
 *   appId: 'layer:///apps/staging/my-app-id'
 * });
 * ```
 *
 * See layerUI.settings for more options to layerUI.init.
 *
 * @method init
 * @static
 * @param {Object} settings     list any settings you want changed from their default values.
 * @param {Object} mixins       hash of component names with mixins to add to the component
 */
layerUI.init = function init(settings) {
  // No-op -- see layer-ui.js
};

/**
 * Layer UI for Web version string
 *
 * @type {String}
 */
layerUI.version = '1.0.7';

const clientVersions = Layer.Client.version.split('.').map(value => Number(value));
if (clientVersions[0] !== 3 && Layer.Client.version !== '3.1.1') {
  console.error('This version or Layer UI for Web requires Layer WebSDK version 3.1.1 or up');
}

/**
 * This method is shorthand for accessing layerUI.components.Component.registerComponent
 *
 * Note: This code is actually in components/component.js and is only attached to layerUI
 * if you require `layer-ui-web/index.js` or just `layer-ui-web`, else you have to directly
 * access it.
 *
 * @method registerComponent
 */

module.exports = layerUI;

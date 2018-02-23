/**
 * This is the base class for all UI classes in the Layer UI Framework.
 *
 * It works with the webcomponent API/polyfill to define components that:
 *
 * * Provides getters/setters/defaults for all defined properties
 * * Read the widget's attributes on being initialized, copying them into properties and triggering property setters
 * * Provides created and destroyed callbacks
 * * Provides onReady and onAttach hooks for custom Mixins
 * * Automate standard template-related tasks
 * * Automate standard event-related tasks
 *
 * Methods and properties defined here should only be needed by developers wishing to build new widgets or evolve existing widgets.
 * Note that widgets can be created using other frameworks based on the webcomponent polyfill and still work here.
 *
 * A new component is created using:
 *
 * ```
 * var componentDefinition = {
 *   events: ['event-one', 'event-two', 'event-three', 'event-four'],
 *   mixins: [mixinObj1, mixinObj2, mixinObj3],
 *   properties: {
 *      prop1: {
 *          set: function(value) {
 *              this.myRenderer();
 *          }
 *      },
 *      prop2: {
 *          get: function() {
 *              return this.scrollTop;
 *          }
 *      },
 *      prop3: {
 *          value: "Frodo is a Dodo"
 *      },
 *      prop4: {
 *          type: Function
 *      }
 *   },
 *   methods: {
 *     onCreate: function() {
 *        alert("The widget has been created");
 *     },
 *     myRenderer: function() {
 *        this.innerHTML = this.properties.prop1;
 *     }
 *   },
 *   listeners: {
 *     'layer-notification-click': function notificationClick(evt) {
 *          const message = evt.detail.item;
 *          const conversation = message.getConversation();
 *          if (conversation) this.selectedId = conversation.id;
 *       },
 *    }
 *   }
 * };
 * ```
 *
 * A component defined this way can be registered as follows:
 *
 * ```
 * var layerUI = require('layer-ui-web');
 * layerUI.registerComponent(tagName, componentDefinition);
 * ```
 *
 * ### Properties
 *
 * A property definition can be as simple as:
 *
 * ```
 * layerUI.registerComponent(tagName, {
 *    properties: {
 *       prop1: {}
 *    }
 * });
 * ```
 *
 * The above code declares `prop1` to be a property, sets up a setter that writes `widget.properties.prop1` any time `widget.prop1` is set,
 * and sets up a getter to read the value from `widget.properties.prop1`.  It also insures that at initialization time, if a `prop1` attribute
 * is found, it will be used as the `prop1` property.
 *
 * Property Definitions support the following keys:
 *
 * *  set: A setter function whose input is the new value.  Note that your setter function is called AFTER this.properties.propName
 *    has been set with the new value; your setter is for any side effects, rendering updates, or additional processing and NOT
 *    for writing the value itself.
 * *  get: A getter is needed if getting the property value from `this.properties.propName` is not getting the latest value.
 *    Perhaps you want to return `this.nodes.input.value` to get text typed in by a user.
 * *  value: If a `value` key is provided, then this will be the default value of your property, to be used if a value is
 *    not provided by the component creator.
 * *  type: Currently accepts `Boolean`, `Number`, `Function`.  Using a type makes the system
 *    more forgiving when processing strings.  This exists because attributes frequently arrive as strings due to the way HTML attributes work.
 *    For example:
 *    * if type is Boolean, and "false", "null", "undefined", "" and "0" are evaluated as `false`; all other values are `true`
 *    * Using this with functions will cause your function string to be evaled, but will lose your function scope and `this` pointer.
 *    * Using this with a number will turn "1234" into `1234`
 * *  noGetterFromSetter: Do **not** use the getter function from within the setter.  Used for special cases where
 *    you have a getter that calculates the values, but where your setter should just make do with the last known value
 *    when determining if the value has changed.
 *
 * Example
 *
 * ```
 *  isEnabled: {
 *    type: Boolean,
 *    value: true,
 *    set: function(inValue) {
 *       this.classList.toggle('widget-enabled', inValue);
 *    },
 *    get: function() {
 *       return this.classList.contains('widget-enabled');
 *    }
 * }
 * ```
 *
 * ### Events
 *
 * As part of your layerUI.components.Component.registerComponents call you can pass in an `events` array; this is an array of strings representing events to listen for,
 * and provide as property-based event listeners.
 *
 * Example:
 *
 * ```
 * layerUI.registerComponent(tagName, {
 *    events: ['layer-something-happening', 'layer-nothing-happening', 'your-custom-event']
 * });
 * ```
 *
 * The above component definition will result in:
 *
 * 1. The component will listen for the 3 events listed, regardless of whether this component triggered the event,
 *    or its child components triggered the event.
 * 2. The component will define the following properties: `onSomethingHappening`, `onNothingHappening` and `onYourCustomEvent`. These properties
 *    are defined for you, you do not need to do anything more than list the events in the events array.
 * 3. Your app can now use either event listeners or property callbacks as illustrated below:
 *
 * Event Listeners:
 *
 * ```
 * document.body.addEventListener('layer-something-happening', myFunc);
 * document.body.addEventListener('layer-nothing-happening', myFunc);
 * document.body.addEventListener('your-custom-event', myFunc);
 * ```
 *
 * Property callbacks:
 * ```
 * widget.onSomethingHappening = myFunc;
 * widget.onNothingHappening = myFunc;
 * widget.onYourCustomEvent = myFunc;
 * ```
 *
 * ### Methods
 *
 * You may provide any methods you want within the `methods` hash; be aware though that some methods names
 * are reserved for use by the framework, and some have specific life-cycle implications for the widget.
 *
 * #### Reserved
 *
 * The following method names are reserved:
 *
 * * `createdCallback`
 * * `attachedCallback`
 * * `detachedCallback`
 * * `attributeChangedCallback`
 *
 * ### Mixins
 *
 * Mixins can be added to a widget in two ways:
 *
 * * A Component may add a `mixins` array to its definition
 * * An Application, initializing the framework via `layerUI.init()` may pass in mixins into the `init` call.
 *
 * #### Using Mixins from the Component
 *
 * A component can include any number of Mixins by adding them to the `mixins` Array:
 *
 * ```
 * // Define a Mixin that can contains `properties`, `methods` and `events`:
 * var mixinObj = {
 *   properties: {
 *     prop2: {}
 *   },
 *   methods: {
 *     method2: function() {
 *       alert("I two Met Hed; he was a little nerdy");
 *     }
 *   }
 * });
 *
 * // Add mixinObj to our Component
 * var componentDefinition = {
 *   mixins: [mixinObj],
 *   properties: {
 *      prop1: {
 *          set: function(value) {
 *              this.myRenderer();
 *          }
 *      }
 *   },
 *   methods: {
 *     method1: function() {
 *       alert("I Met Hed; he was nice");
 *     }
 *   }
 * });
 *
 * // Create a Component with prop1, prop2, method1 and method2
 * registerComponent(tagName, componentDefinition);
 * ```
 *
 * An app can modify an existing component by adding custom mixins to it using `layerUI.init()`.  The `mixins` parameter
 * takes as keys, the tag-name for any widget you want to customize;
 * (e.g `layer-messages-item`, `layer-messages-list`, `layer-conversation-panel`, etc...)
 *
 * The following example adds a search bar to the Message List:
 *
 * ```
 * // Define a Mixin that can contains `properties`, `methods` and `events`:
 * var mixinObj = {
 *   properties: {
 *     prop2: {}
 *   },
 *   methods: {
 *     method2: function() {
 *       alert("I two Met Hed; he was a little nerdy");
 *     }
 * });
 *
 * layerUI.init({
 *   appId: 'my-app-id',
 *   mixins: {
 *     'layer-messages-item': mixinObj
 *   }
 * });
 * ```
 *
 * #### Mixin Behaviors
 *
 * Your mixin can be used to:
 *
 * * Add new Events to the widget's `events` array (presumably one of your new methods will call `this.trigger('my-event-name')`)
 * * Add new properties
 * * Add new methods
 * * Add new behaviors to existing properties
 * * Add new behaviors to existing methods
 * * Overwrite existing methods
 *
 * ##### Adding an Event
 *
 * ```
 * var mixinObj = {
 *   events: ['mycompany-button-click'],
 *   methods: {
 *     onCreate: function() {
 *       this.nodes.button = document.createElement('button');
 *       this.appendChild(this.nodes.button);
 *       this.nodes.button.addEventListener('click', this._onMyCompanyButtonClick.bind(this));
 *     },
 *     _onMyCompanyButtonClick: function(evt) {
 *       this.trigger('mycompany-button-click', { message: this.item.message });
 *     }
 *   }
 * });
 * ```
 *
 * When the user clicks on the `this.nodes.button`, it will trigger the `mycompany-button-click` event.  By listing
 * `mycompany-button-click` event in the `events` array, this will automatically add the `onMycompanyButtonClick` property
 * which you can set to your event handler (or you may just use `document.addEventListener('mycompany-button-click', callback)`).
 *
 * ##### Add new behaviors to existing properties
 *
 * If you are modifying a widget that has an existing property, and you want additional side effects to
 * trigger whenever that property is set, you can add your own `set` method to the property.
 * Other modifications to the property will be ignored (`value` and `get` from mixin will be ignored).
 *
 * ```
 * var mixinObj = {
 *   properties: {
 *     client: {
 *       set: function(client) {
 *         this.properties.user = client.user;
 *       }
 *     }
 *   }
 * };
 * ```
 *
 * The above mixin can be added to any widget;
 *
 * * If the widget already has a `client` property, both the widget's setter and your setter will be called; order of call is not predetermined.
 * * If the widget does *not* already have a `client`, your `client` setter will be called if/when the `client` is set.
 *
 * You can use the Mixin to add any method your widget needs.
 *
 * You can also use the Mixin to enhance methods already provided by your widget:
 *
 * ```
 * var mixinObj = {
 *   methods: {
 *     onCreate: function() {
 *         var div = document.createElement('div');
 *         this.appendChild(div);
 *       }
 *     }
 *   }
 * };
 * ```
 *
 * The above mixin can be added to any widget; the widget's `onCreate` method will be called, AND your `onCreate` method will be called, in no
 * particular order.  You an also use the following `mode` values to change ordering:
 *
 * * `layerUI.registerComponent.MODES.BEFORE`: Call your mixin's method before the widget's method
 * * `layerUI.registerComponent.MODES.AFTER`: Call your mixin's method after the widget's method
 * * `layerUI.registerComponent.MODES.OVERWRITE`: Call only your mixin's method, *not* the widget's method
 * * `layerUI.registerComponent.MODES.DEFAULT`: Call your mixin's method in no particular order with regards to the widget's methods
 *
 * ```
 * var mixinObj = {
 *   methods: {
 *     onCreate: {
 *       mode: layerUI.registerComponent.MODES.BEFORE,
 *       value: function() {
 *         var div = document.createElement('div');
 *         this.appendChild(div);
 *       }
 *     }
 *   }
 * });
 * ```
 *
 * You can also define a `conditional` on your methods; if any `conditional` function returns `false`, then none of the `BEFORE`, `AFTER`, `DEFAULT` or `OVERWRITE` methods are called:
 *
 * ```
 * var mixinObj = {
 *   methods: {
 *     onRender: {
 *       conditional: function() {
 *         return Boolean(this.item);
 *       },
 *       mode: layerUI.registerComponent.MODES.BEFORE,
 *       value: function() {
 *         var div = document.createElement('div');
 *         this.appendChild(div);
 *       }
 *     }
 *   }
 * });
 * ```
 *
 * For details on what methods to modify via mixins, see the Life Cycle methods
 *
 * #### Life Cycle Methods
 *
 * All widgets should execute the following life cycle methods:
 *

1. `onCreate()`: Your widget has been created.
    * Uses for `onCreate`:
      * Setup event handlers
      * Add custom nodes and properties that do not depend upon property values
      * Setup local variables/state variables.
    * Widget State when `onCreate` is called:
      * If you have a template, it will have been loaded into your widget before `onCreate`, adding any neccessary child nodes
      * `this.nodes` will be setup and point to any nodes in your template that specify a `layer-id`.
      * If your widget was created with any attributes, they _may_ be available in `this.properties` but you should not depend upon them being set yet.
      * No property setters will have been called yet
      * Your widget will not have a `parentNode`
1. Property Setters: Your property setters will be called with any attributes and/or properties that your widget was initialized with.
   * The following widget `<my-widget prop1='frodo' prop2='dodo'></my-widget>` will call your setter for `prop1`
     with `frodo`, and `prop2` with `dodo`
   * Default property values will be set; a property defined like this: `properties: { prop1: { value: 55, set: function(newValue) {alert('Set!');} } }` will cause the `prop1` setter will be called with `55`
   * Any properties set via `var element = document.createElement('widget'); element.prop1 = 'frodo';` will fire at this point as well.
   * If no attribute value is passed in and no default value is set the `prop1` setter will *not* be called, and the value will be `null`
1. `onAfterCreate()`: Your widget has been initialized.
    * Uses for `onAfterCreate`:
      * Setup and DOM manipulation that depends upon property values (else it would go in `onCreate`)
      * One time DOM manipulation based on property values that never change.  Any DOM manipulation based on values that change
        would typically go in `onRender` which can be called repeatedly.
    * Widget state when `onAfterCreate` is called:
      * `onCreate` has been called
      * Property setters have all fired
      * `onRender` has **not**  been called
1. `onRender()`: DOM manipulation based on current property values.
    * Uses for `onRender`:
      * Typically called after a property value changes that would force the widget to rerender.  Note that for very specific and simple DOM changes,
        the property setter may directly update the DOM rather than call `onRender`.
      * Unlike `onAfterCreate`, `onRender` may be called multiple times
      * Note that this is called immediately after `onAfterCreate`,
      * Note that calls to `onRender` from your property setters will beo ignored until `onAfterCreate` has been called.
    * Widget state when `onRender` is called:
      * The first call will be before `onAttach`; subsequent calls may happen before or after this widget has a `parentNode`
      * `onCreate`, all property setters, and `onAfterCreate` have been called.
1. `onRerender()`: Widgets that render a Layer Web SDK Object listen for changes to the object and call `onRerender` to update rendering
   of things that can change within those objects.  Unlike `onRender` which would let you render an entirely new Message or Conversation,
   `onRerender` would handle changes within the existing Message or Conversation.  `onRerender` is also used when listening for events
   rather than changes to properties.
1. `onAttach()`: Your widget has been added to a document.
    * Uses for `onAttach`:
      * Your widget needs to know its `parentNode` to modify its rendering.
      * Your widget needs some sizing information to modify its rendering.
    * Widget state when `onAttach` is called:
      * `onRender` will always be called before `onAttach`.
      * `parentNode` should now have a value.
      * Removing this widget from the DOM and then reinserting it _may_ refire this call.  It will Not refire `onRender`.
1. `onDetach()`: Your widget has been removed from the html document.
1. `onDestroy()`: Your widget was has been flagged as destroyed.  This happens if it was removed from the HTML Document, and remained out of
   the document for more than a few moments. Use this function to unsubscribe from any custom event listeners you setup for your widget.

 *
 * #### Templates
 *
 * There are a number of ways that a template can be registered to your component.
 *
 * _Define a full Template while registering Component_:
 *
 * ```
 * var template = document.querySelector('template');
 * layerUI.registerComponent('my-widget', {
 *     template: template
 * });
 * ```
 *
 * _Define a template string while registering Component_:
 *
 * Note that unless the `<template/>` node, the template string is assumed to be DOM nodes only, and no `<style/>` blocks.
 * If using a template string, you may separately provide a style string:
 *
 * ```
 * layerUI.registerComponent('my-widget', {
 *     template: '<div><button />Click me</div>',
 *     styles: 'my-widget {display: block}'
 * });
 * ```
 *
 * _Define a template after defining your component_:
 *
 * ```
 * layerUI.registerComponent('my-widget', {
 * });
 *
 * layerUI.registerTemplate('my-widget', document.querySelector('template'));
 * ```
 *
 * _Define a template string after defining your component_:
 *
 * ```
 * layerUI.registerComponent('my-widget', {
 * });
 *
 * layerUI.buildAndRegisterTemplate('my-widget', '<div><button />Click me</div>');
 * ```
 *
 * @class layerUI.components.Component
 */


/**
 * Register a component using the specified HTML tagName.
 *
 * Note that you may define your components and styles any way you like, you do not need to conform your
 * component structure to the expected input of this function.  This function Does however provide
 * many simplifying capabilities including
 *
 *  * Auto-generation of setters/getters removing unneccessary boilerplate
 *  * Automatic mapping of hyphen-cased properties to camel-case attributes used within your component
 *  * Automatic applying of any property values passed in before your setters could trigger; gaurentees setters trigger after initialization
 *  * Automatic detection and copying of attribute values into properties
 *  * Utilities for managing templates and styles that are seen within `layerUI` all depend upon this structure.
 *
 * @method registerComponent
 * @static
 * @param {String} tagName    Tag name that is being defined (`layer-avatar`)
 * @param {Object} classDef    Definition of your class
 * @param {Object} classDef.properties    Definition of your class properties
 * @param {Object} classDef.methods    Definition of your class methods
 * @param {String[]} classDef.events    Array of events to listen for and repackage as event handler properties
 * @param {Mixed} template     A `<template />` node or a template string such as `<div><button /></div>`
 * @param {String} style       A String with CSS styles for this widget
 */
import Layer from 'layer-websdk';
import layerUI from '../base';
import stateManagerMixin from '../mixins/state-manager';

/*
 * Setup the Real structure needed for the `methods` object, not a hash of functions,
 * but a hash of functions with a `mode` parameter
 */
function setupMethods(classDef, methodsIn) {
  const methods = classDef.methods;
  Object.keys(methodsIn).forEach((methodName) => {
    if (!methods[methodName]) methods[methodName] = {};
    const methodDef = methods[methodName];
    const methodInDef = methodsIn[methodName];
    if (!methodDef.methodsBefore) {
      methodDef.methodsBefore = [];
      methodDef.methodsAfter = [];
      methodDef.methodsMiddle = [];
      methodDef.conditional = [];
    }
    if (typeof methodInDef === 'function') {
      methodDef.methodsMiddle.push(methodsIn[methodName]);
    } else if (methodInDef.mode === registerComponent.MODES.BEFORE) {
      methodDef.methodsBefore.push(methodsIn[methodName].value);
    } else if (methodInDef.mode === registerComponent.MODES.AFTER) {
      methodDef.methodsAfter.push(methodsIn[methodName].value);
    } else if (methodInDef.mode === registerComponent.MODES.OVERWRITE) {
      methodDef.lock = methodInDef.value;
    } else if (methodInDef.mode === registerComponent.MODES.DEFAULT) {
      methodDef.methodsMiddle.push(methodsIn[methodName].value);
    }
    if (methodInDef.conditional) methodDef.conditional.push(methodInDef.conditional);
  });
}


/*
 * Provides a basic mixin mechanism.
 *
 * Provide an array of objects with a `properties` key and a `methods` key,
 * and all property defintions and method defintions will be copied into your classDef UNLESS your classDef
 * has provided its own definition.
 * If your mixin provides a created() method, it will be called after the classDef created() method is called;
 * this will be called for any number of mixins.
 *
 * If your mixin provides a property that is also defined by your component,
 *
 * @method setupMixin
 * @param {Object} classDef
 * @private
 */
function setupMixin(classDef, mixin) {
  const propNames = Object.keys(mixin.properties || {});

  // Copy all properties from the mixin into the class definition,
  // unless they are already defined.
  propNames.forEach((name) => {
    if (!classDef['__' + name]) classDef['__' + name] = [];
    classDef['__' + name].push(mixin.properties[name]);

    // Make sure that this becomes a part of the properties definition of the class if the prop
    // isn't already defined.  used by the props array.
    if (!classDef.properties[name]) {
      classDef.properties[name] = mixin.properties[name];
    } else {
      if (mixin.properties[name].order !== undefined && classDef.properties[name].order === undefined) {
        classDef.properties[name].order = mixin.properties[name].order;
      }
      if (mixin.properties[name].value !== undefined && classDef.properties[name].value === undefined) {
        classDef.properties[name].value = mixin.properties[name].value;
      }
      if (mixin.properties[name].propagateToChildren !== undefined &&
          classDef.properties[name].propagateToChildren === undefined) {
        classDef.properties[name].propagateToChildren = mixin.properties[name].propagateToChildren;
      }
    }
  });

  setupMethods(classDef, mixin.methods || {});
}

/*
 * Merge all mixin function definitions into a single function call.
 *
 * @method finalizeMixinMerge
 * @param {Object} classDef
 * @private
 */
function finalizeMixinMerge(classDef) {
  const propNames = Object.keys(classDef.properties || {});
  propNames.forEach((name) => {
    if (classDef['__' + name]) {

      // NOTE: Modes are currently applied to properties, but we do not yet support OVERWRITE mode.
      const setters = Layer.Util.sortBy(classDef['__' + name].filter(def => def.set), (setter) => {
        switch (setter.mode) {
          case registerComponent.MODES.BEFORE:
            return 1;
          case registerComponent.MODES.AFTER:
            return 3;
          default:
            return 2;
        }
      });
      classDef['__set_' + name] = setters.map(setter => setter.set);
    }
  });

  const methodNames = Object.keys(classDef.methods || {});

  methodNames.forEach((methodName) => {
    const methodDef = classDef.methods[methodName];
    let methodList = [...methodDef.methodsBefore, ...methodDef.methodsMiddle, ...methodDef.methodsAfter];
    if (methodDef.lock) methodList = [methodDef.lock];
    if (methodList.length === 1 && !methodDef.conditional.length) {
      classDef.methods[methodName] = methodList[0];
    } else {
      classDef['__method_' + methodName] = methodList;
      classDef.methods[methodName] = getMethod(classDef, methodDef.conditional, classDef['__method_' + methodName]);
    }
  });
}


function getMethod(classDef, conditionals, methods) {
  return function runMethod(...args) {
    let result;
    for (let i = 0; i < conditionals.length; i++) {
      if (!conditionals[i].apply(this, args)) return;
    }

    methods.forEach((method) => {
      const resultTmp = method.apply(this, args);
      if (resultTmp !== undefined) result = resultTmp;
    });
    return result;
  };
}

/*
 * Add all mixin events in, and then call setupEvents on each event
 */
function setupEvents(classDef) {
  classDef.mixins.filter(mixin => mixin.events).forEach((mixin) => {
    classDef.events = classDef.events.concat(mixin.events);
  });
  classDef.events.forEach(eventName => setupEvent(classDef, eventName));
}

/*
 * For each event defined in the `events` property, setup an `onXXX` property.
 *
 * The `onXXX` property works by:
 *
 * 1. Doing nothing unless the app sets this event property to a Function
 * 2. Listening for the specified event via addEventListener
 * 3. Calling any provided function with the event provided by addEventListener
 * 4. Call removeEventListener should this property ever change
 *
 * @method setupEvent
 * @private
 * @param {Object} classDef
 * @param {String} eventName
 */
function setupEvent(classDef, eventName) {
  const camelEventName = layerUI.camelCase(eventName.replace(/^layer-/, ''));
  const callbackName = 'on' + camelEventName.charAt(0).toUpperCase() + camelEventName.substring(1);
  if (!classDef.properties[callbackName]) {
    classDef.properties[callbackName] = {
      type: Function,
      set(value) {
        if (this.properties['old-' + eventName]) {
          this.removeEventListener(eventName, this.properties['old-' + eventName]);
          this.properties['old-' + eventName] = null;
        }
        if (value) {
          this.addEventListener(eventName, value);
          this.properties['old-' + eventName] = value;
        }
      },
    };
  }
}

/*
 * Get an array of property descriptions.
 *
 * @method
 * @private
 * @param {Object} classDef
 */
function getPropArray(classDef) {
  // Translate the property names into definitions with property/attribute names
  return Object.keys(classDef.properties).map((propertyName) => {
    return {
      propertyName,
      attributeName: layerUI.hyphenate(propertyName),
      type: classDef.properties[propertyName].type,
      order: classDef.properties[propertyName].order,
      noGetterFromSetter: classDef.properties[propertyName].noGetterFromSetter,
      propagateToChildren: classDef.properties[propertyName].propagateToChildren,
    };
  }).sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    } else if (a.order !== undefined) {
      return -1;
    } else if (b.order !== undefined) {
      return 1;
    } else {
      return 0;
    }
  });
}


/*
 * Cast a property value to its specified type
 */
function castProperty(type, value) {
  // Some special handling is needed for some properties as they may be delivered
  // as strings HTML delivers attributes as strings.
  switch (type) {
    // Translate strings into booleans
    case Boolean:
      if (['false', '0', 'null', 'undefined'].indexOf(value) !== -1) {
        return false;
      } else {
        return Boolean(value);
      }

    case Number:
      return Number(value);

    // Translate strings into functions
    case Function:
      return typeof value === 'string' ? eval('(' + value + ')') : value;
  }
  return value;
}

/*
 * Define a single property based on a single property from the Component's `properties` definition.
 *
 * Will setup the properties getter, setter, default value, and type.
 *
 * @method setupProperty
 * @private
 * @param {Object} classDef   The class definition object
 * @param {Object} prop       A property definition as generated by getPropArray
 * @param {Object} propertyDefHash  A hash of all property definitions for use in reflection
 */
function setupProperty(classDef, prop, propertyDefHash) {
  const newDef = {};
  const name = prop.propertyName;
  const propDef = classDef.properties[name];

  // Copy our property definition into our hash of definitions
  // which will be associated with this class for reflection purposes
  propertyDefHash[name] = propDef;

  // If a getter is provided, use it. else provide a getter that returns this.properties[name].
  // However, if the call comes before we have a properties object, this is an initialization phase
  // where we should not yet have properties so return undefined.

  // NOTE: Do not use arrow functions; that will change the "this" pointer.
  newDef.get = function getter() {
    if (this.properties._internalState.disableGetters) {
      return this.properties[name];
    } else {
      return propDef.get ? propDef.get.apply(this) : this.properties[name];
    }
  };



  // The property setter will set this.properties[name] and then if there is a custom setter, it will be invoked.
  // This means that the setter does NOT need to write to this.properties, but can handle side effects, transformations, etc...
  newDef.set = function propertySetter(value) {
    if (layerUI.debug) console.log(`Set property ${this.tagName}.${name} to `, value);

    if (propDef.type) value = castProperty(propDef.type, value);

    const oldValue = prop.noGetterFromSetter ? this.properties[name] : this[name];
    if (oldValue !== value || this.properties._internalState.inPropInit.indexOf(name) !== -1) {

      // can't call setters with this on because the setters will set other properties which should not
      // trigger further setters if there was no actual change
      const initIndex = this.properties._internalState.inPropInit.indexOf(name);
      const wasInit = initIndex !== -1;
      if (wasInit) this.properties._internalState.inPropInit.splice(initIndex, 1);

      this.properties[name] = value;
      if (classDef['__set_' + name] && !this.properties._internalState.disableSetters) {
        classDef['__set_' + name].forEach(setter => setter.call(this, value, wasInit ? null : oldValue));
      }

      if (propDef.propagateToChildren) {
        Object.keys(this.nodes).forEach((nodeName) => {
          this.nodes[nodeName][name] = value;
        });
        if (this._isList) {
          const childNodes = this.childNodes;
          let i;
          for (i = 0; i < childNodes.length; i++) {
            if (childNodes[i]._isListItem) childNodes[i][name] = value;
          }
        }
      }
    }
  };

  // Write the property def to our class that will be passed into document.registerElement(tagName, classDef)
  classDef[name] = newDef;
}

let registerAllCalled = false;
function registerComponent(tagName, classDef) {
  if (!layerUI.components[tagName]) layerUI.components[tagName] = {};
  layerUI.components[tagName].def = classDef;

  if (classDef.template) {
    layerUI.components[tagName].template = classDef.template;
    delete classDef.template;
  }

  if (classDef.style) {
    layerUI.components[tagName].style = classDef.style;
    delete classDef.style;
  }

  if (registerAllCalled) _registerComponent(tagName);
}

// Docs in layer-ui.js
function unregisterComponent(tagName) {
  delete layerUI.components[tagName];
}

// Docs in layer-ui.js
function registerAll() {
  registerAllCalled = true;
  Object.keys(layerUI.components)
    .filter(tagName => typeof layerUI.components[tagName] !== 'function')
    .forEach(tagName => _registerComponent(tagName));
}

function _registerComponent(tagName) {
  const classDef = layerUI.components[tagName].def;
  const { template } = layerUI.components[tagName];

  if (template) {
    if (typeof template === 'string') {
      layerUI.buildAndRegisterTemplate(tagName, template);
    } else if (template.getAttribute('layer-template-registered') !== 'true') {
      layerUI.registerTemplate(tagName, template);
    }
  }

  // Insure property exists
  if (!classDef.properties) classDef.properties = {};
  if (!classDef.methods) classDef.methods = {};
  if (!classDef.events) classDef.events = [];
  if (!classDef.mixins) classDef.mixins = [];
  classDef.mixins.push(stateManagerMixin);

  // Add in custom mixins specified via layerUI.settings
  if (layerUI.settings.mixins[tagName]) {
    classDef.mixins = classDef.mixins.concat(layerUI.settings.mixins[tagName]);
  }

  // Setup all events specified in the `events` property.  This adds properties,
  // so must precede setupMixins
  setupEvents(classDef);

  // Replace all methods with "merge" parameters
  const methods = classDef.methods;
  classDef.methods = {};
  setupMethods(classDef, standardClassMethods);
  setupMethods(classDef, methods);

  // Propare the classDef's properties to merge with Mixin properties
  const properties = classDef.properties;
  classDef.properties = {};
  setupMixin(classDef, { properties });
  setupMixin(classDef, { properties: standardClassProperties });

  // Some mixins may have mixins of their own; add them to the list;
  // every newly added item must also be processed, so insure loop touches on new items as well
  for (let i = 0; i < classDef.mixins.length; i++) {
    const mixins = classDef.mixins[i].mixins;
    if (mixins) {
      mixins.forEach((submixin) => {
        if (classDef.mixins.indexOf(submixin) === -1) classDef.mixins.push(submixin);
      });
    }
  }

  classDef.properties._listeners = {
    value: Object.keys(classDef.listeners || {}),
  };

  classDef.mixins.forEach(mixin => setupMixin(classDef, mixin));
  finalizeMixinMerge(classDef);

  // For each property in the methods hash, setup the setter/getter
  const propertyDefHash = {};
  const props = getPropArray(classDef);

  // Add the property to our object, with suitable getters and setters
  props.forEach(prop => setupProperty(classDef, prop, propertyDefHash));

  // Cleanup; we no longer need this properties object; it can be accessed via propertyDefHash
  delete classDef.properties;

  // For every method, add the expected structure to the function
  Object.keys(classDef.methods).forEach((name) => {
    classDef[name] = {
      value: classDef.methods[name],
      writable: true,
    };
  });
  delete classDef.methods;

  // This veresion of listeners does not blend listeners from multiple mixins
  Object.keys(classDef.listeners || {}).forEach((name) => {
    classDef['__listener-' + name] = {
      value: classDef.listeners[name],
      writable: true,
    };
  });
  delete classDef.listeners;

  /**
   * createdCallback is part of the Webcomponent lifecycle and drives this framework's lifecycle.
   *
   * It is called after the widget has been created.  We use this to initialize properties, nodes,
   * templates, wait for more properties, call property setters, call `onAfterCreate`, etc.
   *
   * @method createdCallback
   * @private
   */
  classDef.createdCallback = {
    value: function createdCallback() {
      if (!layerUI.components[tagName]) return;

      this._initializeProperties();
      this.nodes = {};


      // If a template has been assigned for this class, append it to this node, and parse for layer-ids
      // Note that in the event of a node.cloneNode() properties are not copied, but attributes are.
      // Also, in the event of a cloneNode, the template in full is copied, and should not be reimported.
      // layer-has-template allows us to insure we don't import a template if one is provided via cloneNode.
      const templateNode = this.getTemplate();
      if (templateNode) {
        if (!this.getAttribute('layer-has-template')) {
          const clone = document.importNode(templateNode.content, true);
          this.appendChild(clone);
          this.setAttribute('layer-has-template', 'true');
        }
        this.setupDomNodes();
      }

      // Call the Compoent's created method which sets up DOM nodes,
      // event handlers, etc...
      this.onCreate();

      // Call the Component's onAfterCreate method which can handle any setup
      // that requires all properties to be set, dom nodes initialized, etc...
      Layer.Util.defer(() => this._onAfterCreate());
    },
  };

  classDef._setupListeners = {
    value: function _setupListeners() {
      this._listeners.forEach((eventName) => {
        document.body.addEventListener(eventName, this._handleListenerEvent.bind(this, '__listener-' + eventName));
      });
    },
  };

  classDef._handleListenerEvent = {
    value: function _handleListenerEvent(methodName, evt) {
      if (this.properties.listenTo.indexOf(evt.target.id) !== -1) {
        this[methodName].apply(this, [evt]);
      }
    },
  };

  classDef._onAfterCreate = {
    value: function _onAfterCreate() {
      // Happens during unit tests
      if (this.properties._internalState.onDestroyCalled) return;

      // Allow Adapters to call _onAfterCreate... and then insure its not run a second time
      if (this.properties._internalState.onAfterCreateCalled) return;
      this.properties._internalState.disableSetters = false;
      this.properties._internalState.disableGetters = false;
      this.properties._internalState.inPropInit =
        layerUI.components[tagName].properties.map(propDef => propDef.propertyName);

      props.forEach((prop) => {
        const value = this.properties[prop.propertyName];
        // UNIT TEST: This line is primarily to keep unit tests from throwing errors
        if (value instanceof Layer.Root && value.isDestroyed) return;
        if (value !== undefined && value !== null) {
          // Force the setter to trigger; this will force the value to be converted to the correct type,
          // and call all setters
          this[prop.propertyName] = value;

          if (prop.propagateToChildren) {
            Object.keys(this.nodes).forEach(nodeName => (this.nodes[nodeName][prop.propertyName] = value));
          }
        }


        // If there is no value, but the parent component has the same property name, presume it to also be
        // propagateToChildren, and copy its value; useful for allowing list-items to automatically grab
        // all parent propagateToChildren properties.
        else if (prop.propagateToChildren && this.parentComponent) {
          const parentValue = this.parentComponent.properties[prop.propertyName];
          if (parentValue) this[prop.propertyName] = parentValue;
        }
      });
      this.properties._internalState.inPropInit = [];

      // Warning: these listeners may miss events triggered while initializing properties
      // only way around this is to add another Layer.Util.defer() to our lifecycle
      this._setupListeners();

      this.onAfterCreate();
    },
  };

  /**
   * A hash of DOM nodes that are important to this widget.
   *
   * Any dom node in a template file that has a `layer-id` will be written to this hash.
   *
   * Example:
   *
   * ```
   * <template>
   *   <a layer-id='link'><img layer-id='image' /></a>
   * </template
   * ```
   *
   * The above template will result in a `nodes` value of:
   *
   * ```
   * {
   *     link: anchorObject,
   *     image: imageObject
   * }
   * ```
   *
   * And then allow me to have code such as:
   *
   * ```
   * render: function() {
   *    this.nodes.image.src = this.properties.url;
   * }
   * ```
   *
   * @property {Object} nodes
   */

  /**
   * attachedCallback is part of the Webcomponent lifecycle and drives this framework's lifecycle.
   *
   * This calls `onAttach`.
   * @method
   * @private
   */
  classDef.attachedCallback = {
    value: function onAttach() {
      this.onAttach();
    },
  };

  /**
   * Initialize the properties object.
   *
   * This Fixes a bug in webcomponents polyfil that clobbers property getter/setter.
   *
   * The webcomponent polyfil copies in properties before the property getter/setter is applied to the object.
   * As a result, we might have a property of `this.appId` that is NOT accessed via `this.properties.appId`.
   * Further, the getter and setter functions will not invoke as long as this value is perceived as the definition
   * for this Object. So we delete the property `appId` from the object so that the getter/setter up the prototype chain can
   * once again function.
   *
   * @method _initializeProperties
   * @private
   * @param {Object} prop   A property def whose value should be stashed
   */
  classDef._initializeProperties = {
    value: function _initializeProperties() {

      /**
       * Values for all properties of this widget.
       *
       * All properties are stored in `this.properties`; any property defined in the class definition's `properties` hash
       * are read and written here.
       *
       * Properties may have already been setup by a UI Framework adapter for caching properties passed from the app; if properties
       * exists, they may still need to be setup.
       *
       * @property {Object} properties
       * @protected
       */
      if (this.properties && this.properties._internalState) return;
      if (!this.properties) this.properties = {};

      this.properties._internalState = {
        onCreateCalled: false,
        onAfterCreateCalled: false,
        onRenderCalled: false,
        onAttachCalled: false,
        onDetachCalled: false,
        disableSetters: true,
        disableGetters: true,
        inPropInit: [],
      };

      // props.forEach((prop) => {
      //   const value = this[prop.propertyName];
      //   if (value !== undefined) {
      //     this.properties[prop.propertyName] = castProperty(prop.type, value);
      //     delete this[prop.propertyName];
      //   }
      //   this._copyInAttribute(prop);
      // });

      props.forEach(prop => this._copyInAttribute(prop));
    },
  };

  /**
   * Handle some messy post-create copying of attribute values over to property
   * values where property setters can fire.
   *
   * @method _copyInAttribute
   * @private
   * @param {Object} prop   A property def object as defined by getPropArray
   */
  classDef._copyInAttribute = {
    value: function _copyInAttribute(prop) {

      let finalValue = null;
      let value = this.getAttribute(prop.attributeName);

      // Firefox seems to need this alternative to getAttribute().
      // TODO: Verify this and determine if it uses the getter here.
      if (value === null && this[prop.attributeName] !== undefined) {
        value = this[prop.attributeName];
      }

      if (value !== null) {
        finalValue = value;
      } else if (this[prop.propertyName] !== undefined) {
        // this only happens in firefox; somehow the property rather than the attribute is set, but
        // the setter is never called; so properties isn't correctly setup
        // TODO: Verify this -- also redundant with initialize properties
        finalValue = this[prop.propertyName];
        delete this[prop.propertyName];
      } else if ('value' in propertyDefHash[prop.propertyName]) {
        finalValue = propertyDefHash[prop.propertyName].value;

        // Don't treat a default value of [] as a static value shared among all instances
        if (Array.isArray(finalValue)) finalValue = finalValue.concat([]);
      }

      this.properties[prop.propertyName] = prop.type ? castProperty(prop.type, finalValue) : finalValue;
    },
  };



  /**
   * detachedCallback is part of the Webcomponent lifecycle and drives this framework's lifecycle.
   *
   * By default, removing this widget from the dom will cause it to be destroyed.
   *
   * Using the `layer-widget-destroyed` event, you may override this behavior using `evt.preventDefault()`:
   *
   * ```
   * document.body.addEventListener('layer-widget-destroyed', function(evt) {
   *    if (evt.detail.target === nodeToNotDestroy) {
   *      evt.preventDefault();
   *    }
   * });
   * ```
   *
   * > *Note*
   * >
   * > Once a node has been removed from the DOM, its events cannot bubble up.  So we *also* trigger the event on
   * > `document.body`. This means that `evt.target` becomes `document.body`. So use `evt.detail.target`
   * > not `evt.target` to identify the removed node.
   *
   * @event layer-widget-destroyed
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {Layer.UI.Component} evt.detail.target
   */
  classDef.detachedCallback = {
    value: function detachedCallback() {
      const isMainComponent = this._isMainComponent &&
        (this.properties.mainComponent === this || this.properties.mainComponent === null);

      this.onDetach();

      // Wait 10 seconds after its been removed, then check to see if its still removed from the dom before doing cleanup and destroy.
      setTimeout(() => {
        if (this.properties._internalState.onDestroyCalled) return;
        if (document.body.contains(this) || document.head.contains(this)) return;
        if (this.trigger('layer-widget-destroyed', { target: this })) {
          if (!isMainComponent || (!document.body || this.trigger.apply(document.body, ['layer-widget-destroyed', { target: this }] ) )) {
            this.onDestroy();
          }
        }
      }, 10000);
    },
  };

  /**
   * Any time a widget's attribute has changed, copy that change over to the properties where it can trigger the property setter.
   *
   * @method attributeChangedCallback
   * @private
   * @param {String} name      Attribute name
   * @param {Mixed} oldValue   Original value of the attribute
   * @param {Mixed} newValue   Newly assigned value of the attribute
   */
  classDef.attributeChangedCallback = {
    value: function attributeChangedCallback(name, oldValue, newValue) {
      if (layerUI.debug) console.log(`Attribute Change on ${this.tagName}.${name} from ${oldValue} to `, newValue);
      this[layerUI.camelCase(name)] = newValue;
    },
  };

  // Register the component with our components hash as well as with the document.
  // WARNING: Calling this in some browsers may cause immediate registeration of the component prior
  // to reaching the next line of code; putting code after this line may be problematic.
  layerUI.components[tagName].classDef = document.registerElement(tagName, {
    prototype: Object.create(HTMLElement.prototype, classDef),
  });


  /**
   * Identifies the properties exposed by this component.
   *
   * Used by adapters.  Each element of the array consists of:
   *
   * ```
   * {
   *    propertyName: 'onReadThisDoc',
   *    attributeName: 'on-read-this-doc',
   *    type: Boolean
   * }
   * ```
   *
   * @type {Object[]}
   * @static
   */
  layerUI.components[tagName].properties = props;
};

/**
   * A `<template />` dom node
   *
   * These templates are used during Component initializations.
   *
   * @type {HTMLTemplateElement}
   * @private
   * @static
   */

  /**
   * Stylesheet string.
   *
   * A stylesheet string can be added to the document via `styleNode.innerHTML = value` assignment.
   *
   * @type {String}
   * @private
   * @static
   */

/**
 * Mixin modes determines how a new method being added to a class will be executed with respect to any other methods.
 *
 * * BEFORE: Run your method before other methods of the same name
 * * AFTER: Run your method after other methods of the same name
 * * OVERWRITE: Run only your method, no other methods of the same name
 * * DEFAULT: Run your method in normal ordering.
 *
 * @static
 * @property {Object} MODES
 * @property {String} MODES.BEFORE
 * @property {String} MODES.AFTER
 * @property {String} MODES.OVERWRITE
 * @property {String} MODES.DEFAULT
 */
registerComponent.MODES = {
  BEFORE: 'BEFORE',
  AFTER: 'AFTER',
  OVERWRITE: 'OVERWRITE',
  DEFAULT: 'DEFAULT',
};

const standardClassProperties = {
  _layerEventSubscriptions: {
    value: [],
  },
  parentComponent: {},
  mainComponent: {
    get() {
      if (this.properties._isMainComponent) return this;
      if (!this.properties.mainComponent) {
        this.properties.mainComponent = this.properties.parentComponent.mainComponent;
      }
      return this.properties.mainComponent;
    },
  },
  client: {
    propagateToChildren: true,
  },
  listenTo: {
    value: [],
    set(value) {
      if (typeof value === 'string') this.properties.listenTo = value.split(/\s*,\s*/);
    },
  },
};

const standardClassMethods = {
  /**
   * The setupDomNodes method looks at all child nodes of this node that have layer-id properties and indexes them in the `nodes` property.
   *
   * Typically, this node has child nodes loaded via its template, and ready by the time your `created` method is called.
   *
   * This call is made on your behalf prior to calling `created`, but if using templates after `created` is called,
   * you may need to call this directly.
   *
   * @method setupDomNodes
   * @protected
   */
  setupDomNodes: function setupDomNodes() {
    this.nodes = {};

    this._findNodesWithin(this, (node, isComponent) => {
      const layerId = node.getAttribute && node.getAttribute('layer-id');
      if (layerId) this.nodes[layerId] = node;

      if (isComponent) {
        if (!node.properties) node.properties = {};
        node.properties.parentComponent = this;
      }
    });
  },

  /**
   * Iterate over all child nodes generated by the template; skip all subcomponent's child nodes.
   *
   * @method _findNodesWithin
   * @private
   * @param {HTMLElement} node    Node whose subtree should be called with the callback
   * @param {Function} callback   Function to call on each node in the tree
   * @param {HTMLElement} callback.node   Node that the callback is called on
   * @param {Boolean} isComponent         Is the node a Component from this framework
   */
  _findNodesWithin: function _findNodesWithin(node, callback) {
    const children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
      const innerNode = children[i];

      const isLUIComponent = Boolean(innerNode instanceof HTMLElement && layerUI.components[innerNode.tagName.toLowerCase()]);
      callback(innerNode, isLUIComponent);

      // If its not a custom webcomponent with children that it manages and owns, iterate on it
      if (!isLUIComponent) {
        this._findNodesWithin(innerNode, callback);
      }
    }
  },

  /**
   * Return the default template or the named template for this Component.
   *
   * Get the default template:
   *
   * ```
   * var template = widget.getTemplate();
   * ```
   *
   * Typical components should not need to call this; this will be called automatically prior to calling the Component's `created` method.
   * Some components wanting to reset dom to initial state may use this method explicitly:
   *
   * ```
   * var template = this.getTemplate();
   * var clone = document.importNode(template.content, true);
   * this.appendChild(clone);
   * this.setupDomNodes();
   * ```
   *
   * @method getTemplate
   * @protected
   * @returns {HTMLTemplateElement}
   */
  getTemplate: function getTemplate() {
    const tagName = this.tagName.toLocaleLowerCase();

    if (layerUI.components[tagName].style) {
      const styleNode = document.createElement('style');
      styleNode.id = 'style-' + this.tagName.toLowerCase();
      styleNode.innerHTML = layerUI.components[tagName].style;
      document.getElementsByTagName('head')[0].appendChild(styleNode);
      layerUI.components[tagName].style = ''; // insure it doesn't get added to head a second time
    }
    return layerUI.components[tagName].template;
  },

  /**
   * Triggers a dom level event which bubbles up the dom.
   *
   * Call with an event name and a `detail` object:
   *
   * ```
   * this.trigger('something-happened', {
   *   someSortOf: 'value'
   * });
   * ```
   *
   * The `someSortOf` key, and any other keys you pass into that object can be accessed via `evt.detail.someSortOf` or `evt.detail.xxxx`:
   *
   * ```
   * // Listen for the something-happened event which because it bubbles up the dom,
   * // can be listened for from any parent node
   * document.body.addEventListener('something-happened', function(evt) {
   *   console.log(evt.detail.someSortOf);
   * });
   * ```
   *
   * layerUI.components.Component.events can be used to generate properties to go with your events, allowing
   * the following widget property to be used:
   *
   * ```
   * this.onSomethingHappened = function(detail) {
   *   console.log(detail.someSortOf);
   * });
   * ```
   *
   * @method trigger
   * @protected
   * @param {String} eventName
   * @param {Object} detail
   * @returns {Boolean} True if process should continue with its actions, false if application has canceled
   *                    the default action using `evt.preventDefault()` (perhaps an event listener wanted to handle the action itself)
   */
  trigger: function trigger(eventName, details) {
    const evt = new CustomEvent(eventName, {
      detail: details,
      bubbles: true,
      cancelable: true,
    });
    this.dispatchEvent(evt);
    return !evt.defaultPrevented;
  },

  /**
   * Return array of matching elements as an Array.
   *
   * This basically just calls this.querySelectorAll and then returns a proper Array rather than a NodeList.
   *
   * @method querySelectorAllArray
   * @protected
   * @param {String} XPath selector
   * @returns {HTMLElement[]}
   */
  querySelectorAllArray: function querySelectorAllArray(selector) {
    return Array.prototype.slice.call(this.querySelectorAll(selector));
  },

  /**
   * MIXIN HOOK: Each time a Component is initialized, its onCreate methods will be called.
   *
   * This is called before any properties have been set; use this for initialization that does not
   * depend upon properties, including creating dom nodes, event handlers and initial values for state variables.
   *
   * @method onCreate
   */
  onCreate: {
    mode: registerComponent.MODES.AFTER,
    value: function onCreate() {
      this.properties._internalState.onCreateCalled = true;
    },
  },

  /**
   * MIXIN HOOK: Each time a Component is initialized, its onAfterCreate methods will be called.
   *
   * While one could use layerUI.Components.Component.onCreate, this handler allows you to wait for all
   * properties to be set before your intialization code is run.
   *
   * @method onAfterCreate
   */
  onAfterCreate: {
    mode: registerComponent.MODES.AFTER,
    value: function onAfterCreate() {
      this.properties._internalState.onAfterCreateCalled = true;
      this.onRender();
      this.properties._internalState.onRenderCalled = true;
      if (this.properties._callOnAttachAfterCreate) {
        this.properties._callOnAttachAfterCreate = false;
        this.onAttach();
      }
    },
  },

  /**
   * MIXIN HOOK: Called when rendering the widget.
   *
   * @method onRender
   */
  onRender: {
    conditional: function onCanRender() {
      return this.properties._internalState.onAfterCreateCalled;
    },
  },

  /**
   * MIXIN HOOK: Called after any Query events cause the list
   * to have rerendered.
   *
   * @method onRerender
   */
  onRerender: {
    conditional: function onCanRerender() {
      return this.properties._internalState.onAfterCreateCalled;
    },
  },

  /**
   * MIXIN HOOK: Each time a Component is inserted into a Document, its onAttach methods will be called.
   *
   * Note that prior to this, `parentNode` might have been `null`; at this point,
   * you should be able to see all information about its parent nodes.  Some rendering
   * may need to wait for this.
   *
   * @method onAttach
   */
  onAttach: {
    conditional: function onAttachConditional() {
      if (!this.properties._internalState.onAfterCreateCalled) {
        this.properties._callOnAttachAfterCreate = true;
        return false;
      } else {
        return true;
      }
    },
    mode: registerComponent.MODES.AFTER,
    value: function onAttach() {
      this.properties._internalState.onAttachCalled = true;
    },
  },

  /**
   * MIXIN HOOK: Each time a Component is removed from document.body, its onDetach methods will be called.
   *
   * Note that the `layer-widget-destroyed` event will still trigger even if you provide this, so be aware of
   * what that event will do and that your widget may be destroyed a few seconds after this function is called.
   *
   * @method onDetach
   */
  onDetach: {
    mode: registerComponent.MODES.AFTER,
    value: function onDetach() {
      if (this.properties.mainComponent && !this.properties.mainComponent.contains(this)) {
        this.properties.mainComponent = null;
      }

      if (this.properties.parentComponent && !this.properties.parentComponent.contains(this)) {
        this.properties.parentComponent = null;
      }
      this.properties._internalState.onDetachCalled = true;
    },
  },

  /**
   * MIXIN HOOK: Add a `onDestroy` method to your component which will be called when your component has been removed fromt the DOM.
   *
   * Use this instead of the WebComponents `detachedCallback` as some
   * boilerplate code needs to be run (this code will shut off all event listeners the widget has setup).
   *
   * Your `onDestroy` callback will run after the node has been removed from the document
   * for at least 10 seconds.  See the `layer-widget-destroyed` event to prevent the widget from being destroyed after removing
   * it from the document.
   *
   * @method onDestroy
   * @private
   */
  onDestroy: function onDestroy() {
    this.properties._internalState.onDestroyCalled = true;
    this.properties._internalState.disableSetters = true;
    this.properties._layerEventSubscriptions
      .forEach(subscribedObject => subscribedObject.off(null, null, this));
    this.properties._layerEventSubscriptions = [];
    this.classList.add('layer-node-destroyed');
  },
};

function registerMessageComponent(tagName, componentDefinition) {
  const handlesMessage = componentDefinition.methods.handlesMessage;
  const label = componentDefinition.properties.label.value;
  const order = componentDefinition.properties.order;
  registerComponent(tagName, componentDefinition);
  layerUI.registerMessageHandler({
    handlesMessage,
    tagName,
    label,
    order,
  });
}

module.exports = {
  registerComponent,
  registerMessageComponent,
  registerAll,
  unregisterComponent,
};


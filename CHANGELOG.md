# Layer UI for Web Change Log

## 1.0.8

* Updates prior fix to only trigger if `_isMainComponent` is `true`

## 1.0.7

* Redefines the `layer-widget-destroyed` event; it now triggers on `document.body` for each removed component; access `evt.detail.target` not `evt.target` to determine what UI Component has been removed and is about to be destroyed.

## 1.0.6

* Fixes React adaptor for React 16

## 1.0.5

* Attempts to fix special case where message list fails to scroll to the bottom in some environments that we are unable to actually replicate.

## 1.0.4

* Fixes bug where SEND button, on sending, fails to trigger a Composer resize
* Fixes bug where document.cloneNode generated dom nodes have doubled templates

## 1.0.3

* Fixes bug that prevents event handlers from being cleaned up once a component is removed from the page

## 1.0.2

* Possibly Breaking Changes
  * If you use textHandlers to push `textData.afterText` items to render, these items now render outside of the chat bubble.  This shouldn't break most CSS themes, but if you use this feature, please test and review how these render.
  * The `layer-conversation-selected` and `onConversationSelected` events no longer come with `event.detail.originalEvent`, and now trigger events regardless of whether a selection is done by the user clicking or by your app setting `conversationList.selectedId = conversationId`

* Adds component template info to the API Reference
* Better support for Previewing a message before its sent:
  * Use `message.presend()` instead of `message.send()` to see a preview of a message in the Message List without sending it
  * MessageHandlers will now call `onRender` instead of `onRerender` when there is a change to a message that has not been sent
* Adds the `isMessageListItem` property to `<layer-message-item-sent />` and `<layer-message-item-received />`
* Text renderers:
  * On processing text handlers, `isMessageListItem` will be passed as an argument, allowing you to skip rendering some content
    if we are NOT in a Message List (i.e. a `layer-notifier`, or the Last Message of a `<layer-conversation-item />`
  * Text renderers that add an `afterText` will ONLY have `afterText` rendered for MessageListItems even if your app tries to populate them elsewhere.
  * Text renderers `afterText` will get unique CSS classes based on the handler name: `layer-message-text-plain-${handlerName}`
* File Upload widget now has an `accept` attribute; see https://www.w3schools.com/tags/att_input_accept.asp for usage
* Adds `endOfMessagesNode` to `<layer-conversation-panel />` allowing for a customizable message to be displayed when the user
  has scrolled/paged to the top of a conversation, and there are no more messages to load.
* Adds `dataLoadingNode` to all lists allowing for a customizable message to be displayed when the data is being paged in.
* #21: Fixes error where `registerMessageComponent` isn't exposed by the `layerUI` object.
* All list widgets now have a `scrollToItem(item)` method for scrolling to a specified Message, Conversation, Identity, etc...
* Adds an onDestroy state, and some sanity checks around `widget.properties._internalState.onDestroyCalled` to ignore calls executed on destroyed widgets
* Adds mocks to simplify tests involving requestAnimationFrame on scrolling
* `<layer-identities-list />` now uses `onclick` instead of `onchange` events

## 1.0.1

* No longer requires client to be available on `layerUI.init()`; now waits for client to be available
* Adds safety check to `layer-typing-indicator`
* Conversation List `sortBy` is now used for initialization only and does not update the query

## 1.0.0

* Breaking Changes
    * Conversation List now defaults to being sorted by `lastMessage` rather than `createdAt`; change this using the Conversation List `sortBy` property.

GA Release of Layer UI for Web

* The `<layer-presence />` widget is now enabled, as long as you run this with Layer WebSDK 3.2; this is automatically added to all `<layer-avatar />` widgets.
* `<layer-notifier />` now has a `notifyInTitlebar` to enable/disable putting unread indicators in
  your web page's titlebar.
* You can now call `layerUI.registerMessageComponent` in place of separately calling `layerUI.registerComponent` and `layerUI.registerMessageHandler`
* All components now have a `parentComponent` property; similar to `parentNode` but references the Webcomponent
  whose template caused this widget to be created.
* All components now have a `mainComponent` property pointing at the root webcomponent that caused them to be added to the page.
* All components now automatically propagate the `layer.Client` property to all children
* `<layer-composer />` now can work without a conversation by triggering events on send, without actually sending.
* `<layer-conversation-panel />` now has a `disable` property; use it to disable read receipts from being sent when this widget is hidden.
* Emojis now use http/https to load emoji images based on your web application's protocol
* Adds support for a `listen-to` attribute to remove the need for boiler plate code to wire events from one widget to the next
  * Conversation Panel if listening to a Conversation List will change conversation whenever there is a selection event
  * Conversation Panel if listening to a Notifier widget will show any Conversation for any notification the user has clicked on
* Adds ConversationPanel property `initialConversationId` for setting an initial Conversation; changes to this value do not
  affect the widget.  This property works well when using `listen-to` to change conversations, but still want an initial conversation.

## 0.10.1

* Bug Fixes
  * First message in conversation now has `layer-list-item-first` css class which was missing.
  * `<layer-delete />` widgets should have been hidden if deletion was not enabled
  * Can now set `ConversationPanel.conversation = null` to clear the conversation
  * Restores the missing `ConversationPanel.getMessageDeleteEnabled` callback to enable the delete button on a per-message basis

## 0.10.0

### Breaking Changes

* Events that previously had properties such as `evt.detail.conversation`, `evt.detail.message`, `evt.detail.identity`
  now just use `evt.detail.item`

### Bug fixes

* Fixes bug in image renderer that caused it to call the out-dated `_render` method instead of `onRender`
* Previously Main Components that use Queries would generate a Query automatically after waiting 50ms
  to see if the app was going to provide it a Query.  Now the Main Components automatically and promptly generate their own Query.
  If you are providing your own query, initialize the widget with `useGeneratedQuery=false`.
* Calling `query.update({...})` will now reapply any `filter` property you've applied to your list.

### For Defining Custom Components:

* Adds `message-handler.js` mixin for easier Card creation; accessed via `layerUI.mixins.MessageHandler`
* Adds support for a `template` property that takes a String or `<template />` in `layerUI.registerComponent`
* Restores use of property definition ordering to insure that `app-id` setter can set a `client` prior to other setters triggering
* Insures that setters get called only once per value prior to `onAfterCreate`
* Adds `noGetterFromSetter` to property definitions to pevent getter from being called
  every time the setter is called.  Used for getters that do more than just return a value (i.e. use a REST API call to get a value).
* Adds `layer-message-text-plain-has-after-text` css class to any text-message renderer that adds an `afterText`


### Refactoring

* Added `list-selection` and `list-item-selection` mixins, and removed selection code from `layer-conversation-list`.
* Added `has-query` mixin, migrated functionality for managing a `query`, `query-id`, `hasGeneratedQuery` property into the new mixin.

### Misc

* Adds support for a `LayerConversationPanel.composeButtonsLeft` which adds a panel of buttons to the left of the Composer;
  can be used on conjunction with `LayerConversationPanel.composeButtons` which adds a panel of buttons to the right of the Composer.
* Adjust React Adaptor to insure widget is fully initialized before `didComponentMount` is called within your app.
* Adds version check to insure compatible version of websdk is included.
* Changes to UI Framework Adapters:
  * SendButton and FileUploadButton are now Main Components that can be accsessed via all of the adapters.
  * React now accepts a React Component instead of a DOM node for most properties that expect a DOM node.
* Adds Coverage test process and better test coverage.
* Adds saucelabs test integration.
* Adds matrix of supported browser to README.md
* Font size set to 16px for all inputs in all themes to prevent IOS Zooming

### Preview Features

These features currently require access to our Preview Server, but should be available in production in the near future:

* Adds Channel support: `<layer-channels-list />` and `<layer-membership-list />`
* Adds `<layer-presence />` widget, which is now built into `<layer-avatar />`

## 0.9.13

* Fixes another bug in how Angular Adapater worked with Webcomponents lifecycle within Webcomponents Polyfil

## 0.9.12

* Fixes bug in how Angular Adapater worked with Webcomponents lifecycle within Webcomponents Polyfil

## 0.9.11

Fixes issue where client property is lost causing widgets to stop performing actions.

## 0.9.10

* `layerUI.init()` no longer expects a `layer` property
* Build and dependencies are better organized
* `index.js` still loads all dependencies, but `layer-ui.js` can be used to load
   only the framework, and the widgets you need can be loaded via `require` or `import`.
* `layerUI.settings.customComponents` is no longer needed to prevent a component from being defined; instead either:
  * Overwrite the definition with `layerUI.registerComponent()` before calling `layerUI.init()`
  * Call `layerUI.removeComponent('layer-avatar')` before calling `layerUI.init()` to prevent the definition from being applied.
* A class that only exists in Layer WebSDK 3.1.0 and up is tested for in this release; do not use older versions of the WebSDK.

## 0.9.9

* Updates needed to work with Layer WebSDK 3.1.0

## 0.9.8

* Customizability Improvements
  * Standardizes and documents widget lifecycle
  * Adds mixin support to enable apps to customize widgets and hook into lifecycle methods
* Flux Architecture support
  * Provides a `state` property that is propagated to subcomponents
  * Any change to `state` will call the `onRenderState()` method for the widget and all of its subcomponents.
  * `state` can be used to write both application state as well as actions that widgets should be able to call.  Calling such actions are called by your mixins that enhance the widget.
* The Message Item widget `<layer-message-item />` with its CSS class of `layer-message-item-sent` or `layer-message-item-received` is removed.
  * Added `<layer-message-item-sent />` widget
  * Added `<layer-message-item-received />` widget
  * Removed support for a widget to have multiple templates to pick from
  * Apps that customized `layer-message-item` template or widget should now customize `layer-message-item-sent` or `layer-message-item-received` instead.
  * Any custom CSS will need to be updated from `layer-message-item.layer-message-item-received` to just `layer-message-item-received`.


## 0.9.6

* Build Fixes
  * Fixes the missing `layerUI.registerComponent` method
  * Fixes missing `themes/build` folder in `npm` distribution
  * Fixes missing `build/*.js` folder in `npm` distribution
* Composer Enhancements
  * Adds a Send button
  * Adds a `ConversationPanel.send()` method to let apps send the contents of the Composer.
  * Updates design of the File Upload button
  * Adds `onComposerChangeValue` property / `layer-composer-change-value` event to the `ConversationPanel` widget.
  * Triggers a `layer-composer-change-value` event when the input changes; this helps Flux architectures to put the current value into their state.
* Adds Message parameter to the registerTextHandler callback arguments
* Fixes backbone adapter; which had errors from the introduction of ES6 syntax
* Fixes to `emptyMessageListNode` to handle rerendering better
* Theming
  * Moves most of the CSS for Layer Avatars from the template to the theme
  * Some cleanup and reworking of themes and theme variables

## 0.9.5

* Adds `composePlaceholder` property to `<layer-conversation-panel>` to control the composer's placeholder property
* Adds `emptyMessageListNode` property to `<layer-conversation-panel>` to render custom dom when the current conversation has no messages
* Theme updates
* Private properties/methods now use `_`
* Fixes '<layer-conversation-panel/>' handling of `conversationId` for unauthenticated client
* Fixes setter usage of `newValue`, `oldValue` in various setters.
* Removes (for now) `listWidth` and `listHeight` properties that are passed to List Items to help optimize rendering.
  Switches to CSS based resizing.  Primarily for Images.  See instaed `LayerUI.settings.maxSizes`.
* Fixes issue in `DragAndDropFileWatcher` that caused compiler to miscompile

## 0.9.4

* Fixes bug using the appId passed into `layerUI.init()`
* Full es6 conversation, babel compile, and eslintification of code base
* Adds verification that appId refers to a Client
* Adds a Date Separator component
* Now uses `!conversation.lastMessage.isRead` instead of `conversation.unreadCount` for flagging a conversation as unread
* Refactoring of method and property names to underscore prefix private names
* JSDoc cleanup

## 0.9.1, 0.9.2, 0.9.3

* npm unpublish is a problem

## 0.9.0

* Early Beta Released!
* Updated Changelog!

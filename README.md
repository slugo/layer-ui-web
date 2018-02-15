# Layer UI for Web

## Just Starting?

Use our new XDK! The XDK enables a richer messaging experience and new features will be added there. See the repository at [https://github.com/layerhq/web-xdk](https://github.com/layerhq/web-xdk). Don't worry, Layer UI for Web is still supported.


## Browser Support Matrix:

| Browser          | Version    | OS Tested Against  |
|------------------|------------|--------------------|
| Internet Explorer| 11.0       | Windows 8.1        |
| Edge             | 13.0       | Windows 10         |
| Edge             | 14.0       | Windows 10         |
| Safari           | 10.0       | OSX 10.12          |
| Safari           | 9.0        | OSX 10.11          |
| Safari (IOS)     | 9.x        | IOS 10.0           |
| Safari (IOS)     | 10.0       | IOS 9.3            |
| Chrome           | 55         | OSX 11.0           |
| Chrome           | 48         | Linux              |
| Firefox          | 51         | OSX 11.0           |
| Firefox          | 50         | Windows 8          |

Older versions of Safari do not support Websockets and will not work with the Layer WebSDK.


## Introduction

The Layer UI for Web provides a library of widgets to simplify adding chat capabilities into your application.

It is implemented using the [Webcomponents Polyfill](https://github.com/WebComponents/webcomponentsjs); in particular, this project uses the "light" version of the polyfill which means we do not use Shadow Dom.

## Why use Layer UI?

1. It handles a lot of capabilities for you:
  * Sends read receipts on any message that has scrolled into view, and remained visible for 2.5s
  * Sends typing indicators to other participants
  * Renders typing indicators from other participants
  * Pages your queries as the user scrolls
  * Handles a variety of common text processing tasks (emoticons for example), and provides plugins for adding more
  * Handles a variety of Message Types and provides plugins for adding more
2. It is highly customizable
  * You may replace a stylesheet for a given widget with your own stylesheet
  * You may replace the HTML Template for a given widget with your own template
  * You may replace an entire widget class with your own definition of that class

You can build all these things on your own using only [Layer WebSDK](https://github.com/layerhq/layer-websdk); but that shifts a lot more development and maintenance onto you.

## Beta Release

This is a Beta Release.  We welcome feedback, and look forwards to working with customers who have issues.

Feedback can be sent via https://github.com/layerhq/layer-ui-web/issues

## Installation

Layer UI for Web depends upon the [Layer WebSDK](https://github.com/layerhq/layer-websdk), and provides an `init` method for providing a Layer Client,
as well as access to the WebSDK library itself.  How to use this depends on your installation method.

Note that if you do not have an `appId` at the time you call `init()` you can instead pass `app-id` attributes into each widget you use.

### CDN

```html
<script src='https://cdn.layer.com/sdk/3.2/layer-websdk.min.js'></script>
<script src='https://cdn.layer.com/ui/1.0/layer-ui-web.min.js'></script>
<link rel='stylesheet' href='https://cdn.layer.com/ui/1.0/themes/bubbles-basic.css' />
<script>
window.layerUI.init({
  appId: 'layer:///apps/staging/UUID'
});
</script>
```

Alternatively, a separate theme and templates can be loaded using:

```html
<link rel='stylesheet' href='https://cdn.layer.com/ui/1.0/themes/groups-basic.css' />
<!-- This file can be copied from https://cdn.layer.com/ui/1.0/themes/groups-basic-templates.html but
     generates CORS errors if loaded directly from CDN -->
<link rel='import' href="groups-basic-templates.html">
```

> Note: Using a custom template must access this package from the `window` object; as such, regardless of what module system you use, the default
build will assign `window.layerUI` to this package.

More information on creating/customizing themes is in the [Themes](CUSTOMIZATION.md#themes) section.

The following themes are available:

* https://cdn.layer.com/ui/1.0/themes/bubbles-basic.min.css
* https://cdn.layer.com/ui/1.0/themes/bubbles-compact.min.css
* https://cdn.layer.com/ui/1.0/themes/groups-basic.min.css

### NPM

```console
npm install layer-websdk layer-ui-web --save
```

```javascript
var layer = require('layer-websdk');
var layerUI = require('layer-ui-web');
layerUI.init({
  appId: 'layer:///apps/staging/UUID'
});
```

If you have your own babel build process, you may prefer to take es6 classes as input:

```javascript
var layer = require('layer-websdk/index-es6');
var layerUI = require('layer-ui-web/lib-es6/index');
layerUI.init({
  appId: 'layer:///apps/staging/UUID'
});
```


```html
<link rel='stylesheet' href='node_modules/layer-ui-web/themes/build/groups-basic.css' />
<link rel='import' href="node_modules/layer-ui-web/themes/build/groups-basic-templates.html">
```

The following themes are available:

* node_modules/layer-ui-web/themes/build/bubbles-basic.min.css
* node_modules/layer-ui-web/themes/build/bubbles-compact.min.css
* node_modules/layer-ui-web/themes/build/groups-basic.min.css

### Install from Github

Clone the repo, install dependencies and build it:

```console
git clone git@github.com:layerhq/layer-ui-web.git
cd layer-ui-web
npm install
grunt
```

```html
<script src='https://cdn.layer.com/sdk/3.2/layer-websdk.min.js'></script>
<script src='layer-ui-web/build/layer-ui-web.min.js'></script>
```

## Reference

A full API reference for all widgets can be seen at:

* [Beta API Reference](http://static.layer.com/layer-ui-web-beta/docs/)

## Using the Widget Library

Using the Widget Library is as simple as adding an html tag to your page.  The following would generate a suitable
UI assuming some CSS to size and position the widgets:

```html
<html>
  <head>
    <script src='http://cdn.layer.com/sdk/3.2/layer-websdk.min.js'></script>
    <script src='https://cdn.layer.com/ui/1.0/layer-ui-web.min.js'></script>

    <!-- Code for instantiating a layer.Client and authenticating it: -->
    <script src='my-client-initializer.js'></script>
    <script>
      layerUI.init({appId: 'layer:///apps/staging/UUID'});
    </script>
  </head>
  <body>
    <layer-identities-list></layer-identities-list>
    <layer-conversations-list></layer-conversations-list>
    <layer-conversation-panel ></layer-conversation-panel>
  </body>
</html>
```

Using a Webcomponent Polyfill and implementation means that you can _also_ create an element simply with:

```javascript
var conversationWidget = document.createElement('layer-conversation-panel');
document.body.appendChild(conversationWidget);
```

## The Widget library

There are many widgets in this framework, but mostly you only need to work with the Main Components; these are high level widgets that wrap and manage a set of subcomponents.  Typically you would not directly interact with the subcomponents.

* `<layer-conversation-panel />`: Manages a message list, a typing indicator panel, and a compose bar for typing a message
  * This could be your entire UI, a single `layer-conversation` widget hardcoded to a single conversation with a customer support user; no other widgets needed.
  * The key property for this widget is `conversationId` (or used as an attribute: `conversation-id`), which lets you configure which Conversation its being used to interact with.
* `<layer-conversations-list />`: Manages a Conversation List
  * Use this to present a list of Conversations, and use the `layer-conversation-selected` event to set the `layer-conversation` `conversationId` property to render the selected Conversation.
* `<layer-identities-list />`: Manages a User list
  * Use this to present a list of users to create a Conversation with, and when your user selection is done, you can call `var conversation = myLayerClient.createConversation({ participants: [list.selectedUsers] }); myConversationPanel.conversationId = conversation.id;`
* `<layer-notifier />`: Creates desktop and toast notifications for new messages

See the [API Documentation](http://static.layer.com/layer-ui-web-beta/docs/) for more information on the parameters of each of these widgets.

## Customizing the Widgets

A primary goal of this library is ease of customization so that both look-and-feel as well as behaviors can match
your design goals.  The main customization mechanisms include:

* Events: listen for events use them to override default handling of events with your custom handling of events
* Themes: select from pre-built themes, or provide your own
* Custom Templates: Change the layout/structure of a widget by providing custom html templates for widgets
* Custom Components: Replace entire widget definitions with your own widget definitions

See [CUSTOMIZATION.md](CUSTOMIZATION.md) for more details.

## Design Philosophy

1. Main Components which may get their properties set via attributes must have a means of accepting complex properties as strings.  This is done for example by accepting a `query-id` rather than a `query`, or an `app-id` instead of a `client`.  Booleans need to accept the string "false" and "0" as `false`.  Strings representing strings may need to be *evaled*.
2. Subcomponents will get their properties via DOM  manipulation, and not via attributes, and therefore do not need to expose properties such as `query-id` when `query` will suffice.
3. There is a trade-off between performance and customizability when defining a tiny subcomponent such as `<layer-date />` that must be created and rendered repeatedly.  But by abstracting date into its own widget, a developer can easily replace `<layer-date />` with a custom component without any changes to the parent components.  Customizability as long as performance doesn't cause noticable problems is worth pursuing.

## Future Work

* This project does not use Shadow Dom due to performance implications of the Shadow Dom polyfill.  The Shadow Dom API provides an ideal
mechanism for passing subcomponents such as buttons for the composer, and other custom elements as inputs.  Currently, this can only be done
via dom manipulation; even in the case of `ConversationPanel.composeButtons` one must dom create elements,
put them in an array and then set `composeButtons` to refer to them.  This is especially bad in React.  A better mechanism should be discussed,
and implemented.
* Inclusion of standard dom nodes that go between messages, such as Date headers, Headers indicating "read up to here", etc...  For now we just include the capability to build your own.
* Border radius on the you-tube embedded iframe is pretty sketchy during initialization of the Player

## Modifying the Code

The biggest problem likely to be encountered while editing this code is if you try using `npm link` to test your changes with your code.

1. Your code presumably depends upon `node_modules/layer-websdk`
2. `npm link` will convince `browserify` and `webpack` that `layer-ui-web/node_modules/layer-websdk` is something totally different from `node_modules/layer-websdk` and will include two copies of the WebSDK in your build.  These two will not talk to each other. Your app will then fail.

Solution: For each project you want to try with your in-development-code:

1. `cd my-project` -- Go to your project
1. `npm install layer-ui-web` -- This will install layer-ui-web into your project, and all of its dependencies.
1. `rm -rf node_modules/layer-ui-web` -- This removes the npm repo, but leaves all of its dependencies within your `node_modules` folder
1. Edit `layer-ui-web/npm-link-projects.json` to contain an array of paths to projects; add the project: `['../my-project']`
1. Run `grunt develop`
1. Each time you change the code, your changes will be copied over into your projects.

At no time is it OK to use `npm link` which will introduce errors; the `grunt watch` will replace `npm link`.

## Testing & Development

Other than dealing with issues around `npm link`, development is done as follows:

1. `grunt develop` will startup `grunt watch` and startup a server for running tests
1. Changes will build a test build file in `test/layer-ui-web-test.js` that includes both the WebSDK and Layer UI.
1. Tests are run on `http://localhost:8004/test/SpecRunner.html`

## Coverage Tests

To run coverage tests:

1. `grunt coverage` will overwrite `test/layer-ui-web-test.js` with an instrumented version of the build file
1. Run tests on `http://localhost:8004/test/SpecRunner.html`
1. Open the javascript console and modify the test results with:
```
Object.keys(__coverage__).forEach(key => {
    var newKey = key.replace(/^.*?lib-es5/, '');
    newKey = newKey.replace(/components\/.*\//, "components/");
    var parts = newKey.split(/\//);
    if (parts[parts.length-2] + '.js' == parts[parts.length-1]) {
        parts.splice(parts.length-2, 1);
    }
    if (parts.length > 2 || parts[1] == 'base.js') {
        newKey = parts.join('/');
        __coverage__[newKey] = __coverage__[key];
    }
    delete __coverage__[key];
})
```
1. Copy the results with `copy(JSON.stringify(__coverage__))`
1. Paste the results into `coverage/coverage.json`
1. Run the report generation tool with `istanbul report --root coverage --dir coverage/report html`
1. Open the report with `open coverage/report/index.html`

> WARNING: `grunt develop` may overwrite your coverage-instrumented `test/layer-ui-web-test.js` file

## FUTURE WORK

* A widget should know who its parent component is, not just who its parentNode is.  A parentNode could be a `div`,
  but that widget was created from the template for `layer-xxx`, which is the parent component.
* There are properties that are passed to a widget solely for it to pass to its subcomponents.  There should be
  a way to identify for a child component that all of its properties be automatically exposed on the parent component.

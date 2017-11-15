import Layer from '@layerhq/layer-websdk';

import LayerUI from './lib-es6/index';

var APP_ID = 'layer:///apps/staging/2f1707c0-fd2f-11e6-ae72-c27751092ce1';
var PROVIDER_URL = 'https://layer-quickstart-michael.herokuapp.com';
var conversationPanel;

document.addEventListener('DOMContentLoaded', function() {
    conversationPanel = document.querySelector('layer-conversation-view');
    var uploadButton = document.createElement('layer-file-upload-button');
    uploadButton.accept = 'image/*';
    conversationPanel.composeButtons = [uploadButton];

    const ResponseModel = Layer.Client.getCardModelClass('ResponseModel');
    conversationPanel.queryFilter = function(message) {
        const rootPart = message.getPartsMatchingAttribute({ role: 'root' })[0];
        const model = rootPart ? client.createCardModel(message, rootPart) : null;
        if (model && model instanceof ResponseModel && message.sender === client.user) return false;
        return true;
    };

    var client = window.client = new Layer.Client({
      appId: APP_ID,
      isTrustedDevice: true
    });
    client.connect(localStorage.getItem('IDENTITY'));
    var first = true;
    client.on('challenge', function(evt) {
      var USER_ID = prompt('Enter Email Address');
      var PASSWORD = prompt('Enter Password');
      if (USER_ID && PASSWORD) {
        Layer.xhr({
          url: PROVIDER_URL + '/authenticate',
          headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
          },
          method: 'POST',
          data: {
            nonce: evt.nonce,
            email: USER_ID,
            password: PASSWORD,
          },
        }, function(res) {
          if (res.success && res.data.identity_token) {
            console.log('challenge: ok');

            evt.callback(res.data.identity_token);
            localStorage.setItem('IDENTITY', client.user.userId);
          } else {
            alert('Login failed; please check your user id and password');
          }
        });
      } else if (first) {
        first = false;
        alert('Well, now your going to have to reload');
      }
    });

    client.on('ready', function() {
      var presenceWidget = document.querySelector('layer-presence');
      presenceWidget.item = client.user;
      presenceWidget.onPresenceClick = function(evt) {
        if (client.user.status === Layer.Identity.STATUS.AVAILABLE) {
          client.user.setStatus(Layer.Identity.STATUS.BUSY);
        } else {
          client.user.setStatus(Layer.Identity.STATUS.AVAILABLE);
        }
      };

      var userNameDiv = document.querySelector('.user-name');
      userNameDiv.innerHTML = client.user.displayName || client.user.userId;
    });

    document.body.addEventListener('kill-arthur', function() {
      alert('Hah! Tis only a flesh wound!');
    });

    document.body.addEventListener('grant-grail', function() {
      alert('We\'ve already got one!');
    });
});



LayerUI.init({
  appId: APP_ID,
});

// document.addEventListener('layer-send-message', function(evt) {
//   if (evt.detail.parts[0].mimeType === 'text/plain' && evt.detail.parts.length === 1) {
//     evt.preventDefault();
//     const text = evt.detail.parts[0].body;
//     var matches = text.match(/(.*?):(.*)/) || ['', '', text];
//     new TextModel({
//       text: matches[2],
//       title: matches[1],
//     }).generateMessage(evt.detail.conversation, message => message.send());
//   }
// });

/* Demo Async Message Handler called Ipsum Lorem Handler; creates an <ipsum-lorum-handler /> node for any message containing "ipsum lorum" */
LayerUI.registerTextHandler({
  name: 'ipsum',
  handler: function(textData, message, isMessageListItemComponent) {
    if (isMessageListItemComponent) {
      var matches = textData.text.match(/ipsum lorem/);
      if (matches) {
        textData.afterText.push('<ipsum-lorem-handler></ipsum-lorem-handler>');
      }
    }
  }
});

/* Define the ipsum-lorum-handler Component; comes with message and messageWidget properties
  * refering to the layer.Message and the <layer-message-item-sent /> (or received) widget its associated with.
  * Height MUST be locked no later than the `onAfterCreate` call.  Content of unknown height is tricky, and must
  * allow for, or UI for expanding to full height.  We may build UI for expanding to full height in at some point.
  */
LayerUI.registerComponent('ipsum-lorem-handler', {
  style: 'ipsum-lorem-handler {height: 100px; display: flex; flex-direction: column; justify-content: center; overflow-y: auto;}',
  methods: {
    onAfterCreate() {
      layer.xhr({
        url: "https://baconipsum.com/api/?type=meat-and-filler&paras=1&start-with-lorem=1&format=text",
      }, this._processResult.bind(this));
    },
    _processResult(result) {
      setTimeout(function() {
        this.innerHTML = this.parentComponent.message.parts[0].body.replace(/ipsum lorem/, result.data);
      }.bind(this), 1000);
    },
  }
});

var presendMessage;
document.addEventListener('layer-send-message', function(evt) {
  if (presendMessage && evt.detail.parts[0].body === presendMessage.parts[0].body) {
    presendMessage.send();
    evt.preventDefault();
  }
});

document.addEventListener('layer-composer-change-value', function(evt) {
  var text = evt.detail.value;
  if (!text && presendMessage) {
    presendMessage.destroy();
    presendMessage = null;
  } else {
    if (!presendMessage) {
      presendMessage = conversationPanel.conversation.createMessage();
      presendMessage.addPart({mimeType: "text/plain", body: ""});
      presendMessage.presend();
    }
    presendMessage.parts[0].body = text;
  }
});


/**
 * The Layer Message List widget renders a scrollable, pagable list of layerUI.components.MessagesListPanel.Item widgets.
 *
 * This is designed to go inside of the layerUI.Conversation widget.
 *
 * This Component has two named templates:
 *
 * * `layer-message-item-sent`: Rendering for Messages sent by the owner of this Session
 * * `layer-message-item-received`: Rendering for Messages sent by other users
 *
 * Messages are organized into sets where a set starts with the first message from a given user, and ends when either
 * a different user sends a Message, or a long enough pause occurs.  Each Message will have firstInSeries/lastInSeries properties,
 * and these need to be maintained as new Messages are loaded, deleted, etc...
 *
 * ## Advanced Customization
 *
 * To enhance the Message List widget with new properties, methods and capabilities, you have two options:
 *
 * 1. Define a custom `<layer-message-list/>` widget; this works but your now entirely responsible for all of its
 *    behaviors, and can not easily integrate fixes and enhancements added to this repo. Defining components is discussed in
 *    layerUI.components.Component.
 * 2. Enhance the provided widget with Mixins.  Details of Mixins are described in layerUI.components.Component.
 *    Below illustrates an example of a mixin for modifying this widget.
 *
 *
 * The following example adds a search bar to the Message List
 *
 * ```
 * layerUI.init({
 *   appId: 'my-app-id',
 *   layer: window.layer,
 *   mixins: {
 *     'layer-message-list': {
 *       properties: {
 *         searchText: {
 *           value: '',
 *           set: function(value) {
 *             this.nodes.searchBar.value = value;
 *             this._runSearch();
 *           },
 *           get: function() {
 *             return this.nodes.searchBar.value;
 *           }
 *         }
 *       },
 *       methods: {
 *         // When the widget is created, setup/initialize our custom behaviors
 *         onCreate: function() {
 *           this.nodes.searchBar = document.createElement('input');
 *           this.nodes.searchBar.classList.add('custom-search-bar');
 *           this.nodes.searchBar.addEventListener('change', this._runSearch.bind(this));
 *           this.insertBefore(this.nodes.searchBar, this.firstChild);
 *         },
 *
 *
 *         // Whenver any messages are added/removed/changed, rerun our search
 *         onRerender: function() {
 *           if (this.searchText) this._runSearch();
 *         },
 *
 *         // Search is run whenver the user changes the search text, app changes the search text,
 *         // or new messages arrive that need to be searched
 *         _runSearch() {
 *           var searchText = this.searchText;
 *           Array.prototype.slice.call(this.childNodes).forEach(function(messageItem) {
 *             if (messageItem._isListItem) {
 *               var message = messageItem.item;
 *               if (message.parts[0].body.indexOf(searchText) === -1) {
 *                 messageItem.classList.remove('search-matches');
 *               } else {
 *                 messageItem.classList.add('search-matches');
 *               }
 *             }
 *           });
 *         }
 *       }
 *     }
 *   }
 * });
 * ```
 *
 * @class layerUI.components.MessagesListPanel.List
 * @extends layerUI.components.Component
 *
 * @mixin layerUI.mixins.EmptyList
 * @mixin layerUI.mixins.List
 * @mixin layerUI.mixins.ListLoadIndicator
 * @mixin layerUI.mixins.QueryEndIndicator
 */
import Layer from '@layerhq/layer-websdk';
import LayerUI from '../../../base';
import { registerComponent } from '../../../components/component';
import List from '../../../mixins/list';
import HasQuery from '../../../mixins/has-query'
import EmptyList from '../../../mixins/empty-list';
import ListLoadIndicator from '../../../mixins/list-load-indicator';
import QueryEndIndicator from '../../../mixins/query-end-indicator';
import '../layer-message-item-sent/layer-message-item-sent';
import '../layer-message-item-received/layer-message-item-received';
import '../layer-message-item-status/layer-message-item-status';
import '../../subcomponents/layer-start-of-conversation/layer-start-of-conversation';

// Mandatory delay between loading one page and the next.  If user is scrolling too fast, they'll have to wait at least (2) seconds.
const PAGING_DELAY = 2000;

registerComponent('layer-message-list', {
  mixins: [List, HasQuery, EmptyList, ListLoadIndicator, QueryEndIndicator],
  properties: {

    /**
     * Supplemental property which helps drive the welcome message
     *
     * @property {layer.Conversation}
     */
    conversation: {
      // Enables it to be made avaialble to any emptyNode, endOfConversation node, etc...  also over applies by writing to all Message Items too.
      propagateToChildren: true,
    },

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * messageListPanel.dateRenderer = function(message) {
     *    var date = message.sentAt;
     *    return date.toISOString();
     * };
     * ```
     *
     * @property {Function} [dateRenderer=null]
     */
    dateRenderer: {},

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * messageList.messageStatusRenderer = function(message) {
     *    return message.readStatus === layer.Constants.RECIPIENT_STATE.ALL ? 'read' : 'processing...';
     * };
     * ```
     *
     * @property {Function} [messageStatusRenderer=null]
     */
    messageStatusRenderer: {},

    /**
     * This iteration of this property is not dynamic; it will be applied to all future Conversation Items,
     * but not to the currently generated items.
     *
     * Use this to configure how dates are rendered.
     * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString for details
     * on the parameters that are supported by `toLocaleString`.
     *
     * There are four supported inputs
     *
     * * `today`: How to render dates that are today
     * * `week`: How to render dates that are not today, but within a 6 of today (note if today is
     *   wednesday, 1 week ago is also wednesday, and rendering `wednesday` would be confusing, so its 6 rather than 7 days.
     * * `default`: The default format to use
     * * `older`: The format to use for dates that are in a different year and more than 6 months in the past
     *
     * Example:
     *
     * ```
     * widget.dateFormat = {
     *    today: {"hour": "numeric", "minute": "numeric"},
     *    week: {"weekday": "short"},
     *    default: {"month": "short", "day": "2-digit"},
     *    older: {"month": "short", "year": "numeric"}
     * }
     * ```
     *
     * @property {Object}
     */
    dateFormat: {
      value: {
        today: { hour: 'numeric', minute: 'numeric' },
        week: { weekday: 'short', hour: 'numeric', minute: 'numeric' },
        older: { month: 'short', year: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' },
        default: { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' },
      },
    },

    /**
     * Provide a function that returns the menu items for the given Conversation.
     *
     * Note that this is called each time the user clicks on a menu button to open the menu,
     * but is not dynamic in that it will regenerate the list as the Conversation's properties change.
     *
     * Format is:
     *
     * ```
     * widget.getMenuOptions = function(message) {
     *   return [
     *     {text: "label1", method: method1},
     *     {text: "label2", method: method2},
     *     {text: "label3", method: method3}
     *   ];
     * }
     * ```
     *
     * @property {Function} getMenuOptions
     * @property {layer.Message} getMenuOptions.message
     * @property {Object[]} getMenuOptions.returns
     */
    getMenuOptions: {
      type: Function,
    },

    /**
     * Disable read receipts and other behaviors; typically used when the widget has been hidden from view.
     *
     * ```
     * widget.disable = true;
     * ```
     *
     * @property {Boolean}
     */
    disable: {
      set(value) {
        if (!value) {
          this.properties.stuckToBottom = true;
          this.scrollTo(this.scrollHeight - this.clientHeight);
          this._checkVisibility();
        }
      },
    },

    /**
     * If the user scrolls within this many screen-fulls of the top of the list, page the Query.
     *
     * If value is 0, will page once the user reaches the top.  If the value is 0.5, will page once the user
     * reaches a `scrollTop` of 1/2 `clientHeight`.
     *
     * @property {Number} [screenFullsBeforePaging=2.0]
     */
    screenFullsBeforePaging: {
      value: 2.0,
    },

    /**
     * Note that we provide default definitions of replaceable content here rather than in the
     * message item where it would have to be generated and then removed for each message item.
     *
     * @property
     */
    replaceableContent: {
      value: {
        messageRowLeftSide: function messageRowLeftSide(widget) {
          const item = widget.item;
          const rootPart = item.parts.filter(part => part.mimeAttributes.role === 'root')[0];
          if (rootPart) {
            const model = this.client.createCardModel(item, rootPart);
            if (model && model.constructor.cardRenderer === 'layer-carousel-card') return null;
          }

          if (item.sender.sessionOwner) {
            return null;
          } else {
            const div = document.createElement('div');
            div.classList.add('layer-replaceable-inner');
            const avatar = document.createElement('layer-avatar');
            avatar.size = 'small';
            avatar.showPresence = false;
            avatar.setAttribute('layer-id', 'avatar');
            div.appendChild(avatar);
            return div;
          }
        },
        messageRowRightSide: function messageRowRightSide(widget) {
          const item = widget.item;
          const rootPart = item.parts.filter(part => part.mimeAttributes.role === 'root')[0];
          if (rootPart) {
            const model = this.client.createCardModel(item, rootPart);
            if (model && model.constructor.cardRenderer === 'layer-carousel-card') return null;
          }

          const div = document.createElement('div');
          div.classList.add('layer-replaceable-inner');
          if (item.sender.sessionOwner) {
            const avatar = document.createElement('layer-avatar');
            avatar.size = 'small';
            avatar.showPresence = false;
            avatar.setAttribute('layer-id', 'avatar');
            div.appendChild(avatar);
          }
          const menu = document.createElement('layer-menu-button');
          menu.setAttribute('layer-id', 'menuButton');
          div.appendChild(menu);
          return div;
        },
        messageRowFooter: function messageRowFooter(widget) {
          const item = widget.item;
          const parentNode = document.createElement('div');
          parentNode.classList.add('layer-replaceable-inner');
          if (item.sender.sessionOwner) {
            const status = document.createElement('layer-message-status');
            status.setAttribute('layer-id', 'status');
            parentNode.appendChild(status);
          }
          const date = document.createElement('layer-date');
          date.setAttribute('layer-id', 'date');
          date.dateFormat = this.dateFormat;
          parentNode.appendChild(date);
          return parentNode;
        },
        messageRowHeader: function messageRowHeader(widget) {
          if (!widget.item.sender.sessionOwner) {
            const div = document.createElement('div');
            div.setAttribute('layer-id', 'sender');
            div.classList.add('layer-sender-name');
            return div;
          }
        },
      },
    },
  },
  methods: {
    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate() {
      if (!this.id) this.id = Layer.Util.generateUUID();

      // Init some local props
      this.properties.lastPagedAt = 0;
      this.properties.isSelfScrolling = false;
      this.properties.stuckToBottom = true;
      this.properties._checkVisibilityBound = this._checkVisibility.bind(this);

      window.addEventListener('focus', this.properties._checkVisibilityBound);
    },

    /**
     * Cleanup all pointers to self created by registering event handlers.
     *
     * @method onDestroy
     * @private
     */
    onDestroy() {
      window.removeEventListener('focus', this.properties._checkVisibilityBound);
    },

    /**
     * Tests to see if we should load a new page of data.
     *
     * 1. Tests scrollTop to see if we are close enough to the top
     * 2. Tests if we are already loading that page of data
     *
     * @method _shouldPage
     * @return {Boolean}
     * @private
     */
    _shouldPage() {
      const pagingHeight = Math.max(this.clientHeight, 300) * this.screenFullsBeforePaging;
      return this.scrollTop <= pagingHeight && this.scrollHeight > this.clientHeight + 1 && !this.isDataLoading;
    },

    /**
     * Handler is called whenever the list is scrolled.
     *
     * Scrolling is caused by user activity, OR by setting the `scrollTop`.
     * Typically, we want to stay `stuckToButton` so that any time new Messages arrive,
     * we scroll to the bottom to see them.  Any user scrolling however may disable that behavior.
     *
     * @method _handleScroll
     * @private
     */
    _handleScroll: {
      mode: registerComponent.MODES.OVERWRITE,
      value() {
        if (this.properties.isSelfScrolling) return;

        // If the user has scrolled within screenFullsBeforePaging of the top of the page... and if the page has enough contents to actually
        // be scrollable, page the Messages.
        if (this._shouldPage() && !this.properties.delayedPagingTimeout) {
          if (this.properties.lastPagedAt + PAGING_DELAY < Date.now()) {
            if (!this.query.isFiring) {
              this.query.update({ paginationWindow: this.query.paginationWindow + 50 });
              this.isDataLoading = this.properties.query.isFiring;
            }
          } else if (!this.properties.delayedPagingTimeout) {
            // User is scrolling kind of fast, lets slow things down a little
            this.properties.delayedPagingTimeout = setTimeout(() => {
              this.query.update({ paginationWindow: this.query.paginationWindow + 50 });
              this.isDataLoading = this.properties.query.isFiring;
              this.properties.delayedPagingTimeout = 0;
            }, 500);
          }
        }

        // If we have scrolled to the bottom, set stuckToBottom to true, else false.
        const stuckToBottom = this.scrollHeight - 10 <= this.clientHeight + this.scrollTop;
        if (stuckToBottom !== this.properties.stuckToBottom) {
          this.properties.stuckToBottom = stuckToBottom;
        }

        // Trigger checks on visibility to update read state
        this._checkVisibility();
      },
    },

    /**
     * Scroll the list to the specified Y position in pixels.
     *
     * Will call _checkVisibility() when done.
     *
     * ```
     * widget.scrollTo(500);
     * ```
     *
     * @method scrollTo
     * @param {Number} position
     */
    scrollTo: {
      mode: registerComponent.MODES.OVERWRITE,
      value(position) {
        if (position === this.scrollTop) return;
        this.properties.isSelfScrolling = true;
        this.scrollTop = position;
        setTimeout(() => {
          this.properties.isSelfScrolling = false;
          this._checkVisibility();
        }, 200);
      },
    },

    /**
     * Scrolls the list to the specified Y position.
     *
     * Will call _checkVisibility() when done.
     *
     * ```
     * widget.animatedScrollTo(500);
     * ```
     *
     * @method animatedScrollTo
     * @param {Number} [animateSpeed=200]   Number of miliseconds of animated scrolling; 0 for no animation
     * @param {Function} [animateCallback] Function to call when animation completes
     */
    animatedScrollTo: {
      mode: registerComponent.MODES.OVERWRITE,
      value(position, animateSpeed = 200, animateCallback) {
        if (position === this.scrollTop) return;
        this.properties.isSelfScrolling = true;
        if (this.properties.cancelAnimatedScroll) this.properties.cancelAnimatedScroll();
        const cancel = this.properties.cancelAnimatedScroll = LayerUI.animatedScrollTo(this, position, animateSpeed, () => {
          // Wait for any onScroll events to trigger before we clear isSelfScrolling and procede
          setTimeout(() => {
            if (cancel !== this.properties.cancelAnimatedScroll) return;
            this.properties.cancelAnimatedScroll = null;

            this.properties.isSelfScrolling = false;
            this._checkVisibility();
            if (animateCallback) animateCallback();
          }, 100);
        });
      },
    },

    /**
     * Check which Messages are fully visible, and mark them as Read.
     *
     * TODO PERFORMANCE: Should be able to skip to the visible items and near-visible items without iterating over entire list
     *
     * NOTE: Only mark messages as read if the document has focus.  Just being visible but not in focus does not give us
     * sufficient cause to assume the user has read it.
     *
     * TODO: At some point we may need to customize whether document.hasFocus() is required; in particular, this could cause problems for anyone
     * running in an iFrame.  Is top.document.hasFocus() a suitable solution, or are there scenarios where top might not even be accessable due to
     * being a different domain?
     *
     * @method
     * @private
     */
    _checkVisibility() {
      if (LayerUI.isInBackground() || this.disable) return;

      // The top that we can see is marked by how far we have scrolled.
      const visibleTop = this.scrollTop;

      // The bottom that we can see is marked by how far we have scrolled plus the height of the panel.
      const visibleBottom = this.scrollTop + this.clientHeight;
      const children = Array.prototype.slice.call(this.childNodes);
      children.forEach((child) => {
        const childOffset = child.offsetTop - this.offsetTop;
        if (childOffset >= visibleTop && childOffset + child.clientHeight <= visibleBottom) {
          if (child.properties && child.properties.item && !child.properties.item.isRead) {
            // TODO: Use a scheduler rather than many setTimeout calls
            setTimeout(() => this._markAsRead(child), LayerUI.settings.markReadDelay);
          }
        }
      }, this);
    },

    /**
     * Mark a the Message associated with this item as read.
     *
     * This method validates that the Message flagged as ready to be read by `_checkVisibility()` is
     * in fact still fully visible after the delay.
     *
     * @method _markAsRead
     * @private
     * @param {layerUI.components.MessagesListPanel.Item} child
     */
    _markAsRead(child) {
      if (LayerUI.isInBackground() || this.disable) return;

      const visibleTop = this.scrollTop;
      const visibleBottom = this.scrollTop + this.clientHeight;
      const childOffset = child.offsetTop - this.offsetTop;
      if (childOffset >= visibleTop && childOffset + child.clientHeight <= visibleBottom) {
        child.properties.item.isRead = true;
      }
    },

    /**
     * Append a Message to the document fragment, updating the previous messages' lastInSeries property as needed.
     *
     * @method _generateItem
     * @private
     */
    _generateItem(message) {
      const handler = LayerUI.getHandler(message, this);
      if (handler) {
        const rootPart = message.getPartsMatchingAttribute({role: 'root'})[0];
        let type;
        if (rootPart && rootPart.mimeType === 'application/vnd.layer.card.response+json') {
          type = 'layer-message-item-status';
        } else if (message.sender.sessionOwner) {
          type = 'layer-message-item-sent';
        } else {
          type = 'layer-message-item-received';
        }
        const messageWidget = document.createElement(type);
        messageWidget.id = this._getItemId(message.id);
        messageWidget.dateRenderer = this.dateRenderer;
        messageWidget.messageStatusRenderer = this.messageStatusRenderer;
        if (this.dateFormat) messageWidget.dateFormat = this.dateFormat;
        messageWidget._contentTag = handler.tagName;
        messageWidget.item = message;
        messageWidget.getMenuOptions = this.getMenuOptions;
        if (this.query.pagedToEnd && this.query.data.indexOf(message) === this.query.data.length - 1) {
          messageWidget.classList.add('layer-first-message-of-conversation');
        }
        return messageWidget;
      } else {
        return null;
      }
    },

    /**
     * Are the two Messages in the same Group?
     *
     * See LayerUI.settings.messageGroupTimeSpan to adjust the definition of Same Group.
     *
     * @method _inSameGroup
     * @private
     * @param {layer.Message} m1
     * @param {layer.Message} m2
     */
    _inSameGroup(m1, m2) {
      if (!m1 || !m2) return false;
      const diff = Math.abs(m1.sentAt.getTime() - m2.sentAt.getTime());
      return m1.sender === m2.sender && diff < LayerUI.settings.messageGroupTimeSpan;
    },

    /**
     * Whenever new message items are added to the list, we need to assign lastInSeries and firstInSeries values to them,
     * as well as update those values in nearby message items.
     *
     * @method _processAffectedWidgetsCustom
     * @private
     * @param {layerUI.components.MessagesListPanel.Item[]} widgets
     */
    _processAffectedWidgetsCustom(widgets, firstIndex, isTopItemNew) {
      if (widgets.length === 0) return;
      if (isTopItemNew) widgets[0].firstInSeries = true;
      for (let i = 1; i < widgets.length; i++) {
        const sameGroup = this._inSameGroup(widgets[i - 1].item, widgets[i].item);
        widgets[i].firstInSeries = !sameGroup;
        widgets[i - 1].lastInSeries = !sameGroup;
      }
      if (!widgets[widgets.length - 1].nextSibling) widgets[widgets.length - 1].lastInSeries = true;
    },

    _renderResetData: {
      mode: registerComponent.MODES.AFTER,
      value: function _renderResetData(evt) {
        this.properties.stuckToBottom = true;
        this.properties.lastPagedAt = 0;
        this.properties.isSelfScrolling = false;
      },
    },

    _renderWithoutRemovedData: {
      mode: registerComponent.MODES.OVERWRITE,
      value(evt) {
        this.properties.listData = [].concat(this.properties.query.data).reverse();

        const messageWidget = this.querySelector('#' + this._getItemId(evt.target.id));
        if (messageWidget) this.removeChild(messageWidget);

        const removeIndex = this.properties.listData.length - evt.index; // Inverted for reverse order
        const affectedItems = this.properties.listData.slice(Math.max(0, removeIndex - 3), removeIndex + 3);
        this._gatherAndProcessAffectedItems(affectedItems, false);
      },
    },

    _renderInsertedData: {
      mode: registerComponent.MODES.OVERWRITE,
      value(evt) {
        if (this.properties.appendingMore) {
          if (!this.properties.insertEvents) this.properties.insertEvents = [];
          this.properties.insertEvents.push(evt);
          return;
        }
        const oldListData = this.properties.listData;
        this.properties.listData = [].concat(this.properties.query.data).reverse();

        const insertIndex = oldListData.length - evt.index; // Inverted for reverse order
        const isTopItemNew = insertIndex === 0;

        const affectedItems = this.properties.listData.slice(Math.max(0, insertIndex - 3), insertIndex + 4);
        const fragment = this._generateFragment([evt.target]);
        if (insertIndex < oldListData.length) {
          const insertBeforeNode = affectedItems.length > 1 ?
            this.querySelector('#' + this._getItemId(oldListData[insertIndex].id)) : null;
          this.insertBefore(fragment, insertBeforeNode);
        } else {
          this.appendChild(fragment);
        }
        this._gatherAndProcessAffectedItems(affectedItems, isTopItemNew);
        this._updateLastMessageSent();
        if (this.properties.stuckToBottom) {
          setTimeout(() => this.animatedScrollTo(this.scrollHeight - this.clientHeight), 0);
        } else {
          this._checkVisibility();
        }
        if (!evt.inRender) this.onRerender();
      },
    },

    /**
     * The last message sent by the session owner should show some pending/read-by/etc... status.
     *
     * Other messages may also do this, but adding the `layer-last-message-sent` css class makes it easy
     * to conditionally show status only for the last sent message.
     *
     * TODO: Review if a CSS :last-child could isolate last message sent from last message received, and be used for easily styling this.
     *
     * @method _updateLastMessageSent
     * @private
     */
    _updateLastMessageSent() {
      for (let i = this.properties.listData.length - 1; i >= 0; i--) {
        if (this.properties.listData[i].sender.sessionOwner) {
          const item = this.querySelector('#' + this._getItemId(this.properties.listData[i].id));
          if (item && !item.classList.contains('layer-last-message-sent')) {
            this.querySelectorAllArray('.layer-last-message-sent').forEach((node) => {
              node.classList.remove('layer-last-message-sent');
            });
            item.classList.add('layer-last-message-sent');
          }
          break;
        }
      }
    },

    /**
     * Identify the message-item that is fully visible and at the top of the viewport.
     *
     * We use this before paging in new data so that we know which message should still
     * be at the top after we insert new messages at the top, and must compensate our `scrollTop`
     * accordingly.
     *
     * @method _findFirstVisibleItem
     * @private
     */
    _findFirstVisibleItem() {
      const visibleTop = this.scrollTop;
      const visibleBottom = this.scrollTop + this.clientHeight;
      const children = Array.prototype.slice.call(this.childNodes);
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const childOffset = child.offsetTop - this.offsetTop;
        if (childOffset >= visibleTop && childOffset + child.clientHeight <= visibleBottom) {
          if (child.properties && child.properties.item) {
            return child;
          }
        }
      }
      return null;
    },

    /**
     * Render a new page of data received from the Query.
     *
     * @method _renderPagedData
     * @private
     */
    _renderPagedData: {
      mode: registerComponent.MODES.OVERWRITE,
      value(evt) {
        if (evt.data.length === 0) {
          this.isDataLoading = this.properties.query.isFiring;
          if (this.query.pagedToEnd) {
            const firstItem = this.querySelectorAllArray('.layer-message-item')[0];
            if (firstItem && firstItem.item && firstItem.item === this.query.data[this.query.data.length - 1]) {
              firstItem.classList.add('layer-first-message-of-conversation');
            }
          }
          this._renderPagedDataDone([], null, evt);
          return;
        }

        // Set this so that if the user is clinging to the scrollbar forcing it to stay at the top,
        // we know we just paged and won't page again.
        this.properties.lastPagedAt = Date.now();

        // Get both the query data and the event data
        const oldListData = this.properties.listData;
        this.properties.listData = [].concat(this.properties.query.data).reverse();
        const newData = [].concat(evt.data).reverse();

        // Get the affected items
        let affectedItems = [].concat(newData);
        let fragment;
        if (oldListData.length) affectedItems = affectedItems.concat(oldListData.slice(0, 3));


        // Append only a few items at a time, with pauses to keep browser running smoothly.
        // Don't append anything to the document until its all generated
        // TODO: This sucks.  For 100 items, it takes 5 iterates of 20ms each, so it adds 100ms lag to render,
        // and the only good news is that this 100ms lag results in performance of the rest of the browser not degrading.
        const appendMore = function appendMore() {
          if (!this.query || this.query.isDestroyed) return;
          this.properties.appendingMore = true;
          const processItems = newData.splice(0, 20).filter(item => !item.isDestroyed);
          fragment = this._generateFragment(processItems, fragment);
          if (newData.length) {
            setTimeout(() => appendMore.call(this), 20);
          } else {
            this.properties.appendingMore = false;
            Layer.Util.defer(() => this._renderPagedDataDone(affectedItems, fragment, evt));
          }
        }.bind(this);
        appendMore();
      },
    },

    /**
     * After we have rendered the newly paged in messages, some post processing is needed.
     *
     * 1. Call processAffectedWidgets
     * 2. Scroll to maintain an appropriate position
     * 3. Insert the document fragment into our widget
     * 4. Check visibility on newly rendered items
     *
     * @method _renderPagedDataDone
     * @private
     */
    _renderPagedDataDone(affectedItems, fragment, evt) {
      if (!fragment) return; // called without fragment to trigger mixin versions of _renderPagedDataDone

      // Find the nodes of all affected items in both the document and the fragment,
      // and call processAffectedWidgets on them
      if (affectedItems.length) {
        const affectedWidgetsQuery = '#' + affectedItems.map(message => this._getItemId(message.id)).join(', #');
        let affectedWidgets = this.querySelectorAllArray(affectedWidgetsQuery);
        if (fragment) {
          const fragmentWidgets = Array.prototype.slice.call(fragment.querySelectorAll(affectedWidgetsQuery));
          affectedWidgets = fragmentWidgets.concat(affectedWidgets);
        }
        try {
          // When paging new data, top item should always be new
          this._processAffectedWidgets(affectedWidgets, true);
        } catch (e) {
          console.error(e);
        }
      }

      const firstVisibleItem = this._findFirstVisibleItem();
      const initialOffset = firstVisibleItem ?
        firstVisibleItem.offsetTop - this.offsetTop - this.scrollTop : 0;

      // Now that DOM manipulation is completed,
      // we can add the document fragments to the page
      const nextItem = this.nodes.listMeta.nextSibling;
      this.insertBefore(fragment, nextItem);

      // TODO PERFORMANCE: We should not need to do this as we page UP; very wasteful
      this._updateLastMessageSent();

      this.isDataLoading = this.properties.query.isFiring;
      this._checkVisibility();
      if (!evt.inRender) this.onRerender();

      if (this.properties.insertEvents) this.properties.insertEvents.forEach(anEvt => this._renderInsertedData(anEvt));
      delete this.properties.insertEvents;

      // more than just lastMessage
      if (this.query.data.length > 1) {
        Layer.Util.defer(() => this.onPagedData(firstVisibleItem, evt, initialOffset));
      }
    },

    /**
     * MIXIN HOOK: Replace this with your own customization if needed
     */
    onPagedData(firstVisibleItem, evt, initialOffset) {
      let needsPagedDataDone = true;

      if (this.properties.stuckToBottom) {
        const cards = this.querySelectorAllArray('layer-card-view').map(card => card.nodes.ui).filter(ui => ui);
        let unfinishedCards = cards.filter(card => !card.isHeightAllocated);
        if (unfinishedCards.length) {
          this.onPagedDataDone(false);
          const onCardFinished = () => {
            unfinishedCards = unfinishedCards.filter(card => !card.isHeightAllocated);
            if (unfinishedCards.length === 0) {
              this.removeEventListener('message-height-change', onCardFinished);
              setTimeout(() => this.onPagedDataDone(true), 10);
            }
          };
          this.addEventListener('message-height-change', onCardFinished);
          needsPagedDataDone = false;
        }
      } else if (firstVisibleItem && evt.type === 'data' && evt.data.length !== 0) {
        this.scrollTo(firstVisibleItem.offsetTop - this.offsetTop - initialOffset);
      }
      if (needsPagedDataDone) this.onPagedDataDone(true);
    },

    onPagedDataDone(isDoneSizingContent) {
      if (this.properties.stuckToBottom) {
        this.scrollTo(this.scrollHeight - this.clientHeight);
      }
    },
  },
});

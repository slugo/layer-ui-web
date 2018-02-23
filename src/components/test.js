describe('Components', function() {
  var el, testRoot, client, query;

  beforeAll(function(done) {
    if (layerUI.components['layer-conversation-panel'] && !layerUI.components['layer-conversation-panel'].classDef) layerUI.init({});
    setTimeout(done, 1000);
  });

  beforeEach(function() {
    jasmine.clock().install();
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
  });

  afterEach(function() {
    try {
      jasmine.clock().uninstall();
      document.body.removeChild(testRoot);
      layer.Client.removeListenerForNewClient();
    } catch(e) {}
  });

  describe("The Lifecycle and Mixin Methods", function() {
    it("Should call lifecycle methods in correct order", function() {
      // Setup
      var calls = [];
      layerUI.registerComponent('lifecycle-test', {
        properties: {
          prop1: {
            value: 55,
            set: function(inValue) {
              expect(this.properties.prop1).toEqual(inValue);
              expect(this.properties.prop1).toEqual(55);
              calls.push('prop1');
            }
          }
        },
        methods: {
          onCreate: function() {calls.push('onCreate');},
          onAfterCreate: function() {calls.push('onAfterCreate');},
          onAttach: function() {calls.push('onAttach');},
          onRender: function() {calls.push('onRender');},
          onDetach: function() {calls.push('onDetach');},
          onDestroy: function() {calls.push('onDestroy');}
        }
      });

      // Run create
      var el = document.createElement('lifecycle-test');
      testRoot.appendChild(el);
      CustomElements.takeRecords();
      layer.Util.defer.flush();
      layer.Util.defer.flush();

      expect(calls).toEqual(['onCreate', 'prop1', 'onAfterCreate', 'onRender', 'onAttach']);

      // Run removal
      testRoot.removeChild(el);
      CustomElements.takeRecords();
      layer.Util.defer.flush();
      expect(calls).toEqual(['onCreate', 'prop1', 'onAfterCreate', 'onRender', 'onAttach', 'onDetach']);

      jasmine.clock().tick(1000000);
      expect(calls).toEqual(['onCreate', 'prop1', 'onAfterCreate', 'onRender', 'onAttach', 'onDetach', 'onDestroy']);
    });

    it("Should call mixins in correct order", function() {
      // Setup
      var calls = [];
      var mixin1 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.AFTER,
            value: function() {
              calls.push('after');
            }
          }
        }
      };

      var mixin2 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.BEFORE,
            value: function() {
              calls.push('before');
            }
          }
        }
      };

      var mixin3 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.DEFAULT,
            value: function() {
              calls.push('middle1');
            }
          }
        }
      };

      var mixin4 = {
        methods: {
          onCreate: function() {
            calls.push('middle2');
          }
        }
      };

      layerUI.registerComponent('mixin-test1', {
        mixins: [mixin1, mixin2, mixin3, mixin4],
        methods: {
          onCreate: function() {
            calls.push('widget');
          }
        }
      });

      // Run
      var el = document.createElement('mixin-test1');
      testRoot.appendChild(el);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(calls).toEqual(['before', 'widget', 'middle1', 'middle2', 'after']);
    });

    it("Should call mixin overwrite only", function() {
      // Setup
      var calls = [];
      var mixin1 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.AFTER,
            value: function() {
              calls.push('after');
            }
          }
        }
      };

      var mixin2 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.BEFORE,
            value: function() {
              calls.push('before');
            }
          }
        }
      };

      var mixin3 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.OVERWRITE,
            value: function() {
              calls.push('overwrite');
            }
          }
        }
      };

      var mixin4 = {
        methods: {
          onCreate: function() {
            calls.push('middle2');
          }
        }
      };

      layerUI.registerComponent('mixin-test2', {
        mixins: [mixin1, mixin2, mixin3, mixin4],
        methods: {
          onCreate: function() {
            calls.push('widget');
          }
        }
      });


      // Run
      var el = document.createElement('mixin-test2');
      testRoot.appendChild(el);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(calls).toEqual(['overwrite']);
    });

    it("Should call method if overwrite allows", function() {
      // Setup
      var calls = [];
      var mixin1 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.AFTER,
            value: function() {
              calls.push('after');
            },
            conditional: function() {return true;}
          }
        }
      };

      var mixin2 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.BEFORE,
            value: function() {
              calls.push('before');
            },
            conditional: function() {return true;}
          }
        }
      };

      var mixin3 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.DEFAULT,
            value: function() {
              calls.push('middle1');
            },
            conditional: function() {return true;}
          }
        }
      };

      var mixin4 = {
        methods: {
          onCreate: function() {
            calls.push('middle2');
          }
        }
      };

      layerUI.registerComponent('mixin-conditional-test1', {
        mixins: [mixin1, mixin2, mixin3, mixin4],
        methods: {
          onCreate: function() {
            calls.push('widget');
          }
        }
      });

      // Run
      var el = document.createElement('mixin-conditional-test1');
      testRoot.appendChild(el);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(calls).toEqual(['before', 'widget', 'middle1', 'middle2', 'after']);

    });

    it("Should not call method if any overwrite returns false", function() {
      // Setup
      var calls = [];
      var mixin1 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.AFTER,
            value: function() {
              calls.push('after');
            },
            conditional: function() {return false;}
          }
        }
      };

      var mixin2 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.BEFORE,
            value: function() {
              calls.push('before');
            },
            conditional: function() {return true;}
          }
        }
      };

      var mixin3 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.DEFAULT,
            value: function() {
              calls.push('middle1');
            },
            conditional: function() {return true;}
          }
        }
      };

      var mixin4 = {
        methods: {
          onCreate: function() {
            calls.push('middle2');
          }
        }
      };

      layerUI.registerComponent('mixin-conditional-test2', {
        mixins: [mixin1, mixin2, mixin3, mixin4],
        methods: {
          onCreate: function() {
            calls.push('widget');
          }
        }
      });

      // Run
      var el = document.createElement('mixin-conditional-test2');
      testRoot.appendChild(el);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(calls).toEqual([]);
    });

    it("Should not call method if a standalone overwrite returns false", function() {
      // Setup
      var calls = [];
      var mixin1 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.AFTER,
            value: function() {
              calls.push('after');
            },
            conditional: function() {return false;}
          }
        }
      };

      var mixin2 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.BEFORE,
            value: function() {
              calls.push('before');
            },
            conditional: function() {return true;}
          }
        }
      };

      var mixin3 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.DEFAULT,
            value: function() {
              calls.push('middle1');
            },
            conditional: function() {return true;}
          }
        }
      };

      var mixin4 = {
        methods: {
          onCreate: {
            conditional: function() {return false;}
          }
        }
      };

      layerUI.registerComponent('mixin-conditional-test3', {
        mixins: [mixin1, mixin2, mixin3, mixin4],
        methods: {
          onCreate: function() {
            calls.push('widget');
          }
        }
      });

      // Run
      var el = document.createElement('mixin-conditional-test3');
      testRoot.appendChild(el);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(calls).toEqual([]);
    });

    it("Should make attributes available in onCreate", function() {
      var foundValue;
      layerUI.registerComponent('mixin-conditional-test4', {
        properties: {
          hasValue: {
            type: Number
          }
        },
        methods: {
          onCreate: function() {
            foundValue = this.hasValue;
          }
        }
      });

      // Run
      testRoot.innerHTML = '<mixin-conditional-test4 has-value="66"></mixin-conditional-test4>';
      var el2 = testRoot.firstChild;
      CustomElements.takeRecords();
      expect(foundValue).toEqual(66);
    });

    it("Should use default property values", function() {
      var setterCalled = false;
      layerUI.registerComponent('property-value-test1', {
        properties: {
          hasValue: {
            type: Number,
            value: 5,
            set: function() {
              setterCalled = true;
            }
          }
        }
      });

      var el1 = document.createElement('property-value-test1');
      expect(setterCalled).toBe(false);
      expect(el1.properties._internalState.onAfterCreateCalled).toBe(false);
      expect(el1.properties._internalState.disableSetters).toBe(true);

      layer.Util.defer.flush();
      CustomElements.takeRecords();

      expect(setterCalled).toBe(true);
      expect(el1.hasValue).toEqual(5);
      expect(el1.properties._internalState.onAfterCreateCalled).toBe(true);
      expect(el1.properties._internalState.disableSetters).toBe(false);
    });

    it("Should create new array from default property values", function() {
      var setterCalled = false;
      layerUI.registerComponent('property-value-test2', {
        properties: {
          hasValue: {
            value: [],
            set: function() {
              setterCalled = true;
            }
          }
        }
      });

      var el1 = document.createElement('property-value-test2');
      var el2 = document.createElement('property-value-test2');
      expect(setterCalled).toBe(false);

      layer.Util.defer.flush();
      CustomElements.takeRecords();

      expect(setterCalled).toBe(true);
      expect(el1.hasValue).toEqual([]);
      expect(el2.hasValue).toEqual([]);
      expect(el1.hasValue).not.toBe(el2.hasValue)
    });

    it("Should cast property setters before properties are resolved", function() {
      var setterCalled = false;
      layerUI.registerComponent('mixin-conditional-test5', {
        properties: {
          hasValue: {
            type: Number,
            set: function() {
              setterCalled = true;
            }
          }
        }
      });

      var el1 = document.createElement('mixin-conditional-test5');
      el1.hasValue = "55";
      expect(el1.hasValue).toEqual(55);
      expect(setterCalled).toBe(false);
      expect(el1.properties._internalState.onAfterCreateCalled).toBe(false);
      expect(el1.properties._internalState.disableSetters).toBe(true);

      layer.Util.defer.flush();
      expect(el1.hasValue).toEqual(55);
      expect(setterCalled).toBe(true);
      expect(el1.properties._internalState.onAfterCreateCalled).toBe(true);
      expect(el1.properties._internalState.disableSetters).toBe(false);
    });

    it("Should call setters in the designated order", function() {
      var calls = [];
      layerUI.registerComponent('mixin-ordering-test1', {
        properties: {
          prop10: {
            order: 10,
            value: 1,
            set: function() {
              calls.push(10);
            }
          },
          prop5: {
            order: 5,
            value: 1,
            set: function() {
              calls.push(5);
            }
          },
          prop15: {
            order: 15,
            value: 1,
            set: function() {
              calls.push(15);
            }
          },
          prop3: {
            order: 3,
            value: 1,
            set: function() {
              calls.push(3);
            }
          },
          prop35: {
            order: 35,
            value: 1,
            set: function() {
              calls.push(35);
            }
          },
          propX: {
            value: 1,
            set: function() {
              calls.push("X");
            }
          },
        }
      });

      var el1 = document.createElement('mixin-ordering-test1');

      layer.Util.defer.flush();
      expect(calls).toEqual([3, 5, 10, 15, 35, "X"]);
    });

    it("Should call setters only once", function() {
      var calls = [];
      layerUI.registerComponent('mixin-ordering-test2', {
        properties: {
          prop10: {
            order: 10,
            value: 1,
            set: function() {
              calls.push(10);
            }
          },
          prop5: {
            order: 5,
            value: 1,
            set: function() {
              calls.push(5);
              this.prop10 = this.prop10 + 1;
            }
          },
          prop15: {
            order: 15,
            value: 1,
            set: function() {
              calls.push(15);
            }
          },
          prop3: {
            order: 3,
            value: 1,
            set: function() {
              calls.push(3);
              this.prop5 = this.prop5 + 1;
            }
          },
          prop35: {
            order: 35,
            value: 1,
            set: function() {
              calls.push(35);
            }
          },
          propX: {
            value: 1,
            set: function() {
              calls.push("X");
            }
          },
        }
      });

      var el1 = document.createElement('mixin-ordering-test2');

      layer.Util.defer.flush();
      expect(calls).toEqual([3, 5, 10, 15, 35, "X"]);
    });

    it("Should not call the getter except from outside the setter if noGetterFromSetter", function() {
      var inGetter = false;
      layerUI.registerComponent('mixin-prop-test1', {
        properties: {
          prop10: {
            noGetterFromSetter: true,
            get: function() {
              inGetter = true;
              return 100;
            }
          }
        }
      });

      var el1 = document.createElement('mixin-prop-test1');
      el1.prop10 = 10;

      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(inGetter).toBe(false);
      var tmp = el1.prop10;
      expect(inGetter).toBe(true);
      expect(tmp).toEqual(100);
    });

    it("Should call mixin methods in the right order", function() {
      var results = [];
      var mixins = [
        {
          properties: {
            prop10: {
              mode: layerUI.registerComponent.MODES.AFTER,
              set: function() {results.push("mixin1");}
            }
          }
        },

        {
          properties: {
            prop10: {
              mode: layerUI.registerComponent.MODES.DEFAULT,
              set: function() {results.push("mixin2");}
            }
          }
        },

        {
          properties: {
            prop10: {
              mode: layerUI.registerComponent.MODES.BEFORE,
              set: function() {results.push("mixin3");}
            }
          }
        }
      ];

      layerUI.registerComponent('mixin-prop-test2', {
        mixins: mixins,
        properties: {
          prop10: {
            set: function() {results.push("widget");}
          }
        }
      });

      var el1 = document.createElement('mixin-prop-test2');
      el1.prop10 = 10;
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(results).toEqual(["mixin3", "widget", "mixin2", "mixin1"]);


      results = [];
      layerUI.registerComponent('mixin-prop-test3', {
        mixins: mixins.reverse(),
        properties: {
          prop10: {
            set: function() {results.push("widget");}
          }
        }
      });

      var el1 = document.createElement('mixin-prop-test3');
      el1.prop10 = 10;
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      // Results shouldn't be affected by mixin order, only by the mode property
      expect(results).toEqual(["mixin3", "widget", "mixin2", "mixin1"]);
    });



    it("Should support submixins without duplication", function() {
      var results = [];
      var submixin = {
        properties: {
          prop11: {
            set: function(value) {
              results.push("submixin: " + value);
            }
          }
        }
      };
      var mixins = [
        {
          mixins: [submixin],
          properties: {
            prop10: {
            }
          }
        },

        {
          properties: {
            mixins: [submixin],
            prop10: {
            }
          }
        },

        {
          properties: {
            mixins: [submixin],
            prop10: {
            }
          }
        }
      ];

      layerUI.registerComponent('mixin-prop-test4', {
        mixins: mixins,
        properties: {
        }
      });

      // Run test
      var el1 = document.createElement('mixin-prop-test4');
      el1.prop11 = 10;
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      // Posttest
      expect(results).toEqual(["submixin: 10"]);
    });

    it("Should propagate propagateToChildren properties", function() {
      var el1 = document.createElement('layer-conversation-panel');
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      // Run
      var client = new layer.Client({appId: "fred53"});
      el1.client = client

      // Posttest
      expect(layerUI.components['layer-conversation-panel'].properties.filter(function(prop) {
        return prop.propertyName === 'client'
      })[0].propagateToChildren).toBe(true);
      expect(el1.nodes.composer.client).toBe(client);
      expect(el1.nodes.typingIndicators.client).toBe(client);
      expect(el1.nodes.list.client).toBe(client);
      expect(el1.nodes.composer.nodes.buttonPanel.client).toBe(client);
      expect(el1.nodes.composer.nodes.buttonPanelLeft.client).toBe(client);

      // Run Test 2
      var client2 = new layer.Client({appId: "fred55"});
      el1.client = client2;

      // Posttest 2
      expect(layerUI.components['layer-conversation-panel'].properties.filter(function(prop) {
        return prop.propertyName === 'client'
      })[0].propagateToChildren).toBe(true);
      expect(el1.nodes.composer.client).toBe(client2);
      expect(el1.nodes.typingIndicators.client).toBe(client2);
      expect(el1.nodes.list.client).toBe(client2);
      expect(el1.nodes.composer.nodes.buttonPanel.client).toBe(client2);
      expect(el1.nodes.composer.nodes.buttonPanelLeft.client).toBe(client2);
    });

    it("Should propagate propagateToChildren properties to list items", function() {
      var client = new layer.Client({appId: "fred53"});
      client.user = new layer.Identity({
        client: client,
        userId: 'FrodoTheDodo',
        displayName: 'Frodo the Dodo',
        id: 'layer:///identities/FrodoTheDodo',
        isFullIdentity: true
      });
      client._clientAuthenticated();
      client._clientReady();
      var query = client.createQuery({model: layer.Query.Conversation});
      var el = document.createElement('layer-conversations-list');
      query.data = [
        client.createConversation({participants: ["a"]}),
        client.createConversation({participants: ["b"]}),
        client.createConversation({participants: ["c"]})
      ];

      // Run Test 1
      var testState1 = {hey: "ho"};
      el.state = testState1;
      el.query = query;
      CustomElements.takeRecords();
      layer.Util.defer.flush();
      var listItems = el.querySelectorAll("layer-conversation-item");

      // Posttest 1
      expect(listItems.length).toEqual(3);
      for (var i = 0; i < listItems.length; i++) {
        var item = listItems[i];
        expect(item.state).toBe(testState1);
      }

      // Run test 2
      var testState2 = {ho: "hey"};
      el.state = testState2;

      // Posttest 2
      for (var i = 0; i < listItems.length; i++) {
        var item = listItems[i];
        expect(item.state).toBe(testState2);
      }
    });
  });

  describe("The mainComponent property", function() {
    it("Should return itself if is a main component", function() {
      var el1 = document.createElement('layer-conversation-panel');
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(el1.mainComponent).toBe(el1);
    });

    it("Should return its parent main component", function() {
      var el1 = document.createElement('layer-conversation-panel');
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(el1.nodes.composer.nodes.buttonPanel.mainComponent).toBe(el1);
    });
  });

  describe("The parentComponent property", function() {
    it("Should return null if no parent component", function() {
      var el1 = document.createElement('layer-conversation-panel');
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(el1.parentComponent).toBe(null);
    });

    it("Should return its parent component", function() {
      var el1 = document.createElement('layer-conversation-panel');
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(el1.nodes.composer.nodes.buttonPanel.parentComponent).toBe(el1.nodes.composer);
    });
  });



  describe("The onRender() method", function() {
    var called = false;
    beforeAll(function() {
      layerUI.registerComponent('onrender-test1', {
        methods: {
          onRender: function() {
            called = true;
          }
        }
      });
    });
    beforeEach(function() {
      called = false;
    });

    it("Should do nothing if called before onAfterCreate", function() {
      var el = document.createElement('onrender-test1');
      el.onRender();
      expect(called).toBe(false);
    });

    it("Should be called directly from onAfterCreate", function() {
      var el = document.createElement('onrender-test1');
      el.onAfterCreate();
      expect(called).toBe(true);
    });

    it("Should run if called after onAfterCreate", function() {
      var el = document.createElement('onrender-test1');
      el.onAfterCreate();
      called = false;
      el.onRender();
      expect(called).toBe(true);
    });

    it("Should eventually run if called after onAfterCreate", function() {
      var el = document.createElement('onrender-test1');
      el.onRender();
      layer.Util.defer.flush();
      expect(called).toBe(true);
    });
  });

  describe("The onAttach() method", function() {
    it("Should be called after inserting a node", function() {
      var called = false;
      layerUI.registerComponent('oninsert-test1', {
        methods: {
          onAttach: function() {
            called = true;
          }
        }
      });

      var el = document.createElement('oninsert-test1');
      testRoot.appendChild(el);
      jasmine.clock().tick(10);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(called).toBe(true);
    });

    it("Should be called after onAfterCreate even if onAfterCreate is delayed to after insertion", function() {
      var called = false;
      layerUI.registerComponent('oninsert-test2', {
        properties: {
          hasValue: {}
        },
        methods: {
          onAfterCreate: {
            conditional: function() {
              return this.hasValue;
            }
          },
          onAttach: function() {
            called = true;
          }
        }
      });

      var el = document.createElement('oninsert-test2');
      testRoot.appendChild(el);
      jasmine.clock().tick(10);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(called).toBe(false);
      el.onAfterCreate();
      expect(called).toBe(false);
      el.hasValue = 5;
      el.onAfterCreate();
      expect(called).toBe(true);
    });
  });

  describe("The template property", function() {
    it("Should accept a string", function() {
      var called = false;
      layerUI.registerComponent('template-test1', {
        template: '<label layer-id="label">Frodo must die</label>',
        methods: {
          onCreate: function() {
            expect(this.nodes.label.tagName).toEqual('LABEL');
            expect(this.nodes.label.innerHTML).toEqual('Frodo must die');
            expect(this.nodes.label.parentNode).toBe(this);
            called = true;
          }
        }
      });

      var el = document.createElement('template-test1');
      testRoot.appendChild(el);
      jasmine.clock().tick(10);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(called).toBe(true);
    });

    it("Should accept a template node", function() {
      var called = false;
      var template = document.createElement('template');
      template.innerHTML = '<label layer-id="label">Frodo must die</label>';
      layerUI.registerComponent('template-test2', {
        template: template,
        methods: {
          onCreate: function() {
            expect(this.nodes.label.tagName).toEqual('LABEL');
            expect(this.nodes.label.innerHTML).toEqual('Frodo must die');
            expect(this.nodes.label.parentNode).toBe(this);
            called = true;
          }
        }
      });

      var el = document.createElement('template-test2');
      testRoot.appendChild(el);
      jasmine.clock().tick(10);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(called).toBe(true);

    });

    it("Should support a template sent via registerTemplate", function() {
      var called = false;
      var template = document.createElement('template');
      template.innerHTML = '<label layer-id="label">Frodo must die</label>';
      layerUI.registerComponent('template-test3', {
        methods: {
          onCreate: function() {
            expect(this.nodes.label.tagName).toEqual('LABEL');
            expect(this.nodes.label.innerHTML).toEqual('Frodo must die');
            expect(this.nodes.label.parentNode).toBe(this);
            called = true;
          }
        }
      });
      layerUI.registerTemplate('template-test3', template);

      var el = document.createElement('template-test3');
      testRoot.appendChild(el);
      jasmine.clock().tick(10);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(called).toBe(true);
    });

    it("Should support a template sent via buildAndRegisterTemplate", function() {
      var called = false;
      layerUI.registerComponent('template-test4', {
        methods: {
          onCreate: function() {
            expect(this.nodes.label.tagName).toEqual('LABEL');
            expect(this.nodes.label.innerHTML).toEqual('Frodo must die');
            expect(this.nodes.label.parentNode).toBe(this);
            called = true;
          }
        }
      });
      layerUI.buildAndRegisterTemplate('template-test4', '<label layer-id="label">Frodo must die</label>');

      var el = document.createElement('template-test4');
      testRoot.appendChild(el);
      jasmine.clock().tick(10);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(called).toBe(true);
    });
  });

  describe("The listeners and listenTo behaviors", function() {
    it("Should listen for events listed by the listeners property if they come from a listenTo id", function() {
      var eventOneCalled = false, eventTwoCalled = false;
      layerUI.registerComponent('listener-test1', {
        listeners: {
          'event-one': function() {
            eventOneCalled = true;
          },
          'event-two': function() {
            eventTwoCalled = true;
          }
        }
      });
      layerUI.registerComponent('listener-test1-source', {});

      var el = document.createElement('listener-test1');
      el.listenTo = 'source1,source2, source3';
      testRoot.appendChild(el);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      var source1 = document.createElement('listener-test1-source');
      source1.id = 'source1';
      testRoot.appendChild(source1);

      var source2 = document.createElement('listener-test1-source');
      source2.id = 'source2';
      testRoot.appendChild(source2);

      var source3 = document.createElement('listener-test1-source');
      source3.id = 'source3';
      testRoot.appendChild(source3);

      var source4 = document.createElement('listener-test1-source');
      source4.id = 'source4';
      testRoot.appendChild(source4);

      expect(eventOneCalled).toBe(false);
      expect(eventTwoCalled).toBe(false);

      // Test Run 1
      source1.trigger('event-one');
      expect(eventOneCalled).toBe(true);
      expect(eventTwoCalled).toBe(false);
      eventOneCalled = false;

      // Test Run 2
      source2.trigger('event-two');
      expect(eventOneCalled).toBe(false);
      expect(eventTwoCalled).toBe(true);
      eventTwoCalled = false;

      // Test Run 3
      source3.trigger('event-one');
      expect(eventOneCalled).toBe(true);
      expect(eventTwoCalled).toBe(false);
      eventOneCalled = false;

      // Test Run 4
      source4.trigger('event-one');
      expect(eventOneCalled).toBe(false);
      expect(eventTwoCalled).toBe(false);
    });
  });

  describe("cloning components", function() {
    it("Should reuse prior template", function() {
      layerUI.registerComponent('template-clone-test1', {
        template: '<label layer-id="label">Frodo must die</label>',
      });

      var el = document.createElement('template-clone-test1');
      testRoot.appendChild(el);
      jasmine.clock().tick(10);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      var newEl = el.cloneNode(true);
      testRoot.appendChild(el);
      jasmine.clock().tick(10);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(el.childNodes.length).toEqual(1);
      expect(el.querySelectorAll('label').length).toEqual(1);
    });

    it("Should handle case where template is not yet generated", function() {
      layerUI.registerComponent('template-clone-test2', {
        template: '<label layer-id="label">Frodo must die</label>',
      });

      var el = document.createElement('template-clone-test2');
      var newEl = el.cloneNode(true);
      testRoot.appendChild(el);
      jasmine.clock().tick(10);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(el.childNodes.length).toEqual(1);
      expect(el.querySelectorAll('label').length).toEqual(1);
    });
  });

  describe("The onDetach() method", function() {
    var avatar;
    beforeEach(function() {
      // Run removal
      avatar = document.createElement('layer-avatar');
      testRoot.appendChild(avatar);
      CustomElements.takeRecords();
      layer.Util.defer.flush();
    });
    it("Should be called after removal", function() {
      spyOn(avatar, "onDetach");

      // Run
      testRoot.removeChild(avatar);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      // Posttest
      expect(avatar.onDetach).toHaveBeenCalledWith();
    });

    it("Should wait and then call onDestroy", function() {
      spyOn(avatar, "onDestroy");

      // Run
      testRoot.removeChild(avatar);
      CustomElements.takeRecords();
      layer.Util.defer.flush();
      jasmine.clock().tick(10001);

      // Posttest
      expect(avatar.onDestroy).toHaveBeenCalledWith();
    });

    it("Should trigger layer-widget-destroyed and not call onDestroy if event prevented", function() {
      spyOn(avatar, "onDestroy");
      avatar.addEventListener('layer-widget-destroyed', function(evt) {
        expect(evt.detail.target).toBe(avatar);
        evt.preventDefault();
      });

      // Run
      testRoot.removeChild(avatar);
      CustomElements.takeRecords();
      layer.Util.defer.flush();
      jasmine.clock().tick(10001);

      // Posttest
      expect(avatar.onDestroy).not.toHaveBeenCalled();
    });

    it("Should trigger layer-widget-destroyed on document.body and not call onDestroy if event prevented", function() {
      spyOn(avatar, "onDestroy");
      var f = function(evt) {
        evt.preventDefault();
        expect(evt.detail.target).toBe(avatar);
      };
      document.body.addEventListener('layer-widget-destroyed', f);

      // Run
      testRoot.removeChild(avatar);
      CustomElements.takeRecords();
      layer.Util.defer.flush();
      jasmine.clock().tick(10001);

      // Posttest
      expect(avatar.onDestroy).not.toHaveBeenCalled();

      // Cleanup
      document.body.removeEventListener('layer-widget-destroyed', f);
    });
  });
});
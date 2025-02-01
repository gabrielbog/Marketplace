/**
 * @license
 * Copyright (c) 2014, 2024, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your products ViewModel code goes here
 */
define(['../accUtils', "knockout", "text!../productData.json", "ojs/ojmodulerouter-adapter", "ojs/ojarraydataprovider",
"ojs/ojknockout", "ojs/ojlistview", "ojs/ojmodule-element"],
 function(accUtils, ko, records, ModuleRouterAdapter, ArrayDataProvider) {
    function ProductsViewModel(args) {
      // Below are a set of the ViewModel methods invoked by the oj-module component.
      // Please reference the oj-module jsDoc for additional information.

      this.productData = JSON.parse(records).products;
      // Setup the data provider with our static data
      this.dataProvider = new ArrayDataProvider(this.productData);
      // Create an observable for the current record
      this.record = ko.observable();
      // A computed observable to keep the list selection in sync with the router
      // state.
      this.selection = ko.pureComputed({
          // The observable derives its value from the active record (this.record),
          // which is updated by the router.currentState observable below.
          read: () => {
              const selected = [];
              const record = this.record();
              if (record) {
                  const index = this.productData.indexOf(record);
                  selected.push(index);
              }
              return selected;
          },
          // When a list selection changes (by user action), the router is instructed
          // to navigate to the new state identified by the selection.
          write: (selected) => {
              this.router.go({ path: 'details', params: { index: selected[0] } });
          }
      });
      this.args = args;
      // Create a child router with one default path
      this.router = this.args.parentRouter.createChildRouter([
          { path: 'details/{index}' },
          { path: '', redirect: 'details' }
      ]);
      // When router state changes, update the viewmodel's record based on the
      // index from parameters
      this.router.currentState.subscribe((args) => {
          const state = args.state;
          if (state) {
              this.record(this.productData[state.params.index]);
          }
      });
      // ModuleRouterAdapter automatically loads the assocaited module for the
      // router state
      this.module = new ModuleRouterAdapter(this.router, {
          viewPath: 'views/',
          viewModelPath: 'viewModels/'
      });


      /**
       * Optional ViewModel method invoked after the View is inserted into the
       * document DOM.  The application can put logic that requires the DOM being
       * attached here.
       * This method might be called multiple times - after the View is created
       * and inserted into the DOM and after the View is reconnected
       * after being disconnected.
       */
      this.connected = () => {
        accUtils.announce('Products page loaded.', 'assertive');
        document.title = "Products";
        // Implement further logic if needed
      };

      /**
       * Optional ViewModel method invoked after the View is disconnected from the DOM.
       */
      this.disconnected = () => {
        // Implement if needed
      };

      /**
       * Optional ViewModel method invoked after transition to the new View is complete.
       * That includes any possible animation between the old and the new View.
       */
      this.transitionCompleted = () => {
        // Implement if needed
      };
    }

    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return ProductsViewModel;
  }
);

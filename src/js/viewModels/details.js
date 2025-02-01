/**
 * @license
 * Copyright (c) 2014, 2024, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your details ViewModel code goes here
 */
define(['../accUtils', "knockout", "text!../productData.json", "ojs/ojarraydataprovider",
"ojs/ojformlayout", "ojs/ojinputtext", 'ojs/ojchart'],
    function(accUtils, ko, records, ArrayDataProvider) {
       function DetailsViewModel(args) {
        // Below are a set of the ViewModel methods invoked by the oj-module component.
        // Please reference the oj-module jsDoc for additional information.

        this.productData = JSON.parse(records).products;
        this.args = args;
        this.record = ko.observable(this.productData[this.args.params.index]);
        this.priceListing = ko.observable();

        this.barSeries = [
          { name: '2021', items: [0] },
          { name: '2022', items: [0] },
          { name: '2023', items: [0] },
          { name: '2024', items: [0] },
        ];
        var barGroups = [' '];
        this.barSeriesValue = ko.observableArray(this.barSeries); 
        this.barGroupsValue = ko.observableArray(this.barGroups); 

        // define view model callback, that will be called by the ModuleRouterAdapter to re-apply parameters
        this.parametersChanged = (params) => {
            this.barGroupsValue.removeAll();
            this.barSeriesValue.removeAll();
            this.record(this.productData[params.index]);

            this.barGroupsValue.push(this.record.price);

            for (const entry of this.productData[params.index].price_history) {
              this.barSeriesValue.push({ name: entry.year, items: [entry.value] }); 
            }
            this.barSeriesValue.push({ name: "2024", items: [this.productData[params.index].price] });

            this.priceListing(this.productData[params.index].price + " RON");
        };

        this.checkValue = ko.observableArray();
        this.dircolumn = ko.pureComputed(() => {
            return !!(typeof this.checkValue()[0] !== 'undefined' &&
                this.checkValue()[0] != null &&
                this.checkValue()[0] === 'dirColumn');
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
          accUtils.announce('Details page loaded.', 'assertive');
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
      return DetailsViewModel;
     }
   );
   
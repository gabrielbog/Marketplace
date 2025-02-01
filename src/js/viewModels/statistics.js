/**
 * @license
 * Copyright (c) 2014, 2024, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your statistics ViewModel code goes here
 */
define(['../accUtils', "knockout", "ojs/ojarraydataprovider", "ojs/ojbufferingdataprovider", "ojs/ojconverter-number", "text!../productData.json",
"ojs/ojtable", "ojs/ojchart"],
 function(accUtils, ko, ArrayDataProvider, BufferingDataProvider, NumberConverter, records) {
    function StatisticsViewModel() {
      // Below are a set of the ViewModel methods invoked by the oj-module component.
      // Please reference the oj-module jsDoc for additional information.
      
      this.sellerData = JSON.parse(records).sellers;
      this.productData = JSON.parse(records).products;
      this.sellerObservableArray = ko.observableArray(this.sellerData);
      this.dataprovider = new BufferingDataProvider(new ArrayDataProvider(this.sellerObservableArray, {
          keyAttributes: 'id'
      }));
      this.converter = new NumberConverter.IntlNumberConverter({
          useGrouping: false
      });
      this.isEmptyTable = ko.observable(false);

      this.barSeries = [
        { name: 'produs1', items: [0] }, 
        { name: 'produs2', items: [0] }, 
        { name: 'produs3', items: [0] } 
      ]; 
      var barGroups = [' ']; 
      this.barSeriesValue = ko.observableArray(this.barSeries); 
      this.barGroupsValue = ko.observableArray(this.barGroups);

      // common method to handle drop from drag and drop as well as from ctrl+v
      this._handleDataTransfer = (dataTransfer) => {
          const jsonStr = dataTransfer.getData('application/ojtablerows+json');
          if (jsonStr) {
              const jsonObj = JSON.parse(jsonStr);
              this.barGroupsValue.removeAll();
              this.barSeriesValue.removeAll();

              for (let i = 0; i < jsonObj.length; i++) {
                  const rawData = jsonObj[i].data;
                  this.barGroupsValue.push(rawData.name);
                  for (let j = 0; j < this.productData.length; j++) {
                    if (this.productData[j].seller == rawData.name) {
                      this.barSeriesValue.push({ name: this.productData[j].name, items: [this.productData[j].total_sold] });
                    }
                  }
              }
          }
      };
      // drop event handler on chart
      this.handleDrop = (event) => {
          this._handleDataTransfer(event.dataTransfer);
          event.stopPropagation();
          event.preventDefault();
      };
      // key event handler on chart
      this.handleKey = (event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
              this._handleDataTransfer(clipboard);
          }
      };

      /**
       * Optional ViewModel method invoked after the View is inserted into the
       * document DOM.  The application can put logic that requires the DOM being
       * attached here.
       * This method might be called multiple times - after the View is created
       * and inserted into the DOM and after the View is reconnected
       * after being disconnected.
       */
      this.connected = () => {
        accUtils.announce('Statistics page loaded.', 'assertive');
        document.title = "Statistics";
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
    return StatisticsViewModel;
  }
);

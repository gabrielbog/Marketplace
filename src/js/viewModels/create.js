/**
 * @license
 * Copyright (c) 2014, 2024, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your create ViewModel code goes here
 */
define(['../accUtils', "knockout", "ojs/ojarraydataprovider", "ojs/ojbufferingdataprovider", "ojs/ojkeyset", "ojs/ojconverter-number", "text!../productData.json",
"ojs/ojknockout", "ojs/ojinputtext", "ojs/ojinputnumber", "ojs/ojlabel", "ojs/ojvalidationgroup", "ojs/ojformlayout", "ojs/ojtoolbar", "ojs/ojmessages", "ojs/ojtable"],
   function(accUtils, ko, ArrayDataProvider, BufferingDataProvider, ojkeyset_1, NumberConverter, records) {
    function CreateViewModel() {
      // Below are a set of the ViewModel methods invoked by the oj-module component.
      // Please reference the oj-module jsDoc for additional information.
      
      this.productData = JSON.parse(records).products;
      this.prodObservableArray = ko.observableArray(this.productData);
      this.dataprovider = new BufferingDataProvider(new ArrayDataProvider(this.prodObservableArray, {
          keyAttributes: 'id'
      }));
      this.converter = new NumberConverter.IntlNumberConverter({
          useGrouping: false
      });
      this.isEmptyTable = ko.observable(false);
      this.messageArray = ko.observableArray();
      this.groupValid = ko.observable();
      // initialize the observable values in the forms
      this.inputProductId = ko.observable(0);
      this.inputProductSeller = ko.observable("");
      this.inputProductName = ko.observable("");
      this.inputProductCategory = ko.observable("");
      this.inputProductPrice = ko.observable(0);
      this.inputTotalSold = ko.observable(0);
      this.firstSelected = ko.observable();
      this.disableSubmit = ko.observable(true);
      // Return true if the Create button should be disabled
      this.disableCreate = ko.computed(() => {
          return !this.inputProductId() || this.groupValid() === 'invalidShown';
      });
      // Return true if the Remove and Update buttons should be disabled
      this.disableRemoveUpdate = ko.computed(() => {
          const firstSelected = this.firstSelected();
          return !firstSelected || !firstSelected.key || this.groupValid() === 'invalidShown';
      });
      // Add a new row
      this.addRow = () => {
          if (this.groupValid() !== 'invalidShown') {
              const prod = {
                  id: this.inputProductId(),
                  seller: this.inputProductSeller(),
                  name: this.inputProductName(),
                  category: this.inputProductCategory(),
                  price: this.inputProductPrice(),
                  total_sold: this.inputTotalSold()
              };
              this.dataprovider.addItem({
                  metadata: { key: prod.id },
                  data: prod
              });
          }
      };
      // Update the selected row
      this.updateRow = () => {
          if (this.groupValid() !== 'invalidShown') {
              const element = document.getElementById('table');
              const currentRow = element
                  .currentRow;
              if (currentRow != null) {
                  const key = this.inputProductId();
                  const newData = {
                    id: this.inputProductId(),
                    seller: this.inputProductSeller(),
                    name: this.inputProductName(),
                    category: this.inputProductCategory(),
                    price: this.inputProductPrice(),
                    total_sold: this.inputTotalSold()
                  };
                  this.dataprovider.updateItem({ metadata: { key: key }, data: newData });
              }
          }
      };
      // Remove the selected row
      this.removeRow = () => {
          const element = document.getElementById('table');
          const currentRow = element.currentRow;
          if (currentRow != null) {
              const dataObj = element.getDataForVisibleRow(currentRow.rowIndex);
              this.dataprovider.removeItem({
                  metadata: { key: dataObj.key },
                  data: dataObj.data
              });
              this.dataprovider.getTotalSize().then(function (value) {
                  if (value == 0) {
                      this.isEmptyTable(true);
                  }
              }.bind(this));
              // Clear the table selection
              element.selected = { row: new ojkeyset_1.KeySetImpl(), column: new ojkeyset_1.KeySetImpl() };
          }
      };
      this.removeAllRow = () => {
          this.dataprovider.fetchByOffset({ size: -1, offset: 0 }).then(function (fetchResults) {
              let dataArray = fetchResults.results;
              for (let i = 0; i < dataArray.length; i++) {
                  this.dataprovider.removeItem(dataArray[i]);
              }
              this.dataprovider.getTotalSize().then(function (value) {
                  if (value == 0) {
                      this.isEmptyTable(true);
                  }
              }.bind(this));
          }.bind(this));
      };
      // Reset all rows to discard buffered changes
      this.resetRows = () => {
          this.dataprovider.resetAllUnsubmittedItems();
          this.isEmptyTable(this.dataprovider.isEmpty() === 'yes');
          this.messageArray([
              {
                  severity: 'confirmation',
                  summary: 'Changes have been reset.',
                  autoTimeout: 4000
              }
          ]);
      };
      this.findIndex = (key) => {
          const ar = this.prodObservableArray();
          for (let idx = 0; idx < this.prodObservableArray().length; idx++) {
              if (ar[idx].id === key) {
                  return idx;
              }
          }
          return -1;
      };
      // Commit a row to the data source.  This is dependent on the data source.
      this.commitOneRow = (editItem) => {
          const idx = this.findIndex(editItem.item.metadata.key);
          let error;
          if (idx > -1) {
              if (editItem.operation === 'update') {
                  this.prodObservableArray.splice(idx, 1, editItem.item.data);
              }
              else if (editItem.operation === 'remove') {
                  this.prodObservableArray.splice(idx, 1);
              }
              else {
                  error = {
                      severity: 'error',
                      summary: 'add error',
                      detail: 'Row with same key already exists'
                  };
              }
          }
          else {
              if (editItem.operation === 'add') {
                  this.prodObservableArray.splice(this.prodObservableArray().length, 0, editItem.item.data);
              }
              else {
                  error = {
                      severity: 'error',
                      summary: editItem.operation + ' error',
                      detail: 'Row for key cannot be found'
                  };
              }
          }
          if (error) {
              return Promise.reject(error);
          }
          return Promise.resolve();
      };
      // Submit the unsubmitted items
      this.submitRows = () => {
          this.disableSubmit(true);
          // Get all the submittable items
          const editItems = this.dataprovider.getSubmittableItems();
          editItems.forEach((editItem) => {
              // Set each edit item to "submitting" status before data submission
              this.dataprovider.setItemStatus(editItem, 'submitting');
              //DepartmentData
              // Commit data
              this.commitOneRow(editItem)
                  .then(() => {
                  // Set the edit item to "submitted" if successful
                  this.dataprovider.setItemStatus(editItem, 'submitted');
              })
                  .catch((error) => {
                  // Set the edit item back to "unsubmitted" with error if not successful
                  this.dataprovider.setItemStatus(editItem, 'unsubmitted', error);
                  var errorMsg = {
                      severity: error.severity,
                      summary: error.summary,
                      autoTimeout: 4000
                  };
                  this.messageArray.push(errorMsg);
              });
          });
          this.messageArray([
              {
                  severity: 'confirmation',
                  summary: 'Changes have been submitted.',
                  autoTimeout: 4000
              }
          ]);
      };
      // Listener for updating the form when row selection changes in the table
      this.firstSelectedRowChangedListener = (event) => {
          const itemContext = event.detail.value;
          if (itemContext && itemContext.data) {
              const prod = itemContext.data;
              this.inputProductId(prod.id);
              this.inputProductSeller(prod.seller);
              this.inputProductName(prod.name);
              this.inputProductCategory(prod.category);
              this.inputProductPrice(prod.price);
              this.inputTotalSold(prod.total_sold);
          }
      };
      this.hideTable = (hide) => {
          const table = document.getElementById('table');
          const noDataDiv = document.getElementById('noDataDiv');
          if (hide === true) {
              table.classList.add('oj-sm-hide');
              noDataDiv.classList.remove('oj-sm-hide');
          }
          else {
              table.classList.remove('oj-sm-hide');
              noDataDiv.classList.add('oj-sm-hide');
          }
      };
      this.dataprovider.addEventListener('submittableChange', (event) => {
          // BufferingDataProvider fires the "submittableChange" event whenever there is a change in the number of submittable items.
          // We can use this to update the UI.
          const submittable = event.detail;
          this.disableSubmit(submittable.length === 0);
      });
      this.dataprovider.addEventListener('mutate', (event) => {
          if (this.isEmptyTable() === true && event.detail.add != null) {
              this.isEmptyTable(false);
          }
      });
      this.isEmptyTable.subscribe((newValue) => {
          this.hideTable(newValue);
      });
      this.isEmptyTable(this.dataprovider.isEmpty() === 'yes');


      /**
       * Optional ViewModel method invoked after the View is inserted into the
       * document DOM.  The application can put logic that requires the DOM being
       * attached here.
       * This method might be called multiple times - after the View is created
       * and inserted into the DOM and after the View is reconnected
       * after being disconnected.
       */
      this.connected = () => {
        accUtils.announce('Create page loaded.', 'assertive');
        document.title = "Create";
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
    return CreateViewModel;
  }
);

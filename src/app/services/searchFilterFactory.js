'use strict';

angular.module('baseangular')
  .factory('searchAndFilterFactory2', function ($filter) {

    var fetchPrefs = function (tag) {
      if (supportsHTML5Storage()) {
        var savedPrefs = sessionStorage.getItem(tag + 'searchControls');
        if (savedPrefs && typeof savedPrefs !== 'undefined') {
          try {
            savedPrefs = JSON.parse(savedPrefs);
            return savedPrefs;
          } catch (err) {

          }
        }
      }
    };

    var savePrefs = function (prefsToSave) {
      if (supportsHTML5Storage() && prefsToSave.controllerName) {
        sessionStorage.setItem(prefsToSave.controllerName + 'searchControls', JSON.stringify(prefsToSave));
        //
        return true; // Return true to indicate success
      }
      return false; // Return false to indicate failure
    };

    var deletePrefs = function (tag) {
      if (supportsHTML5Storage()) {
        sessionStorage.removeItem(tag + 'searchControls');

        return true; // Return true to indicate success
      }
      return false; // Return false to indicate failure
    };

    var deleteAllPrefs = function () {
      if (supportsHTML5Storage()) {
        sessionStorage.clear();

        return true; // Return true to indicate success
      }
      return false; // Return false to indicate failure
    };

    /**
     * @method supportsHTML5Storage
     * @description Checks if the client's browser supports HTML5 local storage
     * @returns {Boolean} true if local_storage is supported, false otherwise
     */
    function supportsHTML5Storage () {
      try {
        return 'sessionStorage' in window && window.sessionStorage !== null;
      } catch (e) {
        return false;
      }
    }

    /**
     * @method accessFieldByString
     * @description Receives an object and returns a string serialized from that object, in the format that is required for
     * form-data in Http 'POST' requests.
     * @param item Object to be accessed
     * @param fieldPathString a string representing the path of the desired field
     * @returns {Object}
     */
    var accessFieldByString = function (item, fieldPathString) {
      if (fieldPathString) {
        var tempItem = {};

        // Split the path string into an array, separating at each .
        fieldPathString = fieldPathString.split('.');

        // Loop though each field found in the pathString
        for (var j = 0, len = fieldPathString.length; j < len; j++) {

          var field = fieldPathString[j];
          // If accessing the field on tempItem works, use that one.
          // Else access te field from the original item (should only happen the first time)
          if (tempItem) {
            tempItem = tempItem['pretty_' + field] || tempItem[field] || item['pretty_' + field] || item[field];
          }

          if (j + 1 === len && tempItem) {
            return tempItem;
          }
        }
      }
    };

    /**
     * @method filterBySearchQuery
     * @description Receives an item and checks all it's fields against a search query
     * @param {Object} item Item to be checked against a search query
     * @param {String} query Search query string
     * @returns {Boolean} Returns true if item has a field matching the query, false otherwise.
     */
    var filterBySearchQuery = function (item, query, fields) {

      function searchMatch (haystack, needle) {
        if (!needle) {
          return true;
        }
        haystack = haystack.toString();
        return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
      }

      if (fields) {
        for (var i = 0, len = fields.length; i < len; i++) {
          var tempItem = accessFieldByString(item, fields[i]);
          if (searchMatch(tempItem, query)) {
            return true;
          }
        }
      } else {
        for (var attr in item) {
          if (item[attr] && searchMatch(item[attr], query)) {
            return true;
          }
        }
      }

      return false;
    };


    /**
     * Calculate page in place
     * set itemsPerPage to Zero for unlimited items (single page)
     */
    var groupToPages = function (filteredItems, itemsPerPage) {
      var pagedItems = [];

      if (itemsPerPage === 0) {
        pagedItems.push(filteredItems);
      } else {
        for (var i = 0; i < filteredItems.length; i++) {
          if (i % itemsPerPage === 0) {
            pagedItems[Math.floor(i / itemsPerPage)] = [filteredItems[i]];
          } else {
            pagedItems[Math.floor(i / itemsPerPage)].push(filteredItems[i]);
          }
        }
      }

      return pagedItems;
    };

    /**
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     */

    var Factory = function () {

      this.filteredItems = [];
      this.pagedItems = [];

      this.init = function (controls) {
        this.controls = controls;
      };

      /**
       * @method sortBy
       * @description change sorting order
       * @param newSortingOrder
       */
      this.sortBy = function (newSortingOrder) {
        if (this.controls.sortingOrder === newSortingOrder) {
          this.controls.reverse = !this.controls.reverse;
        }

        this.controls.sortingOrder = newSortingOrder;

        this.search(this.originalArray);
      };

      /**
       * @method sortIconType
       * @description This method returns the appropriate icon class for table headings that are sortable
       * @param sortOrder The new sorting order
       * @returns {String} A String that represents the CSS-Class that should be applied to that table heading
       */
      this.sortIconType = function (sortOrder) {
        if (sortOrder === this.controls.sortingOrder) {
          if (this.controls.reverse) {
            return 'fa fa-caret-up';
          }
          else {
            return 'fa fa-caret-down';
          }
        } else {
          return 'fa fa-caret-up';
        }
      };


      /**
       * @method search
       * @description Receives an item and checks all it's fields against a search query
       * @param {String} caller Optional string to passed in for debugging purposes only. This can be used to console
       * the method that called this one.
       */
      this.search = function (originalArray, caller) {

        if (caller) {
          //
        }

        // Just exit if the array has not been filled yet
        if (!originalArray) {
          return;
        }

        var self = this;
        this.originalArray = originalArray;

        this.filteredItems = $filter('filter')(originalArray, function (item) {
          return filterBySearchQuery(item, self.controls.query, self.controls.searchFields);
        });

        // take care of the sorting order
        if (this.controls.sortingOrder !== '') {
          this.filteredItems = $filter('orderBy')(this.filteredItems, this.controls.sortingOrder, this.controls.reverse);
        }

        this.pagedItems = groupToPages(this.filteredItems, this.controls.itemsPerPage);

        /**
         * Save latest search controls to local storage
         */
        savePrefs(this.controls);
        return this.pagedItems;
      };

    };

    var SearchFactory = {
      getFactoryInstance: function (initializationData) {
        var newFactory = new Factory();

        if (initializationData.controllerName) {
          var savedPrefs = fetchPrefs(initializationData.controllerName);
          if (angular.isDefined(savedPrefs)) {
            newFactory.init(savedPrefs);
          } else {
            newFactory.init(initializationData);
          }
        } else {
          newFactory.init(initializationData);
        }

        return newFactory;
      }
    };

    return SearchFactory;
  });

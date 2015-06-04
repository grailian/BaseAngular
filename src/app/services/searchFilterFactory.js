app.factory('searchAndFilterFactory2', function ($filter) {

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
    };

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

  var factory = function () {

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
      if (this.controls.sortingOrder == newSortingOrder)
        this.controls.reverse = !this.controls.reverse;

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
        if (this.controls.reverse)
          return 'fa fa-caret-up';
        else
          return 'fa fa-caret-down';
      } else {
        return "fa fa-caret-up";
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
      var newFactory = new factory();

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

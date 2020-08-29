
"use strict";

(function () {

  var DEFAULT_CONFIG = {
    hasSorts: false,
    hasFilters: false,
    isHeaderFixed: true,
    pagination: false,
    perPageLimit: 0,
    columns: [],
  };

  function SimpleTable(element, data, config) {
    if (!element || !data || !Array.isArray(data)) {
      throw new Error('Invalid arguments');
    }

    var _config = {
      hasSorts: config.hasSorts || DEFAULT_CONFIG.hasSorts,
      hasFilters: config.hasFilters || DEFAULT_CONFIG.hasFilters,
      isHeaderFixed: config.isHeaderFixed || DEFAULT_CONFIG.isHeaderFixed,
      pagination: config.pagination || DEFAULT_CONFIG.pagination,
      perPageLimit: config.perPageLimit || DEFAULT_CONFIG.perPageLimit,
      columns: config.columns || DEFAULT_CONFIG.columns,
    };

    var _state = {
      currentPage: 0,
      totalPages: 0,
      totalCount: 0,
      canNavigatePrev: false,
      canNavigateNext: false,
      columns: [],

      sortColumns: [],
      sortOrders: [],
    };

    var _dom = {
      table: null,
      header: null,
      columns: [],
      body: null,
      rows: [],
      cells: { 0: [] },
    };

    function _init() {
      _initState();
      _initDom();
    }

    function _initState() {
      _state.totalCount = data.length;
      _state.currentPage = 1;
      _state.totalPages = Math.ceil(data.length / _config.perPageLimit);
      _state.canNavigatePrev = false;
      _state.canNavigateNext = _state.totalPages > 1;
      _state.columns = _config.columns.map(c => c.label);
    }

    // Creates the DOM elements
    function _initDom() {
      _dom.table = document.createElement('table');
      _dom.table.classList.add('simple-table');

      _dom.header = document.createElement('thead');
      _dom.table.appendChild(_dom.header);

      _dom.body = document.createElement('tbody');
      _dom.table.appendChild(_dom.body);

      _dom.columns = _config.columns.map(() => document.createElement('th'));

      for (var indCol = 0; indCol < _state.columns.length; indCol++) {
        var eleCol = document.createElement('th');

        eleCol.innerHTML = _state.columns[indCol];

        _dom.columns.push(eleCol);
        _dom.header.appendChild(eleCol);
      }

      for (var indRow = 0; indRow < _config.perPageLimit; indRow++) {
        var eleRow = document.createElement('tr');

        _dom.rows.push(eleRow);
        _dom.body.appendChild(eleRow);

        _dom.cells[indRow] = [];

        for (var indCol = 0; indCol < _state.columns.length; indCol++) {
          var eleCell = document.createElement('td');

          _dom.cells[indRow].push(eleCell);
          eleRow.appendChild(eleCell);
        }
      }

      // clean out the prev anything
      element.innerHTML = '';
      element.appendChild(_dom.table);
    }

    function reset() {

    }

    _init();

    return {
      reset,
    };
  }

  window.SimpleTable = SimpleTable;

})();

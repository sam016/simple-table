
"use strict";

(function () {

  var DEFAULT_CONFIG = {
    hasSorts: false,
    hasFilters: false,
    isHeaderFixed: true,
    pagination: false,
    perPageLimit: 0,
    columns: [],
    rowKey: 'id',
  };

  var SORT_ORDER = {
    1: 'asc',
    2: 'desc',
  };

  var SORT_ORDER_ASC = 1;
  var SORT_ORDER_DESC = 2;

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
      columns: [...config.columns] || DEFAULT_CONFIG.columns,
      rowKey: config.rowKey || DEFAULT_CONFIG.rowKey,
    };

    var _state = {
      currentPage: 0,
      totalPages: 0,
      totalCount: 0,
      canNavigatePrev: false,
      canNavigateNext: false,
      data: [],
      // columns: [],

      sortColumns: {},
    };

    var _dom = {
      table: null,
      header: null,
      columns: [],
      body: null,
      rows: [],
      cells: { 0: [] },
    };

    var _cacheData = {
    };

    function _init() {
      _initState();
      _initDom();

      _navigateToPage(1);
    }

    function _initState() {
      _state.totalCount = data.length;
      _state.currentPage = 1;
      _state.totalPages = Math.ceil(data.length / _config.perPageLimit);
      _state.canNavigatePrev = false;
      _state.canNavigateNext = _state.totalPages > 1;
      _state.data = data;
    }

    // Creates the DOM elements and attaches events
    function _initDom() {
      _dom.table = document.createElement('table');
      _dom.table.classList.add('simple-table');

      _dom.header = document.createElement('thead');
      _dom.table.appendChild(_dom.header);

      _dom.body = document.createElement('tbody');
      _dom.table.appendChild(_dom.body);

      _dom.columns = _config.columns.map(() => document.createElement('th'));

      for (var indCol = 0; indCol < _config.columns.length; indCol++) {
        var eleCol = document.createElement('th');

        eleCol.innerHTML = _config.columns[indCol].label;
        eleCol.dataset.index = indCol;

        if (_config.columns[indCol].sortable) {
          eleCol.addEventListener('click', _colHeaderClickHandler);
          eleCol.classList.add('sortable');
        }

        _dom.columns.push(eleCol);
        _dom.header.appendChild(eleCol);
      }

      for (var indRow = 0; indRow < _config.perPageLimit; indRow++) {
        var eleRow = document.createElement('tr');

        _dom.rows.push(eleRow);
        _dom.body.appendChild(eleRow);

        _dom.cells[indRow] = [];

        for (var indCol = 0; indCol < _config.columns.length; indCol++) {
          var eleCell = document.createElement('td');

          _dom.cells[indRow].push(eleCell);
          eleRow.appendChild(eleCell);
        }
      }

      // clean out the prev anything
      element.innerHTML = '';
      element.appendChild(_dom.table);
    }

    function _colHeaderClickHandler(event) {
      var eleCol = event.target;
      var indCol = eleCol.dataset.index;
      var column = _config.columns[indCol];

      if (!column.sortable) {
        return;
      }

      _state.sortColumns[column.key] = ((_state.sortColumns[column.key] || 0) + 1) % 3;

      console.log('-_dom.columns[indCol]', _dom.columns[indCol]);

      if (_state.sortColumns[column.key] === 0) {
        delete _state.sortColumns[column.key];

        eleCol.classList.remove('sortable--desc');
      } else if (_state.sortColumns[column.key] === SORT_ORDER_ASC) {
        eleCol.classList.add('sortable--asc');
      } else {
        eleCol.classList.remove('sortable--asc');
        eleCol.classList.add('sortable--desc');
      }


      // sort data once
      _sortData();

      // navigate back to page 1
      _navigateToPage(1);
    }

    function _navigateToPage(numPage) {
      var startIndex = (numPage - 1) * _config.perPageLimit;
      var endIndex = (numPage) * _config.perPageLimit;
      var slicedData = _state.data.slice(startIndex, endIndex);

      slicedData.map((item, indRow) => {
        var rowKeyValue = item[_config.rowKey];

        if (!_cacheData[rowKeyValue]) {
          _cacheData[rowKeyValue] = _config.columns.map(col => {
            if (col.transformer) {
              return col.transformer(item[col.key])
            }

            if (col.type === 'img') {
              return `<img class="${col.class || ''}" src="${item[col.key]}" alt="${col.key}"/>`
            }

            return item[col.key];
          });
        }

        _cacheData[rowKeyValue].forEach((cellData, indCell) => {
          _dom.cells[indRow][indCell].innerHTML = cellData;
        });
      });
    }

    function _sortData() {
      // console.log('--_state.sortColumns', _state.sortColumns);

      var columnKeys = Object.keys(_state.sortColumns);

      if (columnKeys.length === 0) {
        _state.data = [...data];
        return;
      }

      _state.data = [...data].sort((a, b) => {
        for (var ind = 0; ind < columnKeys.length; ind++) {
          var colKey = columnKeys[ind];

          if (a[colKey] === b[colKey]) {
            continue;
          }

          // console.log('--cmp', `${a[colKey]} < ${b[colKey]}`)

          if (a[colKey] < b[colKey] && _state.sortColumns[colKey] === SORT_ORDER_ASC) {
            return -1;
          }

          return 1;
        }

        return 0;
      });
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

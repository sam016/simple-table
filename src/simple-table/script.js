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
      paginated: config.paginated || DEFAULT_CONFIG.paginated,
      perPageLimit: config.paginated === false ? data.length : (config.perPageLimit || DEFAULT_CONFIG.perPageLimit),
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
      keyToInd: {},
    };

    var _dom = {
      root: null,
      table: null,
      header: null,
      columns: [],
      body: null,
      rows: [],
      cells: { 0: [] },
      pagination: null,
      pagePrevButtons: [],
      pageNextButtons: [],
      pageNavLastButton: null,
      pageNavFirstButton: null,
      pageNavPrevButton: null,
      pageNavNextButton: null,
      pageCurrent: null,
    };

    var _cacheData = {};

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
      _state.keyToInd = _config.columns.reduce((prev, item, ind) => {
        prev[item.key] = ind;
        return prev;
      }, {});
    }

    // Creates the DOM elements and attaches events
    function _initDom() {
      _createTable();
      _createPagination();

      // clean out the prev anything
      element.innerHTML = '';

      // create one simple-table
      _dom.root = document.createElement('div');
      _dom.root.classList.add('simple-table');

      _dom.root.appendChild(_dom.table);
      _dom.root.appendChild(_dom.pagination);

      element.appendChild(_dom.root);
    }

    function _createTable() {
      _dom.table = document.createElement('table');

      _dom.header = document.createElement('thead');
      _dom.table.appendChild(_dom.header);

      _dom.body = document.createElement('tbody');
      _dom.table.appendChild(_dom.body);

      for (var indCol = 0; indCol < _config.columns.length; indCol++) {
        var eleCol = document.createElement('th');

        eleCol.innerHTML = _config.columns[indCol].label;
        eleCol.dataset.index = indCol;

        if (_config.columns[indCol].sortable) {
          eleCol.addEventListener('click', _colHeaderClickHandler);
          eleCol.classList.add('sortable');
        }

        if (_config.columns[indCol].priority) {
          eleCol.classList.add(`p-${_config.columns[indCol].priority}`);
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

          if (_config.columns[indCol].priority) {
            eleCell.classList.add(`p-${_config.columns[indCol].priority}`);
          }

          _dom.cells[indRow].push(eleCell);
          eleRow.appendChild(eleCell);
        }
      }
    }

    function _createPagination() {
      _dom.pagination = document.createElement('div');
      _dom.pagination.classList.add('simple-table__pagination');

      _dom.pageNavFirstButton = document.createElement('button');
      _dom.pageNavFirstButton.addEventListener('click', _btnNavFirstPageClickHandler);
      _dom.pageNavFirstButton.innerText = "First";

      _dom.pageNavLastButton = document.createElement('button');
      _dom.pageNavLastButton.addEventListener('click', _btnNavLastPageClickHandler);
      _dom.pageNavLastButton.innerText = "Last";

      _dom.pageNavPrevButton = document.createElement('button');
      _dom.pageNavPrevButton.addEventListener('click', _btnNavPrevPageClickHandler);
      _dom.pageNavPrevButton.innerText = "Previous";

      _dom.pageNavNextButton = document.createElement('button');
      _dom.pageNavNextButton.addEventListener('click', _btnNavNextPageClickHandler);
      _dom.pageNavNextButton.innerText = "Next";

      _dom.pageCurrent = document.createElement('span');
      _dom.pageCurrent.classList.add('current');
      _dom.pageCurrent.innerText = '1';

      for (var ind = 0; ind < 5; ind++) {
        var elePrevButton = document.createElement('button');
        elePrevButton.classList.add('nav-page');
        elePrevButton.classList.add('hidden');
        elePrevButton.addEventListener('click', _btnNavToPageClickHandler);

        _dom.pagePrevButtons.push(elePrevButton);


        var eleNextButton = document.createElement('button');
        eleNextButton.classList.add('nav-page');
        eleNextButton.classList.add('hidden');
        eleNextButton.addEventListener('click', _btnNavToPageClickHandler);

        _dom.pageNextButtons.push(eleNextButton);
      }

      _dom.pagination.appendChild(_dom.pageNavFirstButton);
      _dom.pagination.appendChild(_dom.pageNavPrevButton);

      _dom.pagePrevButtons.forEach(btn => _dom.pagination.appendChild(btn));

      _dom.pagination.appendChild(_dom.pageCurrent);

      _dom.pageNextButtons.forEach(btn => _dom.pagination.appendChild(btn));

      _dom.pagination.appendChild(_dom.pageNavNextButton);
      _dom.pagination.appendChild(_dom.pageNavLastButton);
    }

    function _colHeaderClickHandler(event) {
      var eleCol = event.target;
      var indCol = eleCol.dataset.index;
      var column = _config.columns[indCol];

      if (!column.sortable) {
        return;
      }

      // sorting state 1 (ASC) > 2 (DESC) > 0 (no sort)
      _state.sortColumns[column.key] = ((_state.sortColumns[column.key] || 0) + 1) % 3;

      if (_state.sortColumns[column.key] === 0) {
        delete _state.sortColumns[column.key];
      }

      // sort data once
      _sortData();

      _updateColHeaders(column.key);

      // navigate back to page 1
      _navigateToPage(1);
    }

    function _updateColHeaders(colKey) {
      var allKeys = colKey ? [colKey] : Object.keys(_state.keyToInd);

      allKeys.forEach((colKey) => {
        var indCol = _state.keyToInd[colKey];
        var eleCol = _dom.columns[indCol];

        if (!_state.sortColumns[colKey]) {
          eleCol.classList.remove('sortable--desc');
          eleCol.classList.remove('sortable--asc');
        } else if (_state.sortColumns[colKey] === SORT_ORDER_ASC) {
          eleCol.classList.add('sortable--asc');
        } else {
          eleCol.classList.remove('sortable--asc');
          eleCol.classList.add('sortable--desc');
        }
      });
    }

    function _navigateToPage(numPage) {
      if (!numPage) {
        return;
      }

      _state.currentPage = numPage;

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

      _updatePagination();
    }

    function _updatePagination() {
      var prevPagesAvailable = _state.currentPage > 1 ? Math.min(_state.currentPage - 1, 5) : 0;
      var nextPagesAvailable = _state.currentPage < _state.totalPages ? Math.min(_state.totalPages - _state.currentPage, 5) : 0;

      for (var ind = 1; ind <= 5; ind++) {
        if (ind <= prevPagesAvailable) {
          _dom.pagePrevButtons[ind - 1].innerText = _state.currentPage - (prevPagesAvailable - ind) - 1;
          _dom.pagePrevButtons[ind - 1].dataset.index = _state.currentPage - (prevPagesAvailable - ind) - 1;
          _dom.pagePrevButtons[ind - 1].classList.remove('hidden');
        } else {
          _dom.pagePrevButtons[ind - 1].classList.add('hidden');
        }

        if (ind <= nextPagesAvailable) {
          _dom.pageNextButtons[ind - 1].innerText = _state.currentPage + ind;
          _dom.pageNextButtons[ind - 1].dataset.index = _state.currentPage + ind;
          _dom.pageNextButtons[ind - 1].classList.remove('hidden');
        } else {
          _dom.pageNextButtons[ind - 1].classList.add('hidden');
        }
      }

      _dom.pageCurrent.innerText = _state.currentPage;
      _dom.pageNavFirstButton.disabled = _state.currentPage === 1;
      _dom.pageNavPrevButton.disabled = _state.currentPage === 1;
      _dom.pageNavNextButton.disabled = _state.currentPage === _state.totalPages;
      _dom.pageNavLastButton.disabled = _state.currentPage === _state.totalPages;
    }

    function _sortData() {

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

          if (_state.sortColumns[colKey] === SORT_ORDER_ASC) {
            return (a[colKey] < b[colKey]) ? -1 : 1;
          } else {
            return (a[colKey] > b[colKey]) ? -1 : 1;
          }
        }

        return 0;
      });
    }

    function _btnNavFirstPageClickHandler(e) {
      _navigateToPage(1);
    }

    function _btnNavLastPageClickHandler(e) {
      _navigateToPage(_state.totalPages);
    }

    function _btnNavToPageClickHandler(e) {
      _navigateToPage(+e.target.dataset.index);
    }

    function _btnNavPrevPageClickHandler(e) {
      _navigateToPage(_state.currentPage - 1);
    }
    function _btnNavNextPageClickHandler(e) {
      _navigateToPage(_state.currentPage + 1);
    }

    function reset() {
      _state.sortColumns = {};

      // reset the col header state
      _updateColHeaders();

      // sort data
      _sortData();

      // navigate to first page
      _navigateToPage(1);
    }

    _init();

    return {
      reset,
    };
  }

  window.SimpleTable = SimpleTable;

})();

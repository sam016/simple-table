window.addEventListener('load', function () {
  var DEFAULT_CONFIG = {
    hasSorts: true,
    hasFilters: true,
    isHeaderFixed: true,
    paginated: true,
    perPageLimit: 5,
    rowKey: 'alpha3Code',
    columns: [
      {
        label: 'Flag',
        key: 'flag',
        type: 'img',
        class: 'flag',
      },
      {
        label: 'Name',
        key: 'name',
        sortable: true,
      },
      {
        label: 'Native name',
        key: 'nativeName',
      },
      {
        label: 'Capital',
        key: 'capital',
        sortable: true,
      },
      {
        label: 'Region',
        key: 'region',
        sortable: true,
      },
      {
        label: 'Population',
        key: 'population',
        sortable: true,
      },
      {
        label: 'Lat/Lng',
        key: 'latlng',
        sortable: true,
      },
      {
        label: 'Timezones',
        key: 'timezones',
        transformer: (val) => val.join(', '),
      },
      {
        label: 'Currencies',
        key: 'currencies',
        transformer: (val) => val.map(v => v.name).join(', '),
      },
      {
        label: 'Languages',
        key: 'languages',
        transformer: (val) => val.map(v => v.name).join(', '),
      },
    ]
  };

  // DOM elements
  var btnResetDemoTable;
  var btnResetPGTable;
  var btnApplyConfig;
  var txtPGConfig;
  var demoTableContainer;
  var pgTableContainer;

  // simple-tables
  var demoTable;
  var pgTable;

  // initialize the DOM variables
  function initializeDomVariables() {
    btnResetDemoTable = document.getElementById("btnResetDemoTable");
    btnResetPGTable = document.getElementById("btnResetPGTable");
    btnApplyConfig = document.getElementById("btnApplyConfig");
    txtPGConfig = document.getElementById("txtPGConfig");
    demoTableContainer = document.getElementById("demo-table-container");
    pgTableContainer = document.getElementById("pg-table-container");

    txtPGConfig.value = JSON.stringify(DEFAULT_CONFIG, null, 2);
  }

  // attach events to the buttons
  function attachEvents() {
    btnResetDemoTable.addEventListener('click', function (e) {
      demoTable && demoTable.reset();
    });

    btnResetPGTable.addEventListener('click', function (e) {
      pgTable && pgTable.reset();
    });

    btnApplyConfig.addEventListener('click', function (e) {
      try {
        var config = JSON.parse(txtPGConfig.value);
        pgTable = new SimpleTable(pgTableContainer, COUNTRIES, config);
      } catch (err) {
        alert('Error occurred while parsing config');
      }
    });
  }

  function initTables() {
    demoTable = new SimpleTable(demoTableContainer, COUNTRIES, DEFAULT_CONFIG);
    pgTable = new SimpleTable(pgTableContainer, COUNTRIES, DEFAULT_CONFIG);
  }

  initializeDomVariables();
  attachEvents();
  initTables();

});

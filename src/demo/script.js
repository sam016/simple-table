window.addEventListener('load', function () {
  var DEFAULT_CONFIG = {
    withSearch: true,
    withSort: true,
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
        pgTable = new SimpleTable(pgTableContainer, config);
      } catch (err) {
        alert('Error occurred while parsing config');
      }
    });
  }

  function initTables() {
    demoTable = new SimpleTable(demoTableContainer, DEFAULT_CONFIG);
    pgTable = new SimpleTable(pgTableContainer, DEFAULT_CONFIG);
  }

  initializeDomVariables();
  attachEvents();
  initTables();

});

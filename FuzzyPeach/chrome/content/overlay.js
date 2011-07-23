var table_dailytacker = 'fuzzypeach_dailytracker';
var table_domainprofiles = 'fuzzypeach_domainprofiles';
var table_referer = 'fuzzypeach_referers';
var current_domain = '';
var max_inactive_time = 10000;  // 10 seconds
var last_active = getCurrentTimestamp();
var url_history = new Array();
var mDBConn;
var intervalTime = 1000;  // 1 second
var inactive = false;

function dbAreaChart () {
  var count = 0;
  var area = new Array();
  area['dates'] = new Array();
  area['bad'] = new Array();
  area['good'] = new Array();
  area['neutral'] = new Array();
  var statement = mDBConn.createStatement("SELECT DISTINCT date FROM fuzzypeach_dailytracker");

  while (statement.executeStep()) {
    var bad = dbTodaySum('bad', statement.row.date);
    var good = dbTodaySum('good', statement.row.date);
    var neutral = dbTodaySum('neutral', statement.row.date);
    
    li ('date is: ' + statement.row.date);
    area['dates'][count] = statement.row.date;
    area['bad'][count] = bad;
    area['good'][count] = good;
    area['neutral'][count] = neutral;

    count++;
  }

  return area;
}

function dbTodaySum (rating, date) {
  var sum = '';
  var statement = mDBConn.createStatement("SELECT SUM(fuzzypeach_dailytracker.timeSpent) as totalMinutes FROM fuzzypeach_dailytracker,fuzzypeach_domainprofiles WHERE fuzzypeach_dailytracker.domain=fuzzypeach_domainprofiles.domain AND fuzzypeach_dailytracker.date='"+date+"' AND fuzzypeach_domainprofiles.rating='"+rating+"'");
 
  while (statement.executeStep()) {
    sum = Math.floor(parseInt(statement.row.totalMinutes)/60000);
    break;
  }

  return sum;
}

function dbWeekSum (rating) {
  var sum = '';
  var statement = mDBConn.createStatement("SELECT SUM(fuzzypeach_dailytracker.timeSpent) as totalMinutes FROM fuzzypeach_dailytracker,fuzzypeach_domainprofiles WHERE fuzzypeach_dailytracker.domain=fuzzypeach_domainprofiles.domain AND fuzzypeach_domainprofiles.rating='"+rating+"'");
 
  while (statement.executeStep()) {
    sum = Math.floor(parseInt(statement.row.totalMinutes)/60000);
    break;
  }

  return sum;
}

function dbTopSites () {
  var count = 0;
  var top = new Array();
  top['domains'] = new Array();
  top['totalMinutes'] = new Array();
  top['ratings'] = new Array();
  var statement = mDBConn.createStatement("SELECT fuzzypeach_dailytracker.domain, SUM(fuzzypeach_dailytracker.timeSpent) as totalMinutes, fuzzypeach_domainprofiles.rating FROM fuzzypeach_dailytracker,fuzzypeach_domainprofiles WHERE fuzzypeach_dailytracker.domain=fuzzypeach_domainprofiles.domain GROUP BY fuzzypeach_dailytracker.domain ORDER BY SUM(fuzzypeach_dailytracker.timeSpent) DESC");

  while (statement.executeStep()) {
    top['domains'][count] = statement.row.domain;
    top['totalMinutes'][count] = Math.floor(parseInt(statement.row.totalMinutes)/60000);
    top['ratings'][count] = statement.row.rating;

    count++;
    if (count >= 4) 
      break;
  }

  return top;
}

function dbTopBadSites () {
  var count = 0;
  var top = new Array();
  top['domains'] = new Array();
  top['totalMinutes'] = new Array();
  top['ratings'] = new Array();
  var statement = mDBConn.createStatement("SELECT fuzzypeach_dailytracker.domain, SUM(fuzzypeach_dailytracker.timeSpent) as totalMinutes FROM fuzzypeach_dailytracker,fuzzypeach_domainprofiles WHERE fuzzypeach_dailytracker.domain=fuzzypeach_domainprofiles.domain AND fuzzypeach_domainprofiles.rating='bad' GROUP BY fuzzypeach_dailytracker.domain ORDER BY SUM(fuzzypeach_dailytracker.timeSpent) DESC");

  while (statement.executeStep()) {
    top['domains'][count] = statement.row.domain;
    top['totalMinutes'][count] = Math.floor(parseInt(statement.row.totalMinutes)/60000);

    count++;
    if (count >= 4) 
      break;
  }

  return top;
}

function dbTopGoodSites () {
  var count = 0;
  var top = new Array();
  top['domains'] = new Array();
  top['totalMinutes'] = new Array();
  top['ratings'] = new Array();
  var statement = mDBConn.createStatement("SELECT fuzzypeach_dailytracker.domain, SUM(fuzzypeach_dailytracker.timeSpent) as totalMinutes FROM fuzzypeach_dailytracker,fuzzypeach_domainprofiles WHERE fuzzypeach_dailytracker.domain=fuzzypeach_domainprofiles.domain AND fuzzypeach_domainprofiles.rating='good' GROUP BY fuzzypeach_dailytracker.domain ORDER BY SUM(fuzzypeach_dailytracker.timeSpent) DESC");

  while (statement.executeStep()) {
    top['domains'][count] = statement.row.domain;
    top['totalMinutes'][count] = Math.floor(parseInt(statement.row.totalMinutes)/60000);

    count++;
    if (count >= 5) 
      break;
  }

  return top;
}


function dbWorstTimeWaster () {
  var worst = '';
  var statement = mDBConn.createStatement("SELECT fuzzypeach_dailytracker.domain FROM fuzzypeach_dailytracker,fuzzypeach_domainprofiles WHERE fuzzypeach_dailytracker.domain=fuzzypeach_domainprofiles.domain AND fuzzypeach_domainprofiles.rating='bad' GROUP BY fuzzypeach_dailytracker.domain ORDER BY SUM(fuzzypeach_dailytracker.timeSpent) DESC");
 
  while (statement.executeStep()) {
    worst = statement.row.domain;
    break;
  }

  return worst;
}

function dbGetDayProductivity (date) {
  var productivity = '';
  var statement = mDBConn.createStatement("SELECT SUM(fuzzypeach_dailytracker.timeSpent) as productivity FROM fuzzypeach_dailytracker,fuzzypeach_domainprofiles WHERE fuzzypeach_dailytracker.domain=fuzzypeach_domainprofiles.domain AND fuzzypeach_domainprofiles.rating='good' AND fuzzypeach_dailytracker.date='"+date+"' GROUP BY fuzzypeach_dailytracker.domain ORDER BY SUM(fuzzypeach_dailytracker.timeSpent) DESC");

  while (statement.executeStep()) {
    productivity = statement.row.productivity;
    break;
  }

  return productivity;
}

function dbBestTimeSpent () {
  var best = '';
  var statement = mDBConn.createStatement("SELECT fuzzypeach_dailytracker.domain FROM fuzzypeach_dailytracker,fuzzypeach_domainprofiles WHERE fuzzypeach_dailytracker.domain=fuzzypeach_domainprofiles.domain AND fuzzypeach_domainprofiles.rating='good' GROUP BY fuzzypeach_dailytracker.domain ORDER BY SUM(fuzzypeach_dailytracker.timeSpent) DESC");

  while (statement.executeStep()) {
    best = statement.row.domain;
    break;
  }

  return best;
}

function toolbarButtonThumbsDown () {
    var currentTab = gBrowser.contentDocument;
    var domain = getMainDomain(currentTab.location.href);
    
    var profileExists = dbDomainProfileExists(domain);
    if (!profileExists) {
      dbProfileInsert(domain, 'bad');
    } else {
      dbProfileUpdate(domain, 'bad');
    }

    var toolbar_button = document.getElementById('fuzzypeach-thumbs-down'); 
    var other_toolbar_button = document.getElementById('fuzzypeach-thumbs-up');
    toolbar_button.disabled = "true";
    other_toolbar_button.removeAttribute('disabled');
}

function toolbarButtonThumbsUp () {
    var currentTab = gBrowser.contentDocument;
    var domain = getMainDomain(currentTab.location.href);
    
    var profileExists = dbDomainProfileExists(domain);

    if (!profileExists) {
      dbProfileInsert(domain, 'good');
    } else {
      dbProfileUpdate(domain, 'good');
    }

    var toolbar_button = document.getElementById('fuzzypeach-thumbs-up'); 
    var other_toolbar_button = document.getElementById('fuzzypeach-thumbs-down');
    other_toolbar_button.removeAttribute('disabled');
    toolbar_button.disabled = "true";
}

function dbConnect () {
  var file = Components.classes["@mozilla.org/file/directory_service;1"]
                       .getService(Components.interfaces.nsIProperties)
                       .get("ProfD", Components.interfaces.nsIFile);
  file.append("fuzzypeach.sqlite");

  var storageService = Components.classes["@mozilla.org/storage/service;1"]
                          .getService(Components.interfaces.mozIStorageService);
  mDBConn = storageService.openDatabase(file); // Will also create the file if it does not exist
}

function dbToolkit () {
  // date is a text so it can be saved in yyyy-mm-dd format
  mDBConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS "+table_dailytacker+" (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, domain TEXT NOT NULL, date TEXT, timeSpent INTEGER)");
  mDBConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS "+table_domainprofiles+" (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, domain TEXT NOT NULL, rating TEXT NOT NULL)");
  mDBConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS "+table_referer+" (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, referrer TEXT NOT NULL, targetDomain TEXT NOT NULL)");
}

function dbProfileUpdate (domain, rating) {
  if (domain == '' || domain == null || domain === undefined) 
    return;
  
  mDBConn.executeSimpleSQL("UPDATE "+table_domainprofiles+" SET rating = '"+rating+"' WHERE domain = '"+domain+"'");
}

function dbRefererInsert () {
  mDBConn.executeSimpleSQL("INSERT INTO "+table_referer+" (referrer, targetDomain) VALUES ('reddit.com', 'imgur.com')");
  mDBConn.executeSimpleSQL("INSERT INTO "+table_referer+" (referrer, targetDomain) VALUES ('reddit.com', 'youtube.com')");
  mDBConn.executeSimpleSQL("INSERT INTO "+table_referer+" (referrer, targetDomain) VALUES ('google.com', 'cbsnews.com')");
  mDBConn.executeSimpleSQL("INSERT INTO "+table_referer+" (referrer, targetDomain) VALUES ('google.com', 'bbc.co.uk')");
  mDBConn.executeSimpleSQL("INSERT INTO "+table_referer+" (referrer, targetDomain) VALUES ('google.com', 'cnn.com')");
  mDBConn.executeSimpleSQL("INSERT INTO "+table_referer+" (referrer, targetDomain) VALUES ('facebook.com', 'youtube.com')");
}

function dbProfileInsert (domain, rating) {
  // possible values for rating: good, bad, neutral
  if (domain == '' || domain == null || domain === undefined) 
    return;
  
  mDBConn.executeSimpleSQL("INSERT INTO "+table_domainprofiles+" (domain, rating) VALUES ('"+domain+"', '"+rating+"')");
}

function dbInsert (domain, timeSpent) {
  if (domain == '' || domain == null || domain === undefined) 
    return;
  
  var formatted_date = getFormattedDate();
  mDBConn.executeSimpleSQL("INSERT INTO "+table_dailytacker+" (domain, date, timeSpent) VALUES ('"+domain+"', '"+formatted_date+"', "+timeSpent+")");

  var profileExists = dbDomainProfileExists(domain);
  if (!profileExists) 
    dbProfileInsert(domain, 'neutral');
}

function dbUpdate (domain, timeSpent) {
  if (domain == '' || domain == null || domain === undefined) 
    return;
  
  var formatted_date = getFormattedDate();
  mDBConn.executeSimpleSQL("UPDATE "+table_dailytacker+" SET timeSpent = '"+timeSpent+"' WHERE domain = '"+domain+"' AND date = '"+formatted_date+"'");
}

function dbPopulate () {
  var formatted_date = getFormattedDate();
  var statement = mDBConn.createStatement("SELECT * FROM "+table_dailytacker+" WHERE date = '"+formatted_date+"'");
 
  while (statement.executeStep()) {
    url_history[statement.row.domain] = parseInt(statement.row.timeSpent);
  }
}

function oneSecondCheck() {
  var current_time = getCurrentTimestamp();
  if (current_time-last_active > max_inactive_time) {
    // in-active user
    inactive = true;
  } else {
    inactive = false;
  }
  
  if (!inactive) {
    // increment counter
    initializeNewDomain(current_domain);
    url_history[current_domain] += intervalTime;

    // add to db
    var insertedToday = dbDomainInsertedToday(current_domain);
    if (insertedToday) {
        dbUpdate(current_domain, url_history[current_domain]);
    } else {
        dbInsert(current_domain, url_history[current_domain]);
    }
  }

  setTimeout("oneSecondCheck()", intervalTime);
}

function dbDomainProfile (domain) {
  if (domain == null || domain == '') 
    return;

  var profile = '';
  var statement = mDBConn.createStatement("SELECT * FROM "+table_domainprofiles+" WHERE domain = '"+domain+"'");
  while (statement.executeStep()) {
    profile = statement.row.rating;
    break;
  }

  if (profile == null || profile === undefined || profile == '')
    profile = 'neutral';

  return profile;
}

function dbDomainProfileExists (domain) {
  if (domain == null || domain == '') 
    return;

  var profileExists = false;
  var statement = mDBConn.createStatement("SELECT * FROM "+table_domainprofiles+" WHERE domain = '"+domain+"'");
  while (statement.executeStep()) {
    profileExists = true;
    break;
  }

  return profileExists;
}

function dbDomainInsertedToday (domain) {
  if (domain == null || domain == '') 
    return;

  var insertedToday = false;
  var timeToday = '';
  
  var formatted_date = getFormattedDate();

  var statement = mDBConn.createStatement("SELECT * FROM "+table_dailytacker+" WHERE domain = '"+domain+"' AND date = '"+formatted_date+"'");
  while (statement.executeStep()) {
    insertedToday = true;
    timeToday = statement.row.timeSpent;
    break;
  }

  return insertedToday;
}

var fuzzypeach = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("fuzzypeach-strings");  

    dbConnect();  // connect to db
    dbToolkit();  // call db initiator
    dbPopulate(); // populate

    setTimeout("oneSecondCheck()", intervalTime);
  },

  onMenuItemCommand: function(e) {
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                  .getService(Components.interfaces.nsIPromptService);
    promptService.alert(window, this.strings.getString("helloMessageTitle"),
                                this.strings.getString("helloMessage"));
  },

  onToolbarButtonCommand: function(e) {
    // just reuse the function above.  you can change this, obviously!
    fuzzypeach.onMenuItemCommand(e);
  }
};

var urlTracker = {
  init: function() {
    var appcontent = document.getElementById("appcontent");   // browser
    if(appcontent)
      appcontent.addEventListener("DOMContentLoaded", urlTracker.onPageLoad, true);
    var messagepane = document.getElementById("messagepane"); // mail
    if(messagepane)
      messagepane.addEventListener("load", function(event) { urlTracker.onPageLoad(event); }, true);
  },

  onPageLoad: function(aEvent) {
    var profile = '';
    var toolbar_button = '';
    var other_toolbar_button = '';

    var doc = aEvent.originalTarget; // doc is document that triggered "onload" event
    var win = doc.defaultView;      

    if (win != win.top) return; //only top window
    if (win.frameElement) return; // skip iframes/frames

    var currentTab = gBrowser.contentDocument;
    var currentTab_domain = getMainDomain(currentTab.location.href);
    var domain = getMainDomain(doc.location.href);

    if (doc.location.href == 'chrome://fuzzypeach/content/ui/index.html') {      
      // top 4
      var yesterday = dbGetDayProductivity('2011-07-22');
      var today = dbGetDayProductivity('2011-07-23');
      var day_pct = Math.floor((today/yesterday)*100);
      win.init_widget_productivity_day(day_pct);
      win.init_widget_productivity_week(-1.25);
      win.init_widget_badsite(dbWorstTimeWaster());
      win.init_widget_goodsite(dbBestTimeSpent());

      var topsites = dbTopSites();
      win.init_topsites(topsites['domains'], topsites['totalMinutes'], topsites['ratings']);

      var today_timewasting = dbTodaySum('bad', '2011-07-23');
      var today_neutral = dbTodaySum('neutral', '2011-07-23');
      var today_productive = dbTodaySum('good', '2011-07-23');
      win.init_pie_today(today_timewasting, today_neutral, today_productive);

      var week_timewasting = dbWeekSum('bad');
      var week_neutral = dbWeekSum('neutral');
      var week_productive = dbWeekSum('good');
      win.init_pie_7days(week_timewasting, week_neutral, week_productive);

      var area = dbAreaChart();
      win.init_areagraph(area['dates'], area['bad'], area['neutral'], area['good']);
    }

    if (doc.location.href == 'chrome://fuzzypeach/content/ui/details.html') {
      // cam.com

      // top 4
      var yesterday = dbGetDayProductivity('2011-07-22');
      var today = dbGetDayProductivity('2011-07-23');
      var day_pct = Math.floor((today/yesterday)*100);
      win.init_widget_productivity_day(day_pct);
      win.init_widget_productivity_week(-1.25);
      win.init_widget_badsite(dbWorstTimeWaster());
      win.init_widget_goodsite(dbBestTimeSpent());
      
      var topbadsites = dbTopBadSites();
      var topgoodsites = dbTopGoodSites();
      win.init_topsites_productive(topgoodsites['domains'], topgoodsites['totalMinutes']);
      win.init_topsites_wasting(topbadsites['domains'], topbadsites['totalMinutes']);

//lcol_names is an array of site names, lcol_mins is an array of integers (for minutes).
//rcol_names is an array of arrays (each array corresponds to one lcol_name).
//rcol_mins is an array of arrays as well.
      //function init_funnel(lcol_names, lcol_mins, rcol_names, rcol_mins);

    }    

    if (domain != null && currentTab_domain != null && domain==currentTab_domain) {
      // begin timer for new domain
      current_domain = domain;
      initializeNewDomain(current_domain);
      li ('New page loaded:'+current_domain+', total time elapsed:'+url_history[current_domain]);

      // get domain profile
      profile = dbDomainProfile(current_domain);
      toolbar_button = document.getElementById('fuzzypeach-thumbs-up'); 
      other_toolbar_button = document.getElementById('fuzzypeach-thumbs-down');

      if (profile == 'bad') {
        toolbar_button.removeAttribute('disabled');
        other_toolbar_button.disabled = "true";
      } else if (profile == 'good') {
        toolbar_button.disabled = "true";
        other_toolbar_button.removeAttribute('disabled');
      } else {
        toolbar_button.removeAttribute('disabled');
        other_toolbar_button.removeAttribute('disabled');
      }
    }
        
    // add event listener for page unload 
    aEvent.originalTarget.defaultView.addEventListener("unload", function(event){ urlTracker.onPageUnload(event); }, true);
  },

  onPageUnload: function(aEvent) {
    // do something
    var doc = aEvent.originalTarget; // doc is document that triggered "onload" event
    var win = doc.defaultView;      

    if (win != win.top) return; //only top window
    if (win.frameElement) return; // skip iframes/frames

    var currentTab = gBrowser.contentDocument;
    var currentTab_domain = getMainDomain(currentTab.location.href);
    var domain = getMainDomain(doc.location.href);

    if (domain != null && currentTab_domain != null && domain==currentTab_domain) {
      // end timer for domain that was just closed
      current_domain = domain;
      li ('Page unloaded:'+current_domain+',total time elapsed: '+url_history[current_domain]);
    }
  }
}

function tabTracker(aEvent) {
    var profile = '';
    var toolbar_button = '';
    var doc = aEvent.originalTarget;
    var win = doc.defaultView;      
    var new_domain = getMainDomain(content.location.href);
    
    if (current_domain != null && current_domain != '') {
        // end the timer on the previous tab's domain
        li ('SWITCHED TABS. Previous page unloaded:'+current_domain+', previous page time: '+url_history[current_domain]);
    } else {
        li('SWITCHED TABS. Previous page was blank');
    }

    // we reset the domain even if its blank
    current_domain = new_domain;

    if (new_domain != null && new_domain != '') {
      // begin timer for new domain
      initializeNewDomain(current_domain);
      li ('SWITCHED TABS. New page loaded:'+current_domain+', time elapsed:'+url_history[current_domain]);

      // get domain profile
      profile = dbDomainProfile(current_domain);
      toolbar_button = document.getElementById('fuzzypeach-thumbs-up'); 
      other_toolbar_button = document.getElementById('fuzzypeach-thumbs-down');

      if (profile == 'bad') {
        toolbar_button.removeAttribute('disabled');
        other_toolbar_button.disabled = "true";
      } else if (profile == 'good') {
        toolbar_button.disabled = "true";
        other_toolbar_button.removeAttribute('disabled');
      } else {
        toolbar_button.removeAttribute('disabled');
        other_toolbar_button.removeAttribute('disabled');
      }
    } else {
      li ('SWITCHED TABS. New page is blank');
    }
}

gBrowser.tabContainer.addEventListener("TabSelect", tabTracker, false);
window.addEventListener("load", function() { fuzzypeach.onLoad(); }, false);
window.addEventListener("load", function() { urlTracker.init(); }, false);

// activity detection
window.addEventListener("click", function() { updateActivity(); }, false);
window.addEventListener("dblclick", function() { updateActivity(); }, false);
window.addEventListener("mousemove", function() { updateActivity(); }, false);
window.addEventListener("DOMMouseScroll", function() { updateActivity(); }, false);
window.addEventListener("keydown", function() { updateActivity(); }, false);
window.addEventListener("keypress", function() { updateActivity(); }, false);
window.addEventListener("keyup", function() { updateActivity(); }, false);

// helper functions
function initializeNewDomain (domain) {
  if (url_history[domain] == null || url_history[domain] === undefined || typeof url_history[domain] === undefined) {
    url_history[domain] = 0;
  }
}

function getMainDomain (url) {
  var matches = url.match(/^.*?\/\/.*?([^.]+?\.[^.]+?)(\/|$)/);
  
  if (matches != null)
    return matches[1].toLowerCase();
}

// returns today's date in yyyy-mm-dd format
function getFormattedDate () {
  var today = new Date(); 
  var dd = today.getDate(); 
  var mm = today.getMonth()+1;//January is 0! 
  var yyyy = today.getFullYear(); 
  if(dd<10){dd='0'+dd} 
  if(mm<10){mm='0'+mm} 
  var formatted_date = yyyy+'-'+mm+'-'+dd;
  return formatted_date;
}

function updateActivity () {
  last_active = getCurrentTimestamp(); 
  if (inactive)
    inactive = false;
}
function getCurrentTimestamp () { var tstamp = new Date().getTime(); return parseInt(tstamp); }
function appendErro(str){ throw new Error("DEBUG: "+str) }
function li(str) { setTimeout("appendErro('"+str+"')", 1) }
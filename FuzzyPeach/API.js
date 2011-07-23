 
 //- This file describes how to initialize data for the three admin pages (index.html, overview.html, details.html)

 //- You must do this initialization EVERY TIME one of the three admin pages is opened (after the DOM is ready).

index.html
----------

Call each of the following with the appropriate parameters:

//dates is an array of equidistant user-displayable days. For example, ['Aug 28, 2011', 'Aug 30, 2011', 'Sept 1, 2011'].
//timeWasting, neutral, and productive are arrays of integers. For example, timeWasting = [1,511,23,1]. Each integer should be the number of minutes spent doing that action (ie wasting time) on that particular day.
function init_areagraph(dates, timeWasting, neutral, productive);

//each should be an integer corresponding to how much that has happened in the past 7 days.
function init_pie_7days(timeWasting, neutral, productive);

//each should be an integer corresponding to how much that has happened today.
function init_pie_today(timeWasting, neutral, productive);

//sitenames is a descending-ordered array of the top-visited sites by the user.
//siteminutes is the corresponding minutes.
//sitetypes is an array of the site types (each element should be 'neutral', 'productive', 'wasting')
// - this is for a 7 day period.
// - will accept any number of sites, but please provide at most 5 or 6.
function init_topsites(sitenames, siteminutes, sitetypes);


//NOTE: The widget functions follow. you must call them in the order listed here:

//should be a non-zero integer representing a + or - percent in productivity over the past week. 
function init_widget_productivity_week(productivity);

//same as above, but day instead of week
function init_widget_productivity_day(productivity);

//the site the user is least productive on
function init_widget_badsite(sitename);

//site the user is most productive on 
function init_widget_goodsite(sitename);


details.html
----------

Call each of the following with the appropriate parameters:

//NOTE: make sure to call the topsites functions in this order:
//same params as init_topsites from index.html, except these should be the top productive sites.
// - provide about 7-10 of these
function init_topsites_productive(sitenames, siteminutes);

//same as above but time wasting sites
function init_topsites_wasting(sitenames, siteminutes);

//for the funnel interface at the bottom fo the page.
//lcol_names is an array of site names, lcol_mins is an array of integers (for minutes).
//rcol_names is an array of arrays (each array corresponds to one lcol_name).
//rcol_mins is an array of arrays as well.
function init_funnel(lcol_names, lcol_mins, rcol_names, rcol_mins);


//NOTE: The widget functions follow. you must call them in the order listed here:

//should be a non-zero integer representing a + or - percent in productivity over the past week. 
function init_widget_productivity_week(productivity);

//same as above, but day instead of week
function init_widget_productivity_day(productivity);

//the site the user is least productive on
function init_widget_badsite(sitename);

//site the user is most productive on 
function init_widget_goodsite(sitename);
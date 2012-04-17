
var LastPollTime = 0;

// Poll server for recent events
function pollRecentEvents(oneTime) {

  // Get events since collection of last info
  if (LastPollTime == 0) {
    LastPollTime = App.time_collected/1000+60;
  }
  var evtTime = 'ts='+(LastPollTime-60);  // Allow for a one-minute "overlap"    
  
  // Poll for events more recent
  $.getJSON('/events', evtTime+'&need_thats=1', processRecentEvents);

  // Set time
  LastPollTime = Date.now()/1000;
  
  // Repeat again
  if (!oneTime) {
//    setTimeout(pollRecentEvents, 3000);
  }
}

// Respond to recent events from server
function processRecentEvents(data) {
  // Notify app router
  App.onThatEvents(data);
}


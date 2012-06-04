
// Poll server for recent events
function pollRecentEvents(oneTime) {

  // Get events since collection of last info
  var since = '';
  var last_event = _.last(App.events.models);
  if (last_event) {
    since = 'since_id='+last_event.id;
  }
  
  // Poll for events more recent
  $.getJSON('/api/events?', since+'&need_thats=1', processRecentEvents);

  // Repeat again
  if (!oneTime) {
    setTimeout(pollRecentEvents, 3000);
  }
}

// Respond to recent events from server
function processRecentEvents(data) {
  // Notify app router
  App.onThatEvents(data);
}


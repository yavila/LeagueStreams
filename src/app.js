/**
 * League Streams
 *
 * Pebble watchapp that feeds you the top League of Legends streams on Twitch.tv.
 */
var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');
// Accel API so accelerometer can be used to update upon shake
var Accel = require('ui/accel');
// for Vibration
var Vibe = require('ui/vibe');

// Show splash screen while waiting for data
var splashWindow = new UI.Window();

// Text element to inform user
var text = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  text: 'Downloading streamer data...',
  font:'GOTHIC_28_BOLD',
  color:'white',
  textOverflow:'wrap',
  textAlign:'center',
  backgroundColor:'black'
});

// Add to splashWindow and show
splashWindow.add(text);
splashWindow.show();

// Make request to twitch.tv
ajax (
  {
    url:'https://api.twitch.tv/kraken/streams?game=League%20of%20Legends',
    type:'json'
  },
  function(data) { 
    // Function to get streams from JSON
    var parseFeed = function(data, quantity) {
      var items = [];
      for(var i = 0; i < quantity; i++) {
        // Get user streaming and title of stream
        var name = data.streams[i].channel.display_name;
        var title = data.streams[i].channel.status;
        
        //Add to menu items 
        items.push({
          title:name,
          subtitle:title
        });
      }
      // Return entire array
      return items;
    };
    
    // Create array of top 5 streams
    var menuItems = parseFeed(data, 5);
    // Construct Menu to show to user
    var resultsMenu = new UI.Menu({
      sections: [{
        title: 'Top 5 LoL Streamers',
        items: menuItems
      }]
    });
    
    //Add an action for SELECT
    resultsMenu.on('select', function(e) {
      // Get the stream
      var stream = data.streams[e.itemIndex];
      
      // Make the body string
      var content = data.streams[e.itemIndex].channel.status;
      
      // Add Number of viewers
      content += '\n\nViewers: ' + stream.viewers;
      
      // Calculate Uptime
//       var startDate = Date.parse(stream.created_at);
//       var currentDate = Date.now();
//       var diff = Math.abs(currentDate - startDate);
      
      // calculate hours
//       var time = Math.floor(diff / 3600) % 24;
//       content += '\nUptime: ' + time + 'hours';
//       diff -= time * 3600;
//       //Add uptime 
//       if (time === 0) { //Check to make sure this works
//         time = Math.floor(diff / 60) % 60;
//         diff -= time * 60;
//         content += '\nUptime: ' + time + ' minutes';
//       } else {
//         content += '\nUptime: ' + time + ' hours';  
//       }
      
      //Add Number of followers
      content += '\nFollowers: ' + stream.channel.followers;
      
      // Create the Card for detailed view
      var detailCard = new UI.Card({
        title:stream.channel.display_name,
        body: content,
        scrollable: true,
        style: 'small'
      });
      detailCard.show();
    });
    
   
        
    // Show the Menu, hide the splash
    resultsMenu.show();
    splashWindow.hide();

    // Register for 'tap' events
    resultsMenu.on('accelTap', function(e) {
      // Make request to Twitch.tv
      ajax(
        {
          url: 'https://api.twitch.tv/kraken/streams?game=League%20of%20Legends',
          type: 'json'
        },
        function(data) {
          // Read new data and create Menu items
          var newItems = parseFeed(data, 5);
          
          // Update Menu's section
          resultsMenu.items(0, newItems);
          
          // Notify user through vibration
          Vibe.vibrate('short');
        },
        function(error) {
          console.log('Download failed ' + error);
        }
      );
    });
  },
  function(error) {
    console.log('Download failed: ' + error);
  }
);

// Initialize the accelerometer
Accel.init();
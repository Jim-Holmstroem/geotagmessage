Messages = new Mongo.Collection("messages");

if (Meteor.isClient) {
  Session.setDefault('latitude', 0);
  Session.setDefault('longitude', 0);

  set_location = function() {
      navigator.geolocation.getCurrentPosition(function(position) {
        Session.set('latitude', position.coords.latitude);
        Session.set('longitude', position.coords.longitude);
      });
  };
  Meteor.startup(
    set_location
  );

  Template.body.events({
    "submit .new-message": function (event) {
      var message = event.target.message.value;

      Messages.insert({
        text: message,
        created_at: new Date(),
        location:
          {
            "type": "Point",
            "coordinates": [
              Session.get('longitude'),
              Session.get('latitude'),
            ]
          },
        longitude: Session.get('longitude'),
        latitude: Session.get('latitude'),
      });

      event.target.message.value = "";
      return false;
    }
  });

  Template.location.helpers({
    latitude: function() { return Session.get('latitude'); },
    longitude: function() { return Session.get('longitude'); },
  });

  Template.body.helpers({
    messages: function () {
      return Messages.find({
        location:
          {
            $near:
            {
              $geometry: { type: "Point",  coordinates: [
                  Session.get('longitude'), Session.get('latitude') 
              ] },
            }
          }
      });
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Messages._ensureIndex({"location": "2dsphere"});
  });
}

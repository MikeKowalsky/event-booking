const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");

//whole code with promises
// // function to populate manually
// // -> same as below
// const events = eventIds => {
//   //MongoDB query syntax $in -> search events with id from the list of id
//   return Event.find({ _id: { $in: eventIds } })
//     .then(events => {
//       return events.map(event => {
//         return {
//           ...event._doc,
//           _id: event.id,
//           date: new Date(event._doc.date).toISOString(),
//           creator: user.bind(this, event.creator) //thanks to hoisting I can call this user function to "populate" this object
//           //because creator property should not contain single value but instead it call a function, when try to access it
//           //grahQL is checking the property: if it's a value it retunrs the value, if a function than returns the result of that function
//           //but there is no infinite loop like with "automated populate" (traditional mongoose one) because if we don't requesting particulat data from query level the function will not be executed
//         };
//       });
//     })
//     .catch(err => {
//       throw err;
//     });
// };

const events = async eventIds => {
  try {
    await Event.find({ _id: { $in: eventIds } });
    return events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator)
      };
    });
  } catch (err) {
    throw err;
  }
};

const singleEvent = async eventId => {
  try {
    const event = await Event.findById(eventId);
    return {
      ...event._doc,
      _id: event.id,
      date: new Date(event._doc.date).toISOString(),
      creator: user.bind(this, event.creator)
    };
  } catch (err) {
    throw err;
  }
};

//again promises
// //function to populate manually
// //returning a user object with overwritten _id -> object by String
// //basically I can fetch the user by id
// //"manual populational approach"
// const user = userId => {
//   return User.findById(userId)
//     .then(user => {
//       return {
//         ...user._doc,
//         _id: user.id,
//         //same here, I don't want to have this values, insted I would like to call a function
//         createdEvents: events.bind(this, user._doc.createdEvents)
//       };
//     })
//     .catch(err => {
//       throw err;
//     });
// };
const user = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      // passowrd: null, // should be here as well
      createdEvents: events.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  // events: () => {
  //   return Event.find() //async opp so wait for result, do not return before is resolve
  //     .then(events => {
  //       return events.map(event => {
  //         return {
  //           ...event._doc, //avoiding all metadata from result
  //           _id: event.id, //take id from root already in String
  //           date: new Date(event._doc.date).toISOString(),
  //           creator: user.bind(this, event._doc.creator) // insted populate automatically creator field i will take creator id, which is put here automatically and pass it to the user "populate manually" function, which then return me all user info
  //         };
  //       });
  //     })
  //     .catch(err => {
  //       console.log(err);
  //       throw err;
  //     });
  // },
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator)
        };
      });
    } catch (err) {
      throw err;
    }
  },
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return {
          ...booking._doc,
          _id: booking.id,
          user: user.bind(this, booking._doc.user),
          event: singleEvent.bind(this, booking._doc.event),
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString()
        };
      });
    } catch (err) {
      throw err;
    }
  },
  // createEvent: args => {
  //   const event = new Event({
  //     title: args.eventInput.title,
  //     description: args.eventInput.description,
  //     price: +args.eventInput.price, // to convert this to a number
  //     date: new Date(args.eventInput.date),
  //     creator: "5c27a9f5aa7c243a9962458f"
  //   });
  //   let createdEvent;
  //   return event
  //     .save()
  //     .then(result => {
  //       createdEvent = {
  //         ...result._doc,
  //         _id: result.id,
  //         date: new Date(event._doc.date).toISOString(),
  //         creator: user.bind(this, result._doc.creator)
  //       };
  //       return User.findById("5c27a9f5aa7c243a9962458f");
  //       // console.log(result);
  //       // return { ...result._doc, _id: result._doc._id.toString() }; //this syntax because result contains a lot of metadata, and this _doc is close to our object
  //       // return { ...result._doc, _id: result.id }; //we don't need to overwrite this manualy by string, because mongoose is extracting id in String for us and it puts this into root object
  //     })
  //     .then(user => {
  //       if (!user) {
  //         throw new Error("User not found.");
  //       }
  //       user.createdEvents.push(event);
  //       return user.save();
  //     })
  //     .then(result => {
  //       return createdEvent;
  //     })
  //     .catch(err => {
  //       console.log(err);
  //       throw err;
  //     });
  // },
  createEvent: async args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: "5c27dfdd40d6163e5638599b"
    });
    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = {
        ...result._doc,
        _id: result.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator)
      };
      const creator = await User.findById("5c27dfdd40d6163e5638599b");
      if (!creator) {
        throw new Error("User not found.");
      }
      creator.createdEvents.push(event);
      await creator.save();
      return createdEvent;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  // createUser: args => {
  //   return User.findOne({ email: args.userInput.email })
  //     .then(user => {
  //       if (user) {
  //         throw new Error("User already exist.");
  //       }
  //       return bcrypt.hash(args.userInput.password, 12);
  //     })
  //     .then(hashedPassword => {
  //       const user = new User({
  //         email: args.userInput.email,
  //         password: hashedPassword
  //       });
  //       return user.save();
  //     })
  //     .then(result => {
  //       return { ...result._doc, password: null, _id: result.id }; // in return object after creation I don't want to be able to see the password
  //     })
  //     .catch(err => {
  //       console.log(err);
  //       throw err;
  //     });
  // }
  createUser: async args => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error("User already exist.");
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      const user = new User({
        email: args.userInput.email,
        password: hashedPassword
      });
      const result = await user.save();
      return { ...result._doc, password: null, _id: result.id }; // in return object after creation I don't want to be able to see the password
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  bookEvent: async args => {
    const fetchedEvent = await Event.findOne({ _id: args.eventId });
    const booking = new Booking({
      user: "5c27dfdd40d6163e5638599b",
      event: fetchedEvent
    });
    const result = await booking.save();
    return {
      ...result._doc,
      _id: result.id,
      user: user.bind(this, result._doc.user),
      event: singleEvent.bind(this, result._doc.event),
      createdAt: new Date(result._doc.createdAt).toISOString(),
      updatedAt: new Date(result._doc.updatedAt).toISOString()
    };
  },
  cancelBooking: async args => {
    try {
      const booking = await Booking.findById(args.bookingId).populate("event");
      const event = {
        ...booking.event._doc,
        _id: booking.event.id,
        creator: user.bind(this, booking.event._doc.creator)
      };
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (err) {
      throw err;
    }
  }
};

//Setting the below globally fixed the ID issue for me
// const { ObjectId } = mongoose.Types
// ObjectId.prototype.valueOf = function () {
//   return this.toString()
// }

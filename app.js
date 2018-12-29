const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Event = require("./models/event");
const User = require("./models/user");

const app = express();

app.use(bodyParser.json());

//function to populate manually
//returning a user object with overwritten _id -> object by String
//basically I can fetch the user by id
//"manual populational approach"
const user = userId => {
  return User.findById(userId)
    .then(user => {
      return {
        ...user._doc,
        _id: user.id
      };
    })
    .catch(err => {
      throw err;
    });
};

app.use(
  "/graphql",
  graphqlHttp({
    schema: buildSchema(`
      type Event {
        _id: ID
        title: String!
        description: String!
        price: Float!
        date: String!
        creator: User!
      }

      type User {
        _id: ID
        email: String!
        password: String
        createdEvents: [Event!]
      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      input UserInput {
        email: String!
        password: String!
      }

      type RootQuery {
        events: [Event!]!
      }

      type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
    rootValue: {
      events: () => {
        return Event.find() //async opp so wait for result, do not return before is resolve
          .then(events => {
            return events.map(event => {
              return {
                ...event._doc, //avoiding all metadata from result
                _id: event.id, //take id from root already in String
                creator: user.bind(this, event._doc.creator) // insted populate automatically creator field i will take creator id, which is put here automatically and pass it to the user "populate manually" function, which then return me all user info
              };
            });
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      },
      createEvent: args => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price, // to convert this to a number
          date: new Date(args.eventInput.date),
          creator: "5c27a9f5aa7c243a9962458f"
        });
        let createdEvent;
        return event
          .save()
          .then(result => {
            createdEvent = { ...result._doc, _id: result.id };
            return User.findById("5c27a9f5aa7c243a9962458f");
            // console.log(result);
            // return { ...result._doc, _id: result._doc._id.toString() }; //this syntax because result contains a lot of metadata, and this _doc is close to our object
            // return { ...result._doc, _id: result.id }; //we don't need to overwrite this manualy by string, because mongoose is extracting id in String for us and it puts this into root object
          })
          .then(user => {
            if (!user) {
              throw new Error("User not found.");
            }
            user.createdEvents.push(event);
            return user.save();
          })
          .then(result => {
            return createdEvent;
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      },
      createUser: args => {
        return User.findOne({ email: args.userInput.email })
          .then(user => {
            if (user) {
              throw new Error("User already exist.");
            }
            return bcrypt.hash(args.userInput.password, 12);
          })
          .then(hashedPassword => {
            const user = new User({
              email: args.userInput.email,
              password: hashedPassword
            });
            return user.save();
          })
          .then(result => {
            return { ...result._doc, password: null, _id: result.id }; // in return object after creation I don't want to be able to see the password
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      }
    },
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PASSWORD
    }@cluster0-idsge.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`
  )
  .then(() => {
    app.listen(3000);
  })
  .catch(err => console.log(err));

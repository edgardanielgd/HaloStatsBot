const mongoClient = require('mongodb').MongoClient;
const config = require('../config');

var db = {}

const { DBUSER, DBPASS, DBNAME } = config;
const connectionURL = `mongodb+srv://${DBUSER
    }:${DBPASS
    }@cluster0.stklp.mongodb.net/${DBNAME
    }?retryWrites=true&w=majority`;

db.connect = () => new Promise((resolve, _) => {
    mongoClient.connect(
        connectionURL,
        { useNewUrlParser: true, useUnifiedTopology: true },
        (err, client) => {
            if (err) {
                // Db client won't be defined
                db.client = null;
                resolve();
            }

            console.log("Initialized database")
            db.client = client;

            resolve();
        }
    )
});

module.exports = db;
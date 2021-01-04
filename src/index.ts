import 'reflect-metadata';
import { createConnection, getConnectionOptions } from 'typeorm';
import express from 'express';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { AuthResolver } from './resolvers/AuthResolver';
import { BookResolver } from './resolvers/BookResolver';

declare module 'express-session' {
  export interface SessionData {
    userId: number;
  }
}

// const redis = require('redis');
// const connectRedis = require('connect-redis');
// const RedisStore = connectRedis(session);

// const redisClient = redis.createClient({
//   port: 6379,
//   host: 'localhost',
// });

// or redis
const SQLiteStore = connectSqlite3(session);

(async () => {
  const app = express();

  app.use(
    session({
      store: new SQLiteStore({
        db: 'database.sqlite',
        concurrentDB: true,
      }),
      // store: new RedisStore({ client: redisClient }),
      name: 'qid',
      secret: process.env.SESSION_SECRET || 'aslkdfjoiq12312',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7 * 365, // 7 years
      },
    })
  );

  // either choose options from ormconfig.js for development or production
  const dbOptions = await getConnectionOptions(
    process.env.NODE_ENV || 'development'
  );
  await createConnection({ ...dbOptions, name: 'default' });

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [AuthResolver, BookResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res }), // need to retrive user data after auth
    playground: {
      settings: {
        'request.credentials': 'include',
      },
    },
  });

  apolloServer.applyMiddleware({ app, cors: false });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}/graphql`);
  });
})();

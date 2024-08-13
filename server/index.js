import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import 'dotenv/config';
import { typeDefs } from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers/index.js';
import connectDB from './db/connect.js';
import paymentRoutes from './routes/payment.js';
import bodyParser from 'body-parser';
import cors from 'cors'; 
import orderRoutes from './routes/order.js'; 
import { auth } from './utils/auth.js'; 

import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(bodyParser.json());

app.use(cors());

const __dirname = dirname(fileURLToPath(import.meta.url));
// Uncomment these lines if you want to serve static files from the client/build directory
// app.use(express.static(path.join(__dirname, '../client/build')));

// app.get('*', function (req, res) {
//   res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
// });

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res }),
});

// const apolloServer = new ApolloServer({
//   typeDefs,
//   resolvers,
//   context: ({ req }) => {
//     const user = auth({ req });  // Use the auth function here
//     return { req, user };        // Pass the user to resolvers via context
//   },
// });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app: app });
  try {
    await connectDB(process.env.MONGO_URI);
    app.use('/api', paymentRoutes);
    app.use('/api', orderRoutes);
    app.listen(PORT, () => console.log('Server is running'));
  } catch (error) {
    throw new Error(error);
  }
};

startServer();

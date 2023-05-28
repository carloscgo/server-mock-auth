const jsonServer = require('json-server');
const auth = require('json-server-auth');
const clone = require('clone');
const cors = require('cors');

const data = require('./data.json');

const isProductionEnv = process.env.NODE_ENV === 'production';
const server = jsonServer.create();

// For mocking the POST request, POST request won't make any changes to the DB in production environment
const router = jsonServer.router(isProductionEnv ? clone(data) : 'data.json', {
  _isFake: isProductionEnv,
});

/*
 * documentation:
 * https://www.npmjs.com/package/json-server-auth
 **/
const rules = auth.rewriter({
  // Permission rules
  //users: 600,
});

server.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );

  next();
});

server.use(rules);
server.use(auth);

/*server.use(
    cors({
        origin: true,
        credentials: true,
        preflightContinue: false,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    })
)

server.options('*', cors())*/

server.use(cors());

const middlewares = jsonServer.defaults();

server.use(middlewares);

server.use((req, res, next) => {
  if (req.path !== '/') {
    router.db.setState(clone(data));
  }

  next();
});

server.use(router);

// /!\ Bind the router db to the app
server.db = router.db;

server.listen(process.env.PORT || 3001, () => {
  console.log('JSON Server is running');
});

// Export the Server API
module.exports = server;

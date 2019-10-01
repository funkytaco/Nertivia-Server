const MainServerRouter = require("express").Router();

// Middleware
const { passportJWT } = require("./../../middlewares/passport");
const GDriveOauthClient = require("./../../middlewares/GDriveOauthClient");

// Policies
const UserPresentVerification = require ('./../../middlewares/UserPresentVerification')
const serverPolicy = require("../../policies/ServerPolicies");

// Create
MainServerRouter.route('/').post(
  passportJWT,
  serverPolicy.createServer,
  require("./createServer")
);

// Update
MainServerRouter.route('/:server_id').patch(
  passportJWT,
  serverPolicy.updateServer,
  GDriveOauthClient,
  UserPresentVerification,
  require("./updateServer")
);

// Delete
MainServerRouter.route('/:server_id').delete(
  passportJWT,
  UserPresentVerification,
  require("./deleteLeaveServer")
);

// kick member
MainServerRouter.route('/:server_id/members/:unique_id').delete(
  passportJWT,
  UserPresentVerification,
  require("./kickMember")
);

// banned members
http://192.168.1.8/api/servers/6583302963345756160/bans
MainServerRouter.route('/:server_id/bans').get(
  passportJWT,
  UserPresentVerification,
  require("./bannedMembers")
)

// ban member
// http://192.168.1.8/api/servers/6583302963345756160/bans/184288888616859408
MainServerRouter.route('/:server_id/bans/:unique_id').put(
  passportJWT,
  UserPresentVerification,
  require("./banMember")
)

// un ban member
// http://192.168.1.8/api/servers/6583302963345756160/bans/184288888616859408
MainServerRouter.route('/:server_id/bans/:unique_id').delete(
  passportJWT,
  UserPresentVerification,
  require("./unBanMember")
)


// Channels
MainServerRouter.use('/', require('./channels'));

// Invites
MainServerRouter.use('/', require('./invites'));



module.exports = MainServerRouter;
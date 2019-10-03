function Permission(permission, defaultAllowed) {
  return Permission[permission, defaultAllowed] || (Permission[permission, defaultAllowed] = function(req, res, next) {
    if (!req.channel.server) return next();
    const permissions = req.channel.permissions;


    if (defaultAllowed === false) {
      if (!permissions) {
        return res.status(403).json({
          status: false,
          message: "Failed." + permission
        });
      }
      if (!permissions[permission]) {
        return res.status(403).json({
          status: false,
          message: "Failed." + permission
        });
      }
      return next();
    }


    if (!permissions) {
      return next()
    }

    if (permissions[permission] === false) {
      return res.status(403).json({
        status: false,
        message: "Failed." + permission
      });
    }
    if (permissions[permission] === true) {
      next()
    }
  })
}

module.exports = Permission
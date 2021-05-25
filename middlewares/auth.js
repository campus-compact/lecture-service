export default function (req, res, next) {
  if (true) { // TODO: Actually check the token
    // Accesstoken is defined and has permissions for the route
    next()
  } else {
    res.status(401).send('Unauthorized')
  }
};

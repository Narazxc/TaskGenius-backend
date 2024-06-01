module.exports = (fn) => {
  // catchAsync will return an anon function which will then assgin to handler/controller of each routes that the user hits
  return (req, res, next) => {
    // fn is an async function which in turn; will return promise
    fn(req, res, next).catch((err) => next(err));
  };
};

const getHome = (req, res) => {
  res.json({
    message: "Campus360 API is running",
    status: "success"
  });
};

module.exports = {
  getHome
};
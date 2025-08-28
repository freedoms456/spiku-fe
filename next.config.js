const fs = require("fs");
const path = require("path");

module.exports = {
  devServer: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "certs/localhost-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "certs/localhost-cert.pem")),
    },
  },
  images: {
    domains: ["sisdm.bpk.go.id"],
  },
};


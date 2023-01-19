const run = require("./update-package-lib");

run().then((dirs) => {
    console.log("It ran well :)", dirs)
  })
  .catch((err) => {
    console.error("Error occured :(", err)
  })

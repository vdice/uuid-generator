const { events, Job } = require("brigadier");

events.on("push", function(e, project) {
  console.log("received push for commit " + e.revision.commit)

  run_tests()
})

events.on("pull_request", function(e, project) {
  console.log("debug: event:")
  console.log(e)
  console.log("received pull_request with commit " + e.revision.commit)
  console.log("pull request url is: " + e.payload.pull_request.url)

  run_tests()
})

function run_tests() {
  // Create a new job
  var node = new Job("test-runner")

  // We want our job to run the stock Docker Python 3 image
  node.image = "python:3"

  // Now we want it to run these commands in order:
  node.tasks = [
    "cd /src/app",
    "pip install -r requirements.txt",
    "cd /src/",
    "python setup.py test"
  ]

  // We're done configuring, so we run the job
  node.run()
}
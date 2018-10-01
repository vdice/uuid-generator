const { events, Job, Group } = require("brigadier");

events.on("push", function(e, project) {
  console.log("received push for commit " + e.revision.commit)

  test_runner.run()
})

events.on("pull_request", function(e, project) {
  var parsedPayload = JSON.parse(e.payload)
  console.log("received a pull request event with the url " + parsedPayload.pull_request.url)

  start = ghNotify("pending", `Build started as ${ e.buildID }`, e, project)

  // Run tests in parallel. Then if it's a release, push binaries.
  // Then send GitHub a notification on the status.
  Group.runAll([start, test_runner])
  .then(() => {
      return ghNotify("success", `Build ${ e.buildID } passed`, e, project).run()
   }).catch(err => {
    return ghNotify("failure", `Failed build ${ e.buildID }`, e, project).run()
  });
})

function test_runner() {
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
  return node
}

function ghNotify(state, msg, e, project) {
  const gh = new Job(`notify-${ state }`, "technosophos/github-notify:latest")
  gh.env = {
    GH_REPO: project.repo.name,
    GH_STATE: state,
    GH_DESCRIPTION: msg,
    GH_CONTEXT: "brigade",
    GH_TOKEN: project.secrets.ghToken,
    GH_COMMIT: e.revision.commit,
    GH_TARGET_URL: `http://104.41.134.224/kashti/builds/${ e.buildID }`,
  }
  return gh
}
const exec = require("child_process").execSync;
const run = require("./update-package-lib");

const lexec = function(command) {
  console.log(`> ${command}`);
  const out = exec(command).toString("utf8");
  console.log(out);
  return out;
};

const startHash = exec("git rev-parse HEAD");
const toBranch = "snapshot";
try {
  lexec("git diff-index --quiet HEAD --");
} catch (e) {
  console.log("Invalid State. Repository has uncommited changes. Aborting...");
  process.exit(1);
}

function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

function publish(dir) {
  lexec(`npm publish --access public ${dir}`);
}

async function processSlowly(dirs, i) {
  if (dirs.length >= i) {
    return
  } else {
    publish(dirs[i])
    await sleep(5000)
    await processSlowly(dirs, i + 1)
  }
}

run().then((async dirs => {
  try {
    lexec('git add packages');
    lexec('git commit -m "Update dependencies"')
    lexec(`git push -f origin HEAD:${toBranch}`);
    await processSlowly(dirs, 0)
  } catch (e) {
    console.log(e.message);
  }
}))
.catch(e => {
  console.log(e.message);
})
.finally(() => {
  lexec("git reset --hard " + startHash);
})


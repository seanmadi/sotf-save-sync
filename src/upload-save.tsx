import { Octokit } from "@octokit/rest"
import fs from "fs"

export const uploadSave = async (
  savePath,
  githubToken,
  githubGistId,
  callback
) => {
  const octokit = new Octokit({
    auth: `token ${githubToken}`,
  })

  let gist
  try {
    // Get the gist you made using the gist id
    gist = await octokit.gists.get({ gist_id: githubGistId })
  } catch (error) {
    console.error(`Unable to get gist\n${error}`)
  }

  const filenames = fs.readdirSync(savePath)
  // Loop through files in save directory
  // Create object with each filename and it's content
  const filesObj = filenames.reduce((acc, fn) => {
    return {
      ...acc,
      [fn]: {
        content: fs.readFileSync(`${savePath}\\${fn}`, {
          encoding: "utf8",
          flag: "r",
        }),
      },
    }
  }, {})

  try {
    // Update the gist
    // The description is displayed when the gist is pinned
    // so we can update the description along with the contents
    // to show more information when it's pinned
    await octokit.gists.update({
      gist_id: githubGistId,
      files: filesObj,
    })
    callback(null)
  } catch (error) {
    console.error(`Unable to update gist\n${error}`)
    callback(`Unable to update gist\n${error}`)
  }
}

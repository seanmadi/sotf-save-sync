import { Octokit } from "@octokit/rest"
import fs from "fs"
import fse from "fs-extra"
import { systemValues } from "./system-values"
import { clientSaveDirNameFromHostSave, playerFiles } from "./utility"

export const uploadSave = async (saveDirName, githubToken, githubGistId) => {
  const systemVals = await systemValues()
  const hostSavePath = `${systemVals.hostSavesDir}\\${saveDirName}`
  const clientSavePath = `${systemVals.clientSavesDir}\\${saveDirName}`

  return new Promise(async (resolve, reject) => {
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

    const filenames = fs.readdirSync(hostSavePath)
    // Loop through files in save directory
    // Create object with each filename and it's content
    const filesObj = filenames.reduce((acc, fn) => {
      return {
        ...acc,
        [fn]: {
          content: fs.readFileSync(`${hostSavePath}\\${fn}`, {
            encoding: "utf8",
            flag: "r",
          }),
        },
      }
    }, {})

    try {
      // # Update the gist
      // The description is displayed when the gist is pinned
      // so we can update the description along with the contents
      // to show more information when it's pinned
      await octokit.gists.update({
        gist_id: githubGistId,
        files: filesObj,
      })

      // Copy the player save info from the host dir over to the client dir
      const clientSaveDirName = clientSaveDirNameFromHostSave(
        hostSavePath,
        systemVals.rootSavesDir
      )
      const fromDirectory = hostSavePath
      const toDirectory = clientSavePath
      // If we found a client save already there, then copy the files over to it from host save
      // If we didn't find it, then we're just going to copy the entire host save over to client
      if (clientSaveDirName) {
        for (const fileName of playerFiles) {
          fse.copySync(
            `${fromDirectory}\\${fileName}`,
            `${toDirectory}\\${fileName}`,
            { overwrite: true }
          )
        }
      } else {
        if (!fs.existsSync(toDirectory)) {
          fs.mkdirSync(toDirectory, { recursive: true })
        }
        fse.copySync(fromDirectory, toDirectory, { overwrite: true })
      }

      resolve("success")
    } catch (error) {
      console.error(`Unable to update gist\n${error}`)
      reject(`Unable to update gist\n${error}`)
    }
  })
}

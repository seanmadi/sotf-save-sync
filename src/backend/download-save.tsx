import { Octokit } from "@octokit/rest"
import fs from "fs"
import axios from "axios"
import fse from "fs-extra"
import { systemValues } from "./system-values"
import { clientSaveDirNameFromHostSave, playerFiles } from "./utility"

export const downloadSave = async (saveDirName, githubToken, githubGistId) => {
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

    // Add directory for saves in Multiplayer if doesn't exist
    // This would happen if this player has never hosted this game
    if (!fs.existsSync(hostSavePath)) {
      fs.mkdirSync(hostSavePath, { recursive: true })
    }

    try {
      const gistContent = await octokit.gists.get({ gist_id: githubGistId })
      for (const key of Object.keys(gistContent.data.files)) {
        const fileName = key
        const fileContent = gistContent.data.files[key]
        const response = await axios.get(fileContent.raw_url)
        const content = response.data
        fs.writeFileSync(
          `${hostSavePath}\\${fileName}`,
          JSON.stringify(content)
        )
      }

      // Copy the player save info from the client dir over to the host dir
      const clientSaveDirName = clientSaveDirNameFromHostSave(
        hostSavePath,
        systemVals.rootSavesDir
      )
      const fromDirectory = clientSavePath
      const toDirectory = hostSavePath
      // Actually do the copying
      if (clientSaveDirName) {
        for (const fileName of playerFiles) {
          fse.copySync(
            `${fromDirectory}\\${fileName}`,
            `${toDirectory}\\${fileName}`,
            { overwrite: true }
          )
        }
      }

      resolve("success")
    } catch (error) {
      console.error(`Unable to get gist\n${error}`)
      reject(`Unable to get gist\n${error}`)
    }
  })
}

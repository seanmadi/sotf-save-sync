import { Octokit } from "@octokit/rest"
import fs from "fs"
import fse from "fs-extra"

export const uploadSave = async (savePath, githubToken, githubGistId) => {
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

      // Copy the player save info from the host dir over to the client dir
      // TODO: This is bad I know
      const clientSavePath = savePath
        .replace("Multiplayer", "MultiplayerClient")
        .split("\\")
        .slice(0, -1)
        .join("\\")

      // Get GameId from the host save that we just downloaded, so that we can
      // find the correct client save that matches the GameId
      const gameStateContent = fs.readFileSync(
        `${savePath}\\GameStateSaveData.json`,
        {
          encoding: "utf8",
          flag: "r",
        }
      )
      const parsedGameStateContent = JSON.parse(gameStateContent)
      const parsedGameState = JSON.parse(parsedGameStateContent.Data.GameState)
      const gameId = parsedGameState.GameId
      // Search through client save directories to find the one that matches the GameId
      const directoryNames = fs.readdirSync(clientSavePath)
      let clientSaveDir = null
      for (const dir of directoryNames) {
        const clientGameStateContent = fs.readFileSync(
          `${clientSavePath}\\${dir}\\GameStateSaveData.json`,
          {
            encoding: "utf8",
            flag: "r",
          }
        )
        if (clientGameStateContent.includes(gameId)) {
          clientSaveDir = dir
        }
      }

      // If we found a client save already there, then copy the files over to it from host save
      // If we didn't find it, then we're just going to copy the entire host save over to client
      if (clientSaveDir) {
        fse.copySync(
          `${savePath}\\PlayerArmourSystemSaveData.json`,
          `${clientSavePath}\\${clientSaveDir}\\PlayerArmourSystemSaveData.json`,
          { overwrite: true }
        )
        fse.copySync(
          `${savePath}\\PlayerClothingSystemSaveData.json`,
          `${clientSavePath}\\${clientSaveDir}\\PlayerClothingSystemSaveData.json`,
          { overwrite: true }
        )
        fse.copySync(
          `${savePath}\\PlayerInventorySaveData.json`,
          `${clientSavePath}\\${clientSaveDir}\\PlayerInventorySaveData.json`,
          { overwrite: true }
        )
        fse.copySync(
          `${savePath}\\PlayerRetrieveDroppedInventoryActionSaveData.json`,
          `${clientSavePath}\\${clientSaveDir}\\PlayerRetrieveDroppedInventoryActionSaveData.json`,
          { overwrite: true }
        )
        fse.copySync(
          `${savePath}\\PlayerStateSaveData.json`,
          `${clientSavePath}\\${clientSaveDir}\\PlayerStateSaveData.json`,
          { overwrite: true }
        )
      } else {
        const clientSavePath = savePath.replace(
          "Multiplayer",
          "MultiplayerClient"
        )
        if (!fs.existsSync(clientSavePath)) {
          fs.mkdirSync(clientSavePath, { recursive: true })
        }
        fse.copySync(savePath, clientSavePath, { overwrite: true })
      }

      resolve("success")
    } catch (error) {
      console.error(`Unable to update gist\n${error}`)
      reject(`Unable to update gist\n${error}`)
    }
  })
}

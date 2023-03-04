import { Octokit } from "@octokit/rest"
import fs from "fs"
import axios from "axios"
import fse from "fs-extra"

export const downloadSave = async (
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

  // Add directory for saves in Multiplayer if doesn't exist
  // This would happen if this player has never hosted this game
  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true })
  }

  try {
    const gistContent = await octokit.gists.get({ gist_id: githubGistId })
    for (const key of Object.keys(gistContent.data.files)) {
      const fileName = key
      const fileContent = gistContent.data.files[key]
      const response = await axios.get(fileContent.raw_url)
      const content = response.data
      fs.writeFileSync(`${savePath}\\${fileName}`, JSON.stringify(content))
    }

    // Copy the player save info from the client dir over to the host dir
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

    if (clientSaveDir) {
      fse.copySync(
        `${clientSavePath}\\${clientSaveDir}\\PlayerArmourSystemSaveData.json`,
        `${savePath}\\PlayerArmourSystemSaveData.json`,
        { overwrite: true }
      )
      fse.copySync(
        `${clientSavePath}\\${clientSaveDir}\\PlayerClothingSystemSaveData.json`,
        `${savePath}\\PlayerClothingSystemSaveData.json`,
        { overwrite: true }
      )
      fse.copySync(
        `${clientSavePath}\\${clientSaveDir}\\PlayerInventorySaveData.json`,
        `${savePath}\\PlayerInventorySaveData.json`,
        { overwrite: true }
      )
      fse.copySync(
        `${clientSavePath}\\${clientSaveDir}\\PlayerRetrieveDroppedInventoryActionSaveData.json`,
        `${savePath}\\PlayerRetrieveDroppedInventoryActionSaveData.json`,
        { overwrite: true }
      )
      fse.copySync(
        `${clientSavePath}\\${clientSaveDir}\\PlayerStateSaveData.json`,
        `${savePath}\\PlayerStateSaveData.json`,
        { overwrite: true }
      )
    }

    callback(null)
  } catch (error) {
    console.error(`Unable to get gist\n${error}`)
    callback(`Unable to get gist\n${error}`)
  }
}

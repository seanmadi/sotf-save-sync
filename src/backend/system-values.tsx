import fs from "fs"
import os from "os"

export const systemValues = async () => {
  // First find user's steam id, so we can access the right directory
  // We assume only one user has ever played this game on this computer
  const savesDir = `C:\\Users\\${
    os.userInfo().username
  }\\AppData\\LocalLow\\Endnight\\SonsOfTheForest\\Saves`
  const saveDirs = fs.readdirSync(savesDir)
  const steamId = saveDirs.reduce((_acc, d) => d, "")
  const hostSavesDir = `${savesDir}\\${steamId}\\Multiplayer`
  const clientSavesDir = `${savesDir}\\${steamId}\\MultiplayerClient`
  const rootSavesDir = `${savesDir}\\${steamId}`

  // Loop through save directories and check the last updated dates for the files inside each one
  // We want to find out what the save directory is with the most recently written files
  const files = await fs.promises.readdir(hostSavesDir)

  let latestDirectoryName: string | null = null
  let latestDirectoryTime: Date | null = null

  if (!files) {
    return {
      steamId,
      latestDirectoryName: "",
      hostSavesDir,
      clientSavesDir,
      rootSavesDir,
    }
  }

  files.map((f) => {
    const filePath = `${hostSavesDir}\\${f}\\FurnitureStorageSaveData.json`
    try {
      const stats = fs.statSync(filePath)

      if (latestDirectoryName == null || latestDirectoryTime < stats.mtime) {
        latestDirectoryName = f
        latestDirectoryTime = stats.mtime
      }
    } catch (error) {
      console.log(error)
      return ""
    }
  })
  const result = {
    steamId,
    latestDirectoryName,
    hostSavesDir,
    clientSavesDir,
    rootSavesDir,
  }
  return result
}

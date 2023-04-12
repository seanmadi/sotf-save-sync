import fs from "fs"

// The player files that need to be copied over from host to client, or vise versa
export const playerFiles = [
  "PlayerArmourSystemSaveData.json",
  "PlayerClothingSystemSaveData.json",
  "PlayerInventorySaveData.json",
  "PlayerRetrieveDroppedInventoryActionSaveData.json",
  "PlayerStateSaveData.json",
]

// Helper function to find the correct client save directory name that
// corresponds to the game ID in the host save
export const clientSaveDirNameFromHostSave = (
  hostSavePath: string,
  rootSavesDir: string
) => {
  const clientRootPath = `${rootSavesDir}\\MultiplayerClient`
  // Get GameId from the host save that we just downloaded, so that we can
  // find the correct client save that matches the GameId
  const gameStateContent = fs.readFileSync(
    `${hostSavePath}\\GameStateSaveData.json`,
    {
      encoding: "utf8",
      flag: "r",
    }
  )
  const parsedGameStateContent = JSON.parse(gameStateContent)
  const parsedGameState = JSON.parse(parsedGameStateContent.Data.GameState)
  const gameId = parsedGameState.GameId
  // Search through client save directories to find the one that matches the GameId
  const directoryNames = fs.readdirSync(clientRootPath)
  let clientSaveDirName = null
  for (const dir of directoryNames) {
    const clientGameStateContent = fs.readFileSync(
      `${clientRootPath}\\${dir}\\GameStateSaveData.json`,
      {
        encoding: "utf8",
        flag: "r",
      }
    )
    if (clientGameStateContent.includes(gameId)) {
      clientSaveDirName = dir
    }
  }
  return clientSaveDirName
}

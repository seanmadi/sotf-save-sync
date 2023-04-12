import { useEffect } from "react"
import "semantic-ui-css/semantic.min.css"
import { Button, Form, Input, Label, Tab } from "semantic-ui-react"
const { ipcRenderer } = window.require("electron")

import "./App.css"
import { useMainMutation, useSetting } from "./hooks"

export const App = () => {
  const [githubToken, setGithubToken] = useSetting("github-token")
  const [githubGistId, setGithubGistId] = useSetting("github-gist-id")
  const [latestSaveFile, setLatestSaveFile] = useSetting("latest-save")
  const [steamId, setSteamId] = useSetting("steam-id")
  const [hostSavesDir, setHostSavesDir] = useSetting("hosts-save-dir")
  const {
    isLoading: uploadIsLoading,
    isSuccess: uploadIsSuccess,
    error: uploadError,
    mutate: uploadSave,
  } = useMainMutation({
    mutationFn: () =>
      ipcRenderer.invoke(
        "uploadSave",
        githubToken,
        githubGistId,
        latestSaveFile
      ),
  })
  const {
    isLoading: downloadIsLoading,
    isSuccess: downloadIsSuccess,
    error: downloadError,
    mutate: downloadSave,
  } = useMainMutation({
    mutationFn: () =>
      ipcRenderer.invoke(
        "downloadSave",
        githubToken,
        githubGistId,
        latestSaveFile
      ),
  })

  // On first load, grab latest save file name, steamId, and host save directory
  // (note that the listener for this coming back is defined below)
  useEffect(() => {
    const requestSystemValues = async () => {
      const result = await ipcRenderer.invoke("requestSystemValues")

      // Fill in defaults if they aren't already set (from a previous load/save)
      if (latestSaveFile == "") {
        setLatestSaveFile(result.latestDirectoryName)
      }
      if (steamId == "") {
        setSteamId(result.steamId)
      }
      if (hostSavesDir == "") {
        setHostSavesDir(result.hostSavesDir)
      }
    }

    requestSystemValues()
  }, [])

  const savePath = `${hostSavesDir}\\${latestSaveFile}`

  const panes = [
    {
      menuItem: "Config",
      render: () => (
        <Tab.Pane className="full-screen">
          <Form>
            <Form.Field>
              <label>Github Token</label>
              <p>Instructions to come on how to obtain this.</p>
              <Input
                placeholder="Github token"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
              />
            </Form.Field>
            <Form.Field>
              <label>Github Gist ID</label>
              <p>Instructions to come on how to obtain this.</p>
              <Input
                placeholder="Github gist ID"
                value={githubGistId}
                onChange={(e) => setGithubGistId(e.target.value)}
              />
            </Form.Field>
            <Form.Field>
              <label>Steam Id</label>
              <p>
                Automatically discovered if you are the only user on this
                computer to play the game.
              </p>
              <Input
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
              />
            </Form.Field>
            <Form.Field>
              <label>Host Save Directory Name</label>
              <p>
                Defaults to the most recently written host save directory on
                your system.
              </p>
              <Input
                value={latestSaveFile}
                onChange={(e) => setLatestSaveFile(e.target.value)}
              />
            </Form.Field>
          </Form>
        </Tab.Pane>
      ),
    },
    {
      menuItem: "Sync",
      render: () => (
        <Tab.Pane className="full-screen">
          <p style={{ margin: "1rem" }}>
            Upload save files located at{" "}
            <code style={{ wordWrap: "break-word" }}>{savePath}</code>
          </p>
          <Button fluid positive loading={uploadIsLoading} onClick={uploadSave}>
            Upload save
          </Button>
          {uploadError && (
            <Label basic color="red" pointing>
              {uploadError}
            </Label>
          )}
          {uploadIsSuccess && (
            <Label basic color="green" pointing>
              Successfully uploaded
            </Label>
          )}

          <p style={{ margin: "1rem" }}>
            Download save files to{" "}
            <code style={{ wordWrap: "break-word" }}>{savePath}</code>
          </p>
          <Button
            fluid
            positive
            loading={downloadIsLoading}
            onClick={downloadSave}
          >
            Download save
          </Button>
          {downloadError && (
            <Label basic color="red" pointing>
              {downloadError}
            </Label>
          )}
          {downloadIsSuccess && (
            <Label basic color="green" pointing>
              Successfully downloaded
            </Label>
          )}
        </Tab.Pane>
      ),
    },
  ]

  return (
    <div className="full-screen">
      <Tab panes={panes} className="full-screen" />
    </div>
  )
}

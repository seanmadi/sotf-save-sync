import React, { useEffect, useState } from "react"
import "semantic-ui-css/semantic.min.css"
import {
  Button,
  Container,
  Form,
  Header,
  Input,
  Label,
  Tab,
} from "semantic-ui-react"
const { ipcRenderer } = window.require("electron")
import "./App.css"

export const App = () => {
  const [githubToken, setGithubToken] = useState("")
  const [githubGistId, setGithubGistId] = useState("")
  const [latestSaveFile, setLatestSaveFile] = useState("")
  const [steamId, setSteamId] = useState("")
  const [hostSavesDir, setHostSavesDir] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(null)

  useEffect(() => {
    ipcRenderer.on(
      "setLatestSaveFile",
      (_event, { steamId, latestDirectoryName, hostSavesDir }) => {
        setLatestSaveFile(latestDirectoryName)
        setSteamId(steamId)
        setHostSavesDir(hostSavesDir)
      }
    )

    ipcRenderer.on("uploadSaveComplete", (_event, message) => {
      setUploading(false)
      if (message) {
        setUploadError(message)
      } else {
        setUploadSuccess(true)
      }
    })

    // Clean the listener after the component is dismounted
    // TODO: make this work, its erroring for me wanting an argument
    // return () => {
    //   ipcRenderer.removeAllListeners()
    // }
  }, [])

  // On first load, grab latest save file name
  useEffect(() => {
    ipcRenderer.send("getLatestSavefile")
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
          <Button
            fluid
            positive
            loading={uploading}
            onClick={() => {
              setUploadError(null)
              setUploading(true)
              ipcRenderer.send(
                "uploadSave",
                githubToken,
                githubGistId,
                savePath
              )
            }}
          >
            Upload save
          </Button>
          {uploadError && (
            <Label basic color="red" pointing>
              {uploadError}
            </Label>
          )}
          {uploadSuccess && (
            <Label basic color="green" pointing>
              Successfully uploaded
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

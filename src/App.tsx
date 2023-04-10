import React, { useEffect, useState } from "react"
import "semantic-ui-css/semantic.min.css"
import { Button, Form, Input, Label, Tab } from "semantic-ui-react"
const { ipcRenderer } = window.require("electron")
import "./App.css"

// Hook to utilize localstorage
const useSetting = (key: string, initialValue: string = "") => {
  const [value, setValue] = useState(() => {
    return localStorage.getItem(key) || initialValue
  })

  // Method returned that will set the value in state and localstorage
  const setValueInBothPlaces = (val: string) => {
    const valueToSet = val || ""
    localStorage.setItem(key, valueToSet)
    setValue(valueToSet)
  }

  return [value, setValueInBothPlaces] as [string, (val: string) => void]
}

export const App = () => {
  const [githubToken, setGithubToken] = useSetting("github-token")
  const [githubGistId, setGithubGistId] = useSetting("github-gist-id")
  const [latestSaveFile, setLatestSaveFile] = useSetting("latest-save")
  const [steamId, setSteamId] = useSetting("steam-id")
  const [hostSavesDir, setHostSavesDir] = useSetting("hosts-save-dir")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState(null)
  const [downloadSuccess, setDownloadSuccess] = useState(null)

  useEffect(() => {
    ipcRenderer.on("setLatestSaveFile", (_event, systemValues) => {
      // Fill in defaults if they aren't already set (from a previous load/save)
      // It's gotta be whacky like this because we are getting the values from
      // a script that is on the (main) server side and we've got to subscribe
      // and wait to asyncronously get that information
      if (latestSaveFile == "") {
        setLatestSaveFile(systemValues.latestDirectoryName)
      }
      if (steamId == "") {
        setSteamId(systemValues.steamId)
      }
      if (hostSavesDir == "") {
        setHostSavesDir(systemValues.hostSavesDir)
      }
    })

    ipcRenderer.on("uploadSaveComplete", (_event, message) => {
      setUploading(false)
      if (message) {
        setUploadError(message)
      } else {
        setUploadSuccess(true)
      }
    })

    ipcRenderer.on("downloadSaveComplete", (_event, message) => {
      setDownloading(false)
      if (message) {
        setDownloadError(message)
      } else {
        setDownloadSuccess(true)
      }
    })

    // Clean the listener after the component is dismounted
    // TODO: make this work, its erroring for me wanting an argument
    // return () => {
    //   ipcRenderer.removeAllListeners()
    // }
  }, [])

  // On first load, grab latest save file name, steamId, and host save directory
  // (note that the listener for this coming back is defined below)
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

          <p style={{ margin: "1rem" }}>
            Download save files to{" "}
            <code style={{ wordWrap: "break-word" }}>{savePath}</code>
          </p>
          <Button
            fluid
            positive
            loading={downloading}
            onClick={() => {
              setDownloadError(null)
              setDownloading(true)
              ipcRenderer.send(
                "downloadSave",
                githubToken,
                githubGistId,
                savePath
              )
            }}
          >
            Download save
          </Button>
          {downloadError && (
            <Label basic color="red" pointing>
              {downloadError}
            </Label>
          )}
          {downloadSuccess && (
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

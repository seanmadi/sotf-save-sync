import React, { useEffect, useState } from "react"
import "semantic-ui-css/semantic.min.css"
import { Container, Form, Header, Input, Tab } from "semantic-ui-react"
const { ipcRenderer } = window.require("electron")
import "./App.css"

export const App = () => {
  const [latestSaveFile, setLatestSaveFile] = useState("")
  const [steamId, setSteamId] = useState("")

  useEffect(() => {
    ipcRenderer.on(
      "setLatestSaveFile",
      (_event, { steamId, latestDirectoryName }) => {
        setLatestSaveFile(latestDirectoryName)
        setSteamId(steamId)
      }
    )

    // Clean the listener after the component is dismounted
    return () => {
      ipcRenderer.removeAllListeners()
    }
  }, [])

  // On first load, grab latest save file name
  useEffect(() => {
    ipcRenderer.send("getLatestSavefile")
  }, [])

  const panes = [
    {
      menuItem: "Config",
      render: () => (
        <Tab.Pane className="full-screen">
          <Form>
            <Form.Field>
              <label>Github Token</label>
              <p>Instructions to come on how to obtain this.</p>
              <Input placeholder="Github token" />
            </Form.Field>
            <Form.Field>
              <label>Steam Id</label>
              <p>
                Automatically discovered if you are the only user on this
                computer to play the game.
              </p>
              <Input defaultValue={steamId} />
            </Form.Field>
            <Form.Field>
              <label>Host Save Directory Name</label>
              <p>
                Defaults to the most recently written host save directory on
                your system.
              </p>
              <Input defaultValue={latestSaveFile} />
            </Form.Field>
          </Form>
        </Tab.Pane>
      ),
    },
    {
      menuItem: "Sync",
      render: () => <Tab.Pane className="full-screen">Sync actions</Tab.Pane>,
    },
  ]

  return (
    <div className="full-screen">
      <Tab panes={panes} className="full-screen" />
    </div>
  )
}

# Sons of the Forest Save Sync

Share your hosted Sons of the Forest save with your group of friends, so that anyone can be the host at any time with ease.

I developed this application so that I could use it with friends, and I hope you can as well. I would suggest backing up your saves just in case anything does go wrong. They are located here:

`C:\Users\YOUR_NAME\AppData\LocalLow\Endnight\SonsOfTheForest\Saves\YOUR_STEAM_ID`

I have tested everything working great amongst my friends, but I am not responsible for if there is anything I missed or if an update messes anything up in the future.

This app has been tested up through Patch 3 of Sons of the Forest.

# Prerequisites for using the application

The simplest way I could think of for sharing your save files was to use a Github gist. This is because the files are all text files, it's easy to make a Github account, and the API is really easy to use to updating a gist (compared to something like Google drive).

The steps below only need to be performed by one person in the group and only once, then you're all set and never need to worry about it again.

## Github account
First you need to have a Github account, or [create one for the group](https://github.com/join).

## Gist to store save files
Next, you need to [create a Github gist](https://gist.github.com), which if you don't know is basically a collection of text files on Github. Name the gist anything you want, and just put literally anything in as the file name and leave the context blank. Something just needs to be there to let you create the gist.

![Creating gist](https://user-images.githubusercontent.com/576752/231556892-e7759565-6631-4fce-aebe-4d9026340dc4.png "Creating gist")

Press "Create secret gist" and then note the gist id that is in the url of the browser (`https://gist.github.com/YOUR_NAME/GIST_ID`).

![Created the gist](https://user-images.githubusercontent.com/576752/231557162-cb8b748e-9b4e-4732-97fe-a4cb9f02232d.png "Created the gist")

## Github token
Finally, you need to [Create a Github token](https://github.com/settings/personal-access-tokens/new) which is what the application uses to update your gist.

Name the token "Sons of the Forest" or whatever you'd like, set the expiration to whatever you want, then scroll down to **Permissions** and set **Gists** to **Access: Read and write**.

![Create a token](https://user-images.githubusercontent.com/576752/231558308-e40469d5-6600-431f-9dc5-3000bf2527d7.png "Create a token")

Click "Generate token" and make sure you write down the token.

## Now we're ready!

Once you've done the steps above, you should have a **gist id** and a **github token**, and you are ready to rock.

# Using the application

## Setup

![Config screen](https://user-images.githubusercontent.com/576752/231561332-43bea013-2f6b-431e-be02-3237479907b6.png "Config screen")

[Download the application]() and open the `sotf-save-sync-0.1.0 Setup.exe` file (which basically just opens the app).

Fill in the **Github Token** and **Github Gist ID**.

The **Steam ID** will already be filled out. The application finds it automatically by looking in the Sons of the Forest save directory and then finding the first directory there (which is a Steam ID). If you have more than one Steam user on your computer, you may have to change this value to the other user.

The **Host Save Directory Name** will also automatically be filled in with the most recently written save directory in your system. If you want to use a different save file, look at the following directory and pick the one that is the one you want to be uploading and downloading to:

`C:\Users\YOUR_NAME\AppData\LocalLow\Endnight\SonsOfTheForest\Saves\YOUR_STEAM_ID\Multiplayer`

If you've never hosted before, you can leave this blank because there won't be any save directories in there yet. Then once you download the save, you may need to restart the app before you upload (so that the value is filled out).

## Let's sync!

![Sync screen](https://user-images.githubusercontent.com/576752/231561480-603bfc80-27fa-4c13-9876-dc4d21706c2b.png "Sync screen")

### Upload save

Clicking the **Upload save** button will upload the contents of all of the save files in your `Multiplayer\save_id` directory up into your gist. The **Multiplayer** directory is the "Host saves" directory.

It will then look into the **MultiplayerClient** directory and find the "Client save" directory that corresponds to your "Host save" that you just uploaded, and copy the Player files from Host to Client. This is so that when in the future you are a client, your player save data will be there. If a "Client save" directory doesn't exist yet (in other words, you haven't been the client to someone else hosting the save yet), then it will just copy the "Host save" over.

### Download save

Clicking the **Download save** button will download the contents of all of the save files from your gist into your `Multiplayer\save_id` directory.

It will then look into the **MultiplayerClient** directory and find the "Client save" directory that corresponds to your "Host save" that you just uploaded, and copy the Player files from Client to Host that was just downloaded. This is so that if you were the client on this save before, your player save data will be there.

### More information about the saves

Just to give a little more information, and reiteration:

The **Multiplayer** directory is the "Host saves" directory.

The **MultiplayerClient** directory is the "Client saves" directory.

There are 5 Player save files (that begin with "Player") within both the Multiplayer and MultiplayerClient directories. These Player files are copied from Host to Client when uploading, and Client to Host when downloading, because you want to keep your Player save data regardless of the world save data changing.

The way the application figures out what Client save data corresponds to what Host save data is by looking at the `Data.GameState.GameID` value in `GameStateSaveData.json`.

# Development

Development must be done on Windows.

Install Node for Windows.

`npm install`

`npm start`
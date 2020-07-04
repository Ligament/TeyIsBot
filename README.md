[![Build Status](https://travis-ci.com/Ligament/TeyIsBot.svg?branch=master)](https://travis-ci.com/Ligament/TeyIsBot)


## [Demo](https://lin.ee/McYex7Z)

<p align="center">
	<img src="https://qr-official.line.me/sid/M/932uadig.png">
</p>

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). And using [Firebase](https://firebase.google.com/)

## Getting started

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Clone the repo

```bash
git clone https://github.com/Ligament/TeyIsBot.git
```

### 3. Install dependencies.

```bash
cd TeyIsBot
npm install
cd functions && npm install
```

### 4. Firebase Configuration

Create the *.env* file.

The *.env* files could look like the following then:

```env
REACT_APP_FIREBASE_CONFIG_BASE64=your-firebase-configuration-in-base64-string
REACT_APP_LIFF_ID_MAIN=liffId
REACT_APP_LIFF_ID_SIGN_UP=liffId
```

Create the *.runtimeconfig.json* in *functions*

The *.env* files could look like the following then:

```json
{
  "line": {
    "channel_secret": "channel secret",
    "channelid": "channel id",
    "channel_access_token": "channel access token"
  }
}
```

### 5. Deployment process with firebase

In your root directory run:
```bash
yarn build
firebase deploy
```

## Run in local

Download the *serviceAccount* from your Firebase project's dashboard into to your root directory.

In your root directory run:

***PowerShell***
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccount.json"
```

***Unix***
```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccount.json"
```

and run:
```bash
firebase emulators:start
```

More detail on [Firebase](https://firebase.google.com/docs/functions/local-emulator#set_up_admin_credentials_optional)

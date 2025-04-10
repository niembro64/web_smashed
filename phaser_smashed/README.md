# Phaser Smashed

A Phaser 3-based Smash-style game built with React.

## Development

To start the development server:

```bash
npm install
npm start
```

This runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Electron Development

To run the game in Electron during development:

```bash
npm run electron:start
```

## Building for Windows

To build the game as a Windows desktop application:

```bash
npm run package:win
```

This will create an installer in the `dist` folder.

## Building for Steam

1. Set up your Steam application ID in `public/electron.js`
2. Make sure you have the Steam SDK files in the `steam_api` folder
3. Run the build command:

```bash
npm run package:steam
```

## Steam Integration

This game includes Steam integration for:
- Achievements
- Screenshots
- Leaderboards

To enable these features, you need to:
1. Register your game on Steam
2. Get your App ID from Steamworks
3. Update the App ID in `public/electron.js`
4. Add your Steam API files to the `steam_api` folder

## Project Structure

- `/src` - React application source code
- `/src/scenes` - Phaser game scenes
- `/src/views` - React UI components
- `/public` - Static assets
- `/public/images` - Game images
- `/public/sounds` - Game sounds

## Building for Web

The standard web build can still be created with:

```bash
npm run build
```

This builds the app for web production to the `build` folder. It correctly bundles React in production mode and optimizes the build for web browsers.

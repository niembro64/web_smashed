STEAM INTEGRATION INSTRUCTIONS

1. Place your Steam API files in this directory:

   - For Windows: 
     - Place steam_api.dll and steam_api64.dll in the win/ subdirectory
     - These files are available from your Steamworks SDK

2. Update the Steam App ID in public/electron.js:
   - Look for: const client = steamworks.init(1234567);
   - Replace 1234567 with your actual Steam App ID

3. Create a steam_appid.txt file in the steam_api/ directory containing just your app ID number

4. For testing outside of Steam:
   - You'll need to have Steam running
   - Be logged into an account that owns the game or is part of the app's beta

For more information, refer to the Steamworks documentation:
https://partner.steamgames.com/doc/sdk
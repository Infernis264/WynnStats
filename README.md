# WynnStats
This is an archive of the code that ran the WynnStats Discord bot. This code is not going to be updated. A lot of it is outdated, some of it broken, but if you would like to incorporate it into another project, feel free to. 

Thanks for using this bot for the time it was running :)

# Running a clone*
If you wanted to run your own version of the bot, follow these steps:

 1. `git clone` the project into a directory on your host machine
 2. Open command prompt/terminal and `cd` into the project directory.
 3. Run `npm install` (if you don't have nodejs installed on your system, install it)
 4. Create a new application at https://discord.com/developers/applications
 5. Make the application into a bot, reveal the token, and copy it.
 6. In the last line of `index.js` remove the comment and replace it with your token surrounded by quotes.
 7. Run `node index.js` and it should start the bot.
 8. Add your bot to a Discord server

You will probably also need to run a separate server that has what is in the api folder running on it, but with some tweaks to the code any need for the server in the first place is unnecessary. Alternatively you could run the server on your local network and I think it will work as long as you replace any `/* api website url */` comments with `"localhost:[PORT NAME]` for whatever port you're running the server on.

**This code is not guaranteed to work, and could need some fixing. Some of the dependencies are out of date, and with updated dependencies, I am not sure if the code can still function without breaking.*
# Contributing
If you want to contribute to the codebase then by all means go ahead. I'll monitor the repository if someone wants to update the code, but this project is pretty much dev-dead unless someone wants to pick it up again. I will merge any commits if you do indeed have any interest in keeping this project alive.

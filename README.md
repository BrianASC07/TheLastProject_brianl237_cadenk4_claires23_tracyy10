# TBD by The Last Project
## Description
Our project will be a multiplayer mafia game where players can create or join public lobbies and get a randomly assigned role: mafia, doctor, sheriff, or civilian. Once the game starts, it will alternate between day and night time phases. During the night, the mafia, doctor, and sheriff will pick someone to kill, save, or investigate respectively. During the day, players will type to each other in the chat and then vote on who they think the mafia is. The game ends when either all the mafia or all the innocent players are eliminated.

## Roster & Roles
Brian Liu (PM) – Node.js
  - Implementing functions that help the game run using JS, such as role functionality.

Caden Khuu – Frontend
  - Create templates and make website look nice with Tailwind and CSS
  - Help out with NodeJS

Claire Song – SQLite Database
  - Creating tables to keep track of user information and player information

Tracy Ye – Node.js
  - Linking pages and backend using NodeJS
  - Implement multiplayer, party system, and real-time updating of information within the game. 


## Install Guide
Our project can be installed locally by carrying out the following steps. Users may also skip installation and go straight to the website at the top of our Launch Codes.
1. Clone and move into this repository
```
$ git clone git@github.com:BrianASC07/TheLastProject_brianl237_cadenk4_claires23_tracyy10.git
```
```
$ cd TheLastProject_brianl237_cadenk4_claires23_tracyy10.git
```
2. Create a virtual environment
```
$ python3 -m venv foo
```
3. Activate the virtual environment: Linux/MacOS
```
$ . foo/bin/activate
```
3. Activate the virtual environment: Windows
```
$ foo\Scripts\activate
```
4. Install required packages
```
$ pip install -r requirements.txt
```
## Launch Codes
Our project can be launched locally by carrying out the following steps. 
1. Move into this repository
```
$ cd git@github.com:BrianASC07/TheLastProject_brianl237_cadenk4_claires23_tracyy10.git
```
2. Activate the virtual environment: Linux/MacOS
```
$ . foo/bin/activate
```
2. Activate the virtual environment: Windows
```
$ foo\Scripts\activate
```
3. Move into the app directory
```
$ cd app
```
4. Run the Flask app
```
$ python3 __init__.py
```
5. Navigate to localhost: http://127.0.0.1:5000

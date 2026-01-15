# CS2 Tracker

A Counter-Strike 2 overlay application built for Overwolf that provides real-time match history and player statistics for your current lobby.

<img width="1413" height="876" alt="image" src="https://github.com/user-attachments/assets/57131b04-191a-490e-a4ee-bef0ac343d12" />

## Features

- **Real-Time Lobby Detection**: Automatically detects players in your CS2 lobby as they join
- **Match History Tracking**: View your all-time record against and with each player
- **Player Statistics**:
  - Total CS2 playtime hours
  - Leetify stats (Time to Damage, Pre-aim accuracy)
  - Win/Loss records vs opponents
  - Win/Loss records with teammates
  - Win rate percentages
- **External Integration**: Click player names to view detailed stats on CSWatch
- **Match Details**: View specific matchrooms on Tracker.gg by clicking on W/L records
- **Auto-Sync**: Automatically syncs your CS2 match history from Tracker.gg

## Installation

1. Download and install [Overwolf](https://www.overwolf.com/)
2. Clone or download this repository
3. Open Overwolf and navigate to Settings > Support > Development Options
4. Click "Load unpacked extension" and select the project folder
5. Launch Counter-Strike 2

## Setup

On first launch, you'll be prompted to enter your Steam Profile URL or Steam ID:

Valid inputs:
- Steam ID: `76561198300127244`
- Profile URL: `https://steamcommunity.com/profiles/76561198300127244`

The app will then sync your match history from Tracker.gg.

## Usage

1. Launch CS2 with the app installed
2. The overlay will automatically appear when you enter a lobby
3. Players will be displayed in two teams (CT and T) as they join
4. Stats are automatically fetched and displayed for each player:
   - **Hours**: Total CS2 playtime
   - **TTD**: Time to Damage (reaction time in milliseconds)
   - **Preaim °**: Pre-aim accuracy score
   - **All time vs Them**: Your win-loss record against this player
   - **Win %**: Win percentage against this player
   - **All time w/ Them**: Your win-loss record with this player as teammate
   - **Win %**: Win percentage with this player

### Interactions

- **Click on player names**: Opens their CSWatch profile
- **Click on W-L records**: Shows all matchrooms for games played against/with that player

## Technical Details

### Data Sources

- Match history: Tracker.gg API
- Playtime: Steam Web API
- Performance stats: Leetify API

## Color Coding

Stats are color-coded for quick readability:

**Win Rates:**
- Green: ≥50% win rate
- Red: ≤49% win rate
- Gray: No matches

**Time to Damage (TTD):**
- Green: >550ms
- Yellow: 500-550ms
- Red: <500ms

**Pre-aim:**
- Green: >7°
- Yellow: 5-7°
- Red: <5°

## Requirements

- Overwolf client
- Counter-Strike 2
- Valid Steam account
- Tracker.gg account (for match history sync)

## Notes

- The app only works with CS2 (Game ID: 22730)
- Match history syncs automatically when the app starts
- Lobby data is cleared when a new match begins
- Player stats are cached to reduce API calls

## Author

Created by Shrihari

## Version

1.0.0

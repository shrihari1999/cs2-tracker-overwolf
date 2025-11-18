// IndexedDB Setup and Query Manager for Match History

class MatchHistoryDB {
  constructor(dbName = 'MatchHistoryDB', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store 1: Raw matches (source of truth)
        if (!db.objectStoreNames.contains('matches')) {
          const matchStore = db.createObjectStore('matches', { keyPath: 'matchId' });
          matchStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store 2: Denormalized player-match relationships
        if (!db.objectStoreNames.contains('playerMatches')) {
          const pmStore = db.createObjectStore('playerMatches', { keyPath: 'id' });
          pmStore.createIndex('playerId', 'playerId', { unique: false });
          pmStore.createIndex('playerTimestamp', ['playerId', 'timestamp'], { unique: false });
          pmStore.createIndex('matchId', 'matchId', { unique: false });
        }
      };
    });
  }

  // Add a match and create denormalized records
  async addMatch(matchData) {
    const { matchId, timestamp, team1, team2 } = matchData;
    
    // Determine result
    let team1Result, team2Result;
    if (team1.score > team2.score) {
      team1Result = 'win';
      team2Result = 'loss';
    } else if (team1.score < team2.score) {
      team1Result = 'loss';
      team2Result = 'win';
    } else {
      team1Result = team2Result = 'tie';
    }

    const tx = this.db.transaction(['matches', 'playerMatches'], 'readwrite');
    
    // Store raw match
    tx.objectStore('matches').add(matchData);

    const pmStore = tx.objectStore('playerMatches');

    // Create denormalized records for team1 players
    for (const playerId of team1.playerIds) {
      pmStore.add({
        id: `${playerId}_${matchId}`,
        playerId,
        matchId,
        timestamp,
        result: team1Result,
        teammates: team1.playerIds.filter(id => id !== playerId),
        opponents: team2.playerIds
      });
    }

    // Create denormalized records for team2 players
    for (const playerId of team2.playerIds) {
      pmStore.add({
        id: `${playerId}_${matchId}`,
        playerId,
        matchId,
        timestamp,
        result: team2Result,
        teammates: team2.playerIds.filter(id => id !== playerId),
        opponents: team1.playerIds
      });
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Get all matches for a specific player
  async getPlayerMatches(playerId) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('playerMatches', 'readonly');
      const store = tx.objectStore('playerMatches');
      const index = store.index('playerId');
      const request = index.getAll(playerId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Calculate head-to-head records for lobby
  async calculateLobbyRecords(ourUserId, lobbyPlayerIds) {
    // Get all our user's matches
    const ourMatches = await this.getPlayerMatches(ourUserId);
    
    // Initialize results for each player in lobby
    const results = {};
    for (const playerId of lobbyPlayerIds) {
      if (playerId === ourUserId) continue; // Skip self
      
      results[playerId] = {
        winsAgainst: 0,
        lossesAgainst: 0,
        tiesAgainst: 0,
        winsWith: 0,
        lossesWith: 0,
        tiesWith: 0,
        totalMatches: 0
      };
    }

    // Process each match
    for (const match of ourMatches) {
      // Check each player in the lobby
      for (const playerId of lobbyPlayerIds) {
        if (playerId === ourUserId) continue;

        const wasTeammate = match.teammates.includes(playerId);
        const wasOpponent = match.opponents.includes(playerId);

        if (wasTeammate) {
          // Same team - count as "with"
          results[playerId].totalMatches++;
          
          if (match.result === 'win') results[playerId].winsWith++;
          else if (match.result === 'loss') results[playerId].lossesWith++;
          else results[playerId].tiesWith++;
        } 
        else if (wasOpponent) {
          // Opposing team - count as "against"
          results[playerId].totalMatches++;
          
          if (match.result === 'win') results[playerId].winsAgainst++;
          else if (match.result === 'loss') results[playerId].lossesAgainst++;
          else results[playerId].tiesAgainst++;
        }
      }
    }

    return results;
  }
}

// Usage Example:
async function example() {
  const db = new MatchHistoryDB();
  await db.init();

  // Add a match
  await db.addMatch({
    matchId: 'match_001',
    timestamp: Date.now(),
    team1: {
      playerIds: ['user123', 'p2', 'p3', 'p4', 'p5'],
      score: 25
    },
    team2: {
      playerIds: ['p6', 'p7', 'p8', 'p9', 'p10'],
      score: 20
    }
  });

  // When user joins a lobby, calculate records
  const lobbyPlayers = ['user123', 'p2', 'p6', 'p7', 'p11', 'p12', 'p13', 'p14', 'p15', 'p16'];
  const records = await db.calculateLobbyRecords('user123', lobbyPlayers);
  
  console.log('Lobby Records:', records);
  // Output example:
  // {
  //   p2: { 
  //     winsAgainst: 0, lossesAgainst: 0, tiesAgainst: 0,
  //     winsWith: 1, lossesWith: 0, tiesWith: 0,
  //     totalMatches: 1
  //   },
  //   p6: { 
  //     winsAgainst: 1, lossesAgainst: 0, tiesAgainst: 0,
  //     winsWith: 0, lossesWith: 0, tiesWith: 0,
  //     totalMatches: 1
  //   },
  //   p11: { 
  //     winsAgainst: 0, lossesAgainst: 0, tiesAgainst: 0,
  //     winsWith: 0, lossesWith: 0, tiesWith: 0,
  //     totalMatches: 0  // Never played together
  //   },
  //   ...
  // }
}

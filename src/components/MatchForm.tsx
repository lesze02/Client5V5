import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Player, GameType, Role } from "../types/match";
import { apiUrl } from "../config/api";
import "../styles/MatchForm.css";

const roles: Role[] = ["top", "jg", "mid", "adc", "support"];

type MatchFormat = "BO1" | "BO3" | "BO5";

interface PlayerWithRole extends Player {
  role?: Role;
}

export default function MatchForm() {
  const navigate = useNavigate();
  const [game, setGame] = useState<GameType>("CS");
  const [format, setFormat] = useState<MatchFormat>("BO1");
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [autoDraw, setAutoDraw] = useState(true);
  const [teams, setTeams] = useState<{
    teamA: PlayerWithRole[];
    teamB: PlayerWithRole[];
  } | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl('/players'));
        if (!response.ok) {
          throw new Error('Failed to fetch players');
        }
        const playersData = await response.json();
        setPlayers(playersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const togglePlayer = (playerId: number) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      }
      if (prev.length >= 10) {
        return prev;
      }
      return [...prev, playerId];
    });
  };

  const drawTeamsForMatch = (selectedPlayersList: Player[]): { teamA: PlayerWithRole[]; teamB: PlayerWithRole[] } => {
    const shuffled = [...selectedPlayersList];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    let teamA: PlayerWithRole[] = shuffled.slice(0, 5);
    let teamB: PlayerWithRole[] = shuffled.slice(5, 10);

    if (game === "LOL" && autoDraw) {
      const shuffledRolesA = [...roles].sort(() => Math.random() - 0.5);
      const shuffledRolesB = [...roles].sort(() => Math.random() - 0.5);

      teamA = teamA.map((player, i) => ({
        ...player,
        role: shuffledRolesA[i]
      }));
      
      teamB = teamB.map((player, i) => ({
        ...player,
        role: shuffledRolesB[i]
      }));
    }

    return { teamA, teamB };
  };

  const drawTeams = () => {
    if (selectedPlayers.length !== 10) return;

    const selectedPlayersList = players
      .filter(p => selectedPlayers.includes(p.id));

    const drawnTeams = drawTeamsForMatch(selectedPlayersList);
    setTeams(drawnTeams);
  };

  const getMatchCount = (): number => {
    switch (format) {
      case "BO1": return 1;
      case "BO3": return 3;
      case "BO5": return 5;
      default: return 1;
    }
  };

  const handleSubmit = async () => {
    if (!teams) return;
    
    const matchCount = getMatchCount();
    
    try {
      for (let i = 0; i < matchCount; i++) {
        // Używamy tych samych wylosowanych składów dla wszystkich meczy
        const currentTeams = teams;

        // Tworzenie meczu
        const matchResponse = await fetch(apiUrl('/matches'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            game: game,
            status: 'ACTIVE'
          })
        });

        if (!matchResponse.ok) {
          throw new Error('Failed to create match');
        }

        const createdMatch = await matchResponse.json();
        console.log(`Mecz ${i + 1}/${matchCount} utworzony:`, createdMatch);

        // Tworzenie statystyk dla każdego gracza
        const playerStatsPromises: Promise<Response>[] = [];

        // Dodaj graczy z drużyny A
        currentTeams.teamA.forEach(player => {
          const statsPromise = fetch(apiUrl('/player-stats'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              player_id: player.id,
              match_id: createdMatch.id,
              team: 'A',
              role: game === "LOL" ? player.role : null,
              kills: 0,
              deaths: 0,
              assists: 0
            })
          });
          playerStatsPromises.push(statsPromise);
        });

        // Dodaj graczy z drużyny B
        currentTeams.teamB.forEach(player => {
          const statsPromise = fetch(apiUrl('/player-stats'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              player_id: player.id,
              match_id: createdMatch.id,
              team: 'B',
              role: game === "LOL" ? player.role : null,
              kills: 0,
              deaths: 0,
              assists: 0
            })
          });
          playerStatsPromises.push(statsPromise);
        });

        // Wykonaj wszystkie requesty statystyk
        const statsResponses = await Promise.all(playerStatsPromises);
        
        // Sprawdź czy wszystkie statystyki zostały utworzone
        const failedStats = statsResponses.filter(response => !response.ok);
        if (failedStats.length > 0) {
          console.warn(`${failedStats.length} statystyk nie zostało utworzonych poprawnie`);
        }
      }

      console.log(`${matchCount} mecz(e/y) utworzone pomyślnie`);
      navigate('/');
      
    } catch (error) {
      console.error('Błąd podczas tworzenia meczu:', error);
      setError('Nie udało się utworzyć meczu. Spróbuj ponownie.');
    }
  };

  if (loading) {
    return (
      <div className="match-form">
        <button className="back-button" onClick={() => navigate("/")}>
          ← Powrót
        </button>
        <h2>Ładowanie zawodników...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="match-form">
        <button className="back-button" onClick={() => navigate("/")}>
          ← Powrót
        </button>
        <h2>Błąd: {error}</h2>
        <button onClick={() => window.location.reload()}>
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  return (
    <div className="match-form">
      <button className="back-button" onClick={() => navigate("/")}>
        ← Powrót
      </button>
      
      <h2>Utwórz nowy mecz</h2>
      
      <div className="form-game">
        <label>Wybierz grę:</label>
        <select value={game} onChange={e => setGame(e.target.value as GameType)}>
          <option value="CS">Counter-Strike</option>
          <option value="LOL">League of Legends</option>
        </select>
      </div>

      <div className="form-format">
        <label>Format meczu:</label>
        <div className="format-buttons">
          <button 
            className={`format-btn ${format === "BO1" ? "active" : ""}`}
            onClick={() => setFormat("BO1")}
          >
            BO1
          </button>
          <button 
            className={`format-btn ${format === "BO3" ? "active" : ""}`}
            onClick={() => setFormat("BO3")}
          >
            BO3
          </button>
          <button 
            className={`format-btn ${format === "BO5" ? "active" : ""}`}
            onClick={() => setFormat("BO5")}
          >
            BO5
          </button>
        </div>
        <p className="format-description">
          {format === "BO1" && "Jeden mecz z wylosowanymi składami"}
          {format === "BO3" && "3 mecze z takimi samymi składami"}
          {format === "BO5" && "5 meczy z takimi samymi składami"}
        </p>
      </div>
      
      <div className="form-players">
        <h3>Wybierz graczy ({selectedPlayers.length}/10)</h3>
        {players.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center' }}>
            Brak zawodników w bazie danych
          </p>
        ) : (
          <ul className="players-list">
            {players.map(player => {
              const isSelected = selectedPlayers.includes(player.id);
              return (
                <li
                  key={player.id}
                  className={`player-item ${isSelected ? "selected" : ""}`}
                  onClick={() => togglePlayer(player.id)}
                >
                  {player.name}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      
      {selectedPlayers.length === 10 && (
        <div className="draw-teams-section">
          {game === "LOL" && (
            <label className="lol-checkbox">
              <input
                type="checkbox"
                checked={autoDraw}
                onChange={e => setAutoDraw(e.target.checked)}
              />
              Losuj pozycje (LoL)
            </label>
          )}

          <button
            className="btn-draw-teams"
            onClick={drawTeams}
          >
            Wylosuj drużyny
          </button>
        </div>
      )}

      {teams && (
        <>
          <div className="teams-display">
            <div className="team-section team-a">
              <h3>DRUŻYNA A</h3>
              <ul className="team-players">
                {teams.teamA.map(player => (
                  <li key={player.id}>
                    {player.name} 
                    {game === "LOL" && player.role && (
                      <span className="player-role"> - {player.role.toUpperCase()}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="team-section team-b">
              <h3>DRUŻYNA B</h3>
              <ul className="team-players">
                {teams.teamB.map(player => (
                  <li key={player.id}>
                    {player.name}
                    {game === "LOL" && player.role && (
                      <span className="player-role"> - {player.role.toUpperCase()}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
      
      <div className="form-actions">
        <button 
          className="btn-submit" 
          onClick={handleSubmit}
          disabled={!teams}
        >
          Utwórz {format === "BO1" ? "mecz" : `${getMatchCount()} mecze`}
        </button>
        <button className="btn-cancel" onClick={() => navigate("/")}>
          Anuluj
        </button>
      </div>
    </div>
  );
}
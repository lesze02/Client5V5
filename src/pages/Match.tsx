import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl } from "../config/api";
import "../styles/Match.css";

interface PlayerStats {
  id: number;
  player_id: number;
  player_name?: string;
  match_id: number;
  team: string;
  role: string | null;
  kills: number;
  deaths: number;
  assists: number;
}

interface MatchData {
  id: number;
  game: string;
  status: string;
  Ascore: number;
  Bscore: number;
  created_at: string;
}

export default function Match() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<MatchData | null>(null);
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        setLoading(true);
        
        // Pobierz dane meczu
        const matchResponse = await fetch(apiUrl(`/matches/${id}`));
        if (!matchResponse.ok) throw new Error("Nie udało się pobrać meczu");
        const matchData = await matchResponse.json();
        setMatch(matchData);
        setScoreA(matchData.Ascore || 0);
        setScoreB(matchData.Bscore || 0);

        // Pobierz statystyki graczy
        const statsResponse = await fetch(apiUrl(`/player-stats/match/${id}`));
        if (!statsResponse.ok) throw new Error("Nie udało się pobrać statystyk");
        const statsData = await statsResponse.json();

        // Pobierz nazwy graczy
        const playersResponse = await fetch(apiUrl("/players"));
        const playersData = await playersResponse.json();
        const playersMap = new Map(playersData.map((p: { id: number; name: string }) => [p.id, p.name]));

        const statsWithNames = statsData.map((s: PlayerStats) => ({
          ...s,
          player_name: playersMap.get(s.player_id) || "Nieznany"
        }));

        setStats(statsWithNames);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił błąd");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMatchData();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const updatePlayerStats = (playerId: number, field: "kills" | "deaths" | "assists", value: number) => {
    setStats(prev =>
      prev.map(s =>
        s.player_id === playerId ? { ...s, [field]: Math.max(0, value) } : s
      )
    );
  };

  const handleSave = async () => {
    if (!match) return;
    
    setSaving(true);
    try {
      // Aktualizuj wynik meczu
      await fetch(apiUrl(`/matches/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Ascore: scoreA,
          Bscore: scoreB,
          status: "ACTIVE"
        })
      });

      // Aktualizuj statystyki każdego gracza
      for (const stat of stats) {
        await fetch(apiUrl(`/player-stats/${stat.id}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kills: stat.kills,
            deaths: stat.deaths,
            assists: stat.assists
          })
        });
      }

      alert("Zapisano pomyślnie!");
    } catch (err) {
      setError("Nie udało się zapisać zmian");
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = async () => {
    if (!match) return;
    if (!confirm("Czy na pewno chcesz zakończyć mecz?")) return;

    setSaving(true);
    try {
      const winner = scoreA > scoreB ? "A" : scoreB > scoreA ? "B" : null;

      // Aktualizuj mecz jako zakończony
      await fetch(apiUrl(`/matches/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Ascore: scoreA,
          Bscore: scoreB,
          status: "FINISHED"
        })
      });

      // Aktualizuj statystyki każdego gracza z informacją o zwycięstwie
      for (const stat of stats) {
        await fetch(apiUrl(`/player-stats/${stat.id}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kills: stat.kills,
            deaths: stat.deaths,
            assists: stat.assists,
            winner: winner === stat.team
          })
        });
      }

      navigate("/");
    } catch (err) {
      setError("Nie udało się zakończyć meczu");
    } finally {
      setSaving(false);
    }
  };

  const teamA = stats.filter(s => s.team === "A");
  const teamB = stats.filter(s => s.team === "B");

  if (loading) {
    return (
      <div className="match-page">
        <button className="back-button" onClick={() => navigate("/")}>← Powrót</button>
        <h1>Ładowanie...</h1>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="match-page">
        <button className="back-button" onClick={() => navigate("/")}>← Powrót</button>
        <h1>Błąd: {error || "Nie znaleziono meczu"}</h1>
      </div>
    );
  }

  return (
    <div className="match-page">
      <button className="back-button" onClick={() => navigate("/")}>← Powrót</button>
      
      <h1>Mecz #{match.id} - {match.game}</h1>
      <span className={`match-status ${match.status.toLowerCase()}`}>{match.status}</span>
      <p className="match-date">Utworzono: {formatDate(match.created_at)}</p>

      <div className="score-section">
        <div className="score-team score-a">
          <h2>Drużyna A</h2>
          <input
            type="number"
            min="0"
            value={scoreA}
            onChange={e => setScoreA(Math.max(0, parseInt(e.target.value) || 0))}
            disabled={match.status === "FINISHED"}
          />
        </div>
        <span className="score-vs">VS</span>
        <div className="score-team score-b">
          <h2>Drużyna B</h2>
          <input
            type="number"
            min="0"
            value={scoreB}
            onChange={e => setScoreB(Math.max(0, parseInt(e.target.value) || 0))}
            disabled={match.status === "FINISHED"}
          />
        </div>
      </div>

      <div className="teams-stats">
        <div className="team-stats team-a-stats">
          <h3>Drużyna A</h3>
          <div className="stats-header">
            <span className="header-name">Gracz</span>
            {match.game === "LOL" && <span className="header-role">Rola</span>}
            <span className="header-kda">K</span>
            <span className="header-kda">D</span>
            <span className="header-kda">A</span>
          </div>
          {teamA.map(player => (
            <div key={player.id} className="player-stats-row">
              <span className="player-name">{player.player_name}</span>
              {match.game === "LOL" && (
                <span className="player-role">{player.role?.toUpperCase() || "-"}</span>
              )}
              <input
                type="number"
                min="0"
                value={player.kills}
                onChange={e => updatePlayerStats(player.player_id, "kills", parseInt(e.target.value) || 0)}
                disabled={match.status === "FINISHED"}
              />
              <input
                type="number"
                min="0"
                value={player.deaths}
                onChange={e => updatePlayerStats(player.player_id, "deaths", parseInt(e.target.value) || 0)}
                disabled={match.status === "FINISHED"}
              />
              <input
                type="number"
                min="0"
                value={player.assists}
                onChange={e => updatePlayerStats(player.player_id, "assists", parseInt(e.target.value) || 0)}
                disabled={match.status === "FINISHED"}
              />
            </div>
          ))}
        </div>

        <div className="team-stats team-b-stats">
          <h3>Drużyna B</h3>
          <div className="stats-header">
            <span className="header-name">Gracz</span>
            {match.game === "LOL" && <span className="header-role">Rola</span>}
            <span className="header-kda">K</span>
            <span className="header-kda">D</span>
            <span className="header-kda">A</span>
          </div>
          {teamB.map(player => (
            <div key={player.id} className="player-stats-row">
              <span className="player-name">{player.player_name}</span>
              {match.game === "LOL" && (
                <span className="player-role">{player.role?.toUpperCase() || "-"}</span>
              )}
              <input
                type="number"
                min="0"
                value={player.kills}
                onChange={e => updatePlayerStats(player.player_id, "kills", parseInt(e.target.value) || 0)}
                disabled={match.status === "FINISHED"}
              />
              <input
                type="number"
                min="0"
                value={player.deaths}
                onChange={e => updatePlayerStats(player.player_id, "deaths", parseInt(e.target.value) || 0)}
                disabled={match.status === "FINISHED"}
              />
              <input
                type="number"
                min="0"
                value={player.assists}
                onChange={e => updatePlayerStats(player.player_id, "assists", parseInt(e.target.value) || 0)}
                disabled={match.status === "FINISHED"}
              />
            </div>
          ))}
        </div>
      </div>

      {match.status === "ACTIVE" && (
        <div className="match-actions">
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? "Zapisywanie..." : "Zapisz"}
          </button>
          <button className="btn-finish" onClick={handleFinish} disabled={saving}>
            Zakończ mecz
          </button>
        </div>
      )}
    </div>
  );
}
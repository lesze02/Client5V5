import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/api";
import "../styles/Table.css";

interface PlayerTableStats {
    id: number;
    name: string;
    wins: number;
    losses: number;
    winrate: number;
    kills: number;
    deaths: number;
    assists: number;
    kda: number;
    games: number;
}

interface PlayerStats {
    player_id: number;
    kills: number;
    deaths: number;
    assists: number;
    winner: boolean;
    match_id: number;
}

interface Match {
    id: number;
    game: string;
    status: string;
}

interface Player {
    id: number;
    name: string;
}

export default function Table() {
    const navigate = useNavigate();
    const [csStats, setCsStats] = useState<PlayerTableStats[]>([]);
    const [lolStats, setLolStats] = useState<PlayerTableStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"CS" | "LOL">("CS");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);

                // Pobierz wszystkich graczy
                const playersResponse = await fetch(apiUrl("/players"));
                const players: Player[] = await playersResponse.json();

                // Pobierz wszystkie mecze
                const matchesResponse = await fetch(apiUrl("/matches"));
                const matches: Match[] = await matchesResponse.json();

                // Filtruj tylko zakończone mecze
                const finishedMatches = matches.filter(m => m.status === "FINISHED");

                // Pobierz statystyki dla każdego meczu
                const allStats: (PlayerStats & { game: string })[] = [];

                for (const match of finishedMatches) {
                    const statsResponse = await fetch(apiUrl(`/player-stats/match/${match.id}`));
                    if (statsResponse.ok) {
                        const statsData: PlayerStats[] = await statsResponse.json();
                        statsData.forEach(stat => {
                            allStats.push({ ...stat, game: match.game });
                        });
                    }
                }

                // Oblicz statystyki dla CS
                const csPlayerStats = calculatePlayerStats(players, allStats, "CS");
                setCsStats(csPlayerStats);

                // Oblicz statystyki dla LoL
                const lolPlayerStats = calculatePlayerStats(players, allStats, "LOL");
                setLolStats(lolPlayerStats);

            } catch (err) {
                console.error("Błąd pobierania statystyk:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const calculatePlayerStats = (
        players: Player[],
        allStats: (PlayerStats & { game: string })[],
        game: string
    ): PlayerTableStats[] => {
        const gameStats = allStats.filter(s => s.game === game);

        return players
            .map(player => {
                const playerGameStats = gameStats.filter(s => s.player_id === player.id);

                if (playerGameStats.length === 0) {
                    return null;
                }

                const wins = playerGameStats.filter(s => s.winner).length;
                const losses = playerGameStats.filter(s => !s.winner).length;
                const games = wins + losses;
                const winrate = games > 0 ? Math.round((wins / games) * 100) : 0;

                const kills = playerGameStats.reduce((sum, s) => sum + s.kills, 0);
                const deaths = playerGameStats.reduce((sum, s) => sum + s.deaths, 0);
                const assists = playerGameStats.reduce((sum, s) => sum + s.assists, 0);
                const kda = deaths > 0 ? Math.round(((kills + assists) / deaths) * 100) / 100 : kills + assists;

                return {
                    id: player.id,
                    name: player.name,
                    wins,
                    losses,
                    winrate,
                    kills,
                    deaths,
                    assists,
                    kda,
                    games
                };
            })
            .filter((stat): stat is PlayerTableStats => stat !== null && stat.games > 0)
            .sort((a, b) => b.winrate - a.winrate || b.wins - a.wins);
    };

    if (loading) {
        return (
            <div className="table-page">
                <button className="back-button" onClick={() => navigate("/")}>← Powrót</button>
                <h1>Ładowanie statystyk...</h1>
            </div>
        );
    }

    const currentStats = activeTab === "CS" ? csStats : lolStats;

    return (
        <div className="table-page">
            <button className="back-button" onClick={() => navigate("/")}>← Powrót</button>
            
            <h1>Statystyki graczy</h1>

            <div className="tabs">
                <button 
                    className={`tab ${activeTab === "CS" ? "active" : ""}`}
                    onClick={() => setActiveTab("CS")}
                >
                    Counter-Strike
                </button>
                <button 
                    className={`tab ${activeTab === "LOL" ? "active" : ""}`}
                    onClick={() => setActiveTab("LOL")}
                >
                    League of Legends
                </button>
            </div>

            {currentStats.length === 0 ? (
                <p className="no-stats">Brak statystyk dla tej gry</p>
            ) : (
                <div className="stats-table-container">
                    <table className="stats-table">
                        <thead>
                            <tr>
                                <th className="rank">#</th>
                                <th className="name">Gracz</th>
                                <th>Mecze</th>
                                <th className="wins">W</th>
                                <th className="losses">L</th>
                                <th className="winrate">Win%</th>
                                <th className="kills">K</th>
                                <th className="deaths">D</th>
                                <th className="assists">A</th>
                                <th className="kda">KDA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentStats.map((player, index) => (
                                <tr key={player.id}>
                                    <td className="rank">{index + 1}</td>
                                    <td className="name">{player.name}</td>
                                    <td>{player.games}</td>
                                    <td className="wins">{player.wins}</td>
                                    <td className="losses">{player.losses}</td>
                                    <td className="winrate">
                                        <span className={`winrate-badge ${player.winrate >= 50 ? "positive" : "negative"}`}>
                                            {player.winrate}%
                                        </span>
                                    </td>
                                    <td className="kills">{player.kills}</td>
                                    <td className="deaths">{player.deaths}</td>
                                    <td className="assists">{player.assists}</td>
                                    <td className="kda">
                                        <span className={`kda-badge ${player.kda >= 2 ? "good" : player.kda >= 1 ? "average" : "bad"}`}>
                                            {player.kda.toFixed(2)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
import '../styles/Home.css';
// import { useNavigate } from 'react-router-dom';
// import { useEffect, useState } from 'react';
// import { apiUrl } from '../config/api';
// import logo from '../assets/logo.png';

// interface PlayerStats {
//     player_id: number;
//     player_name?: string;
//     team: string;
// }

// interface MatchData {
//     id: number;
//     game: string;
//     status: string;
//     Ascore: number;
//     Bscore: number;
//     players?: { teamA: string[]; teamB: string[] };
// }

export default function Home() {
    // const navigate = useNavigate();
    // const [matches, setMatches] = useState<MatchData[]>([]);
    // const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const fetchMatches = async () => {
    //         try {
    //             // Pobierz mecze
    //             const response = await fetch(apiUrl('/matches'));
    //             if (!response.ok) return;
    //             const matchesData = await response.json();
                
    //             // Filtruj tylko aktywne mecze
    //             const activeMatches = matchesData.filter((m: MatchData) => m.status === 'ACTIVE');
                
    //             // Pobierz graczy
    //             const playersResponse = await fetch(apiUrl('/players'));
    //             const playersData = await playersResponse.json();
    //             const playersMap = new Map(playersData.map((p: { id: number; name: string }) => [p.id, p.name]));

    //             // Dla każdego meczu pobierz statystyki graczy
    //             const matchesWithPlayers = await Promise.all(
    //                 activeMatches.map(async (match: MatchData) => {
    //                     try {
    //                         const statsResponse = await fetch(apiUrl(`/player-stats/match/${match.id}`));
    //                         if (!statsResponse.ok) return { ...match, players: { teamA: [], teamB: [] } };
                            
    //                         const statsData: PlayerStats[] = await statsResponse.json();
                            
    //                         const teamA = statsData
    //                             .filter(s => s.team === 'A')
    //                             .map(s => playersMap.get(s.player_id) || 'Nieznany');
                            
    //                         const teamB = statsData
    //                             .filter(s => s.team === 'B')
    //                             .map(s => playersMap.get(s.player_id) || 'Nieznany');
                            
    //                         return { ...match, players: { teamA, teamB } };
    //                     } catch {
    //                         return { ...match, players: { teamA: [], teamB: [] } };
    //                     }
    //                 })
    //             );

    //             setMatches(matchesWithPlayers);
    //         } catch (err) {
    //             console.error('Błąd pobierania meczów:', err);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchMatches();
    // }, []);

    return (
        <div className="home-container">
            {/* <button className='home-login'>xd</button>
            <img src={logo} style={{marginBottom: '-170px', marginTop: '10px', width: '17%'}} alt="Logo Piec na Piec" className="home-logo" />
            <h1>PIEC NA PIEC</h1>
            <button className="home-new-game" onClick={() => navigate('/new-match')}>Nowy mecz</button>
            <button className="home-table" onClick={() => navigate('/table')}>Tabela</button>
            <h2>Aktualnie rozgrywane gry</h2>
            
            {loading ? (
                <p>Ładowanie...</p>
            ) : matches.length === 0 ? (
                <p>Brak aktywnych meczów</p>
            ) : (
                <ul className="active-matches">
                    {matches.map(match => (
                        <li 
                            key={match.id} 
                            className="match-item"
                            onClick={() => navigate(`/match/${match.id}`)}
                        >
                            <div className="match-header">
                                <span className="match-game">{match.game}</span>
                                <span className="match-score">{match.Ascore} : {match.Bscore}</span>
                                <span className="match-id">#{match.id}</span>
                            </div>
                            {match.players && (
                                <div className="match-players">
                                    <div className="match-team-players team-a-players">
                                        {match.players.teamA.join(', ')}
                                    </div>
                                    <span className="vs-text">vs</span>
                                    <div className="match-team-players team-b-players">
                                        {match.players.teamB.join(', ')}
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )} */}
            <h1>Prace w toku</h1>
        </div>
    );
}
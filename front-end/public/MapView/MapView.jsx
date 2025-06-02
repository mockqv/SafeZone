import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, AttributionControl, useMap } from "react-leaflet";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import './MapView.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const shelterIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function RecenterAutomatically({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng]);
        }
    }, [lat, lng, map]);
    return null;
}

export default function MapView() {
    const [abrigos, setAbrigos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    const defaultCenter = useMemo(() => [-30.03, -51.23], []);
    const defaultZoom = 12;

    useEffect(() => {
        const fetchAbrigos = async () => {
            try {
                setLoading(true);
                const res = await axios.get("http://localhost:3000/abrigos");
                setAbrigos(res.data);
            } catch (err) {
                console.error("Error fetching abrigos:", err);
                setError("Falha ao carregar dados dos abrigos. Por favor, tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchAbrigos();
    }, []);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (err) => {
                    console.warn(`ERROR(${err.code}): ${err.message}`);
                }
            );
        }
    }, []);

    const handleLocateMe = () => {
        if (userLocation) {
        } else {
            alert("Sua localização não está disponível. Certifique-se de que a permissão de localização esteja ativada.");
        }
    };

    if (loading) {
        return (
            <div className="safezone-container safezone-loading">
                <p>Carregando SafeZone e abrigos...</p>
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="safezone-container safezone-error">
                <p className="error-message">{error}</p>
            </div>
        );
    }

    return (
        <div className="safezone-wrapper">
            <header className="safezone-header">
                <div className="header-content">
                    <h1 className="safezone-title">SafeZone</h1>
                    <p className="safezone-tagline">
                        Sua segurança em eventos climáticos extremos.
                    </p>
                </div>
                <div className="header-bottom">
                    <p className="header-subtitle">Encontre abrigos e informações essenciais em tempo real.</p>
                    <p className="copyright">© {new Date().getFullYear()} Richard Vinicius Ferreira da Silva. Todos os direitos reservados.</p>
                </div>
            </header>

            <div className="safezone-main-content">
                <aside className="safezone-sidebar">
                    <h2 className="sidebar-title">Informações Rápidas</h2>
                    <div className="sidebar-section">
                        <h3>O que é o SafeZone?</h3>
                        <p>
                            SafeZone é a sua plataforma de apoio em emergências climáticas. Acesse alertas em tempo real, visualize zonas de risco e encontre abrigos seguros com facilidade.
                        </p>
                    </div>
                    <div className="sidebar-section">
                        <h3>Como podemos ajudar?</h3>
                        <ul>
                            <li>Localização de abrigos próximos</li>
                            <li>Informações de capacidade e recursos disponíveis</li>
                            <li>Alertas meteorológicos importantes</li>
                            <li>Orientações de segurança para sua região</li>
                        </ul>
                    </div>
                    <button className="locate-me-button" onClick={handleLocateMe}>
                        <i className="fas fa-crosshairs"></i> Localizar Minha Posição
                    </button>
                    <div className="sidebar-section additional-info">
                        <h3>Dica de Segurança</h3>
                        <p>Tenha sempre uma mochila de emergência com documentos, água e alimentos não perecíveis.</p>
                    </div>
                </aside>

                <div className="safezone-map-area">
                    <MapContainer
                        center={userLocation || defaultCenter}
                        zoom={defaultZoom}
                        scrollWheelZoom={true}
                        className="safezone-map"
                        attributionControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <AttributionControl position="bottomright" prefix='SafeZone | Dados: <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />

                        {userLocation && (
                            <Marker position={userLocation}>
                                <Popup>
                                    <strong>Sua Posição Atual</strong>
                                </Popup>
                            </Marker>
                        )}
                        <RecenterAutomatically lat={userLocation ? userLocation[0] : null} lng={userLocation ? userLocation[1] : null} />

                        {abrigos.length === 0 && !loading && (
                            <div className="no-shelters-overlay">
                                <p>Nenhum abrigo encontrado. Verifique a conexão ou a disponibilidade de dados.</p>
                            </div>
                        )}

                        {abrigos.map((abrigo) => (
                            <Marker
                                key={abrigo.id}
                                position={[abrigo.latitude, abrigo.longitude]}
                                icon={shelterIcon}
                            >
                                <Popup>
                                    <div className="popup-content">
                                        <h3>{abrigo.nome}</h3>
                                        <p><strong>Tipo:</strong> {abrigo.tipo}</p>
                                        <p><strong>Capacidade:</strong> {abrigo.capacidade}</p>
                                        {abrigo.recursos && (
                                            <p><strong>Recursos:</strong> {abrigo.recursos}</p>
                                        )}
                                        <button className="popup-button">Ver Detalhes</button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}
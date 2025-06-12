import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

// Componente de estilos para injetar o CSS com o novo design.
const AppStyles = () => (
    <style>{`
        :root {
            --primary-color: #007aff;
            --primary-color-dark: #005bb5;
            --background-color: #f8f9fa;
            --surface-color: #ffffff;
            --text-color: #212529;
            --text-color-light: #6c757d;
            --border-color: #dee2e6;
        }

        /* Estilos Gerais e Correção de Layout */
        html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden; /* Previne a rolagem no corpo da página */
        }

        .safezone-wrapper {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: var(--background-color);
            color: var(--text-color);
            line-height: 1.6;
            display: flex; /* Adicionado */
            flex-direction: column; /* Adicionado */
            height: 100vh; /* Garante que o wrapper ocupe toda a altura da tela */
        }
        
        /* Tema de Alto Contraste */
        .safezone-wrapper.high-contrast {
            --background-color: #000000;
            --surface-color: #1a1a1a;
            --text-color: #ffffff;
            --text-color-light: #bbbbbb;
            --border-color: #555555;
        }
        .safezone-wrapper.high-contrast .safezone-header {
             background: #000;
             border-bottom-color: #fff;
        }
        .safezone-wrapper.high-contrast .popup-content,
        .safezone-wrapper.high-contrast .settings-menu {
             background-color: #2c2c2c;
             border: 1px solid var(--border-color);
        }

        /* Cabeçalho */
        .safezone-header {
            background: var(--surface-color);
            padding: 1rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid var(--border-color);
            position: relative;
            z-index: 1001;
            flex-shrink: 0; /* Impede que o header encolha */
        }
        .safezone-title {
            font-size: clamp(1.5rem, 4vw, 1.75rem);
            font-weight: 700;
            margin: 0;
            color: var(--primary-color);
        }
        .settings-button {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
        }
        .settings-button:hover {
            background-color: rgba(0,0,0,0.05);
        }
        .settings-button svg {
            width: 24px;
            height: 24px;
            fill: var(--text-color-light);
        }
        
        /* Menu de Configurações */
        .settings-menu {
            position: absolute;
            top: calc(100% + 10px);
            right: 1.5rem;
            background: var(--surface-color);
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            padding: 1rem;
            width: 280px;
            border: 1px solid var(--border-color);
        }
        .settings-menu h3 {
            margin-top: 0;
            margin-bottom: 1rem;
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-color-light);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .setting-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.75rem;
        }
        .setting-item span {
            font-size: 0.95rem;
        }

        /* Toggle Switch para Alto Contraste */
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 28px;
        }
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 28px;
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        input:checked + .slider {
            background-color: var(--primary-color);
        }
        input:focus + .slider {
            box-shadow: 0 0 1px var(--primary-color);
        }
        input:checked + .slider:before {
            transform: translateX(22px);
        }

        /* Controles de Fonte */
        .font-controls {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .font-controls button {
            background-color: #e9ecef;
            color: var(--text-color);
            border: 1px solid var(--border-color);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            font-size: 1.2rem;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
        }
        .font-controls button:hover {
            background-color: #d4d9de;
        }
        .safezone-wrapper.high-contrast .font-controls button {
            background-color: #333;
            color: #fff;
            border-color: #555;
        }

        /* Conteúdo Principal */
        .safezone-main-content {
            display: flex;
            flex-direction: row; /* Mantém a direção de linha para sidebar e mapa */
            flex-grow: 1; /* Faz esta área preencher o espaço restante */
            overflow: hidden; /* Esconde qualquer overflow que possa ocorrer */
        }

        /* Barra Lateral (Sidebar) */
        .safezone-sidebar {
            padding: 1.5rem;
            background-color: var(--surface-color);
            width: 100%;
            box-sizing: border-box;
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            overflow-y: auto; /* Permite rolagem apenas na sidebar, se necessário */
        }
        @media (min-width: 768px) {
            .safezone-sidebar {
                width: 380px;
                flex-shrink: 0;
            }
        }
        .sidebar-title {
            font-size: 1.5rem;
            font-weight: 600;
            border-bottom: 2px solid var(--primary-color);
            padding-bottom: 0.5rem;
            margin-top: 0;
            margin-bottom: 1.5rem;
        }
        .sidebar-section {
            margin-bottom: 1.5rem;
        }
        .sidebar-section h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
        }
        .sidebar-section ul {
            list-style: none;
            padding-left: 0;
        }
        .sidebar-section li {
            padding: 0.3rem 0;
            display: flex;
            align-items: center;
        }
         .sidebar-section li::before {
            content: '✓';
            color: var(--primary-color);
            margin-right: 10px;
            font-weight: bold;
         }
        .copyright {
            margin-top: auto; /* Empurra para o final */
            padding-top: 1.5rem;
            font-size: 0.8rem;
            color: var(--text-color-light);
            text-align: center;
            border-top: 1px solid var(--border-color);
        }

        /* Botão Principal */
        .locate-me-button {
            width: 100%;
            padding: 0.85rem;
            border: none;
            border-radius: 8px;
            background-color: var(--primary-color);
            color: white;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 500;
            margin-bottom: 1rem;
            transition: background-color 0.2s, transform 0.2s;
        }
        .locate-me-button:hover {
            background-color: var(--primary-color-dark);
            transform: translateY(-2px);
        }

        /* Área do Mapa e Popups */
        .safezone-map-area {
            flex-grow: 1;
        }
        .safezone-map {
            width: 100%;
            height: 100%;
        }
        .popup-content h3 {
            margin: 0 0 10px 0;
            color: var(--primary-color);
            font-size: 1.2rem;
            font-weight: 600;
        }
         .popup-content p {
            margin: 4px 0;
         }
        .popup-button {
            width: 100%;
            margin-top: 10px;
            padding: 0.6rem;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .popup-button:hover {
            background-color: var(--primary-color-dark);
        }

        /* Loading e Erro */
        .safezone-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-size: 1.2rem;
        }
        .spinner {
            border: 4px solid rgba(0,0,0,0.1);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border-left-color: var(--primary-color);
            animation: spin 1s ease infinite;
            margin-top: 1rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .error-message {
            color: #dc3545;
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            padding: 1rem;
            border-radius: 8px;
        }
    `}</style>
);

export default function MapView() {
    // Estados da aplicação
    const [abrigos, setAbrigos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [highContrast, setHighContrast] = useState(false);
    const [fontSize, setFontSize] = useState(16);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Estado para o menu

    // Refs
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const LRef = useRef(null);
    const userMarkerRef = useRef(null);
    const shelterMarkersRef = useRef([]);

    // Efeito para buscar dados da API
    useEffect(() => {
        const fetchAbrigos = async () => {
            try {
                setLoading(true);
                const res = await axios.get("http://localhost:3000/abrigos");
                setAbrigos(res.data || []);
            } catch (err) {
                console.error("Erro ao buscar abrigos:", err);
                setError("Falha ao carregar dados dos abrigos.");
            } finally {
                setLoading(false);
            }
        };
        fetchAbrigos();
    }, []);

    // Efeito para carregar scripts externos (Leaflet, VLibras)
    useEffect(() => {
        const loadScript = (src, onLoad) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            if (onLoad) script.onload = onLoad;
            document.body.appendChild(script);
            return script;
        };

        const leafletCss = document.createElement('link');
        leafletCss.rel = 'stylesheet';
        leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCss);

        const leafletScript = loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', () => {
            LRef.current = window.L;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => setUserLocation([position.coords.latitude, position.coords.longitude]),
                    () => console.warn("Permissão de localização negada.")
                );
            }
        });

        const vLibrasScript = loadScript('https://vlibras.gov.br/app/vlibras-plugin.js', () => {
            if (window.VLibras) new window.VLibras.Widget('https://vlibras.gov.br/app');
        });

        return () => {
            document.head.removeChild(leafletCss);
            document.body.removeChild(leafletScript);
            document.body.removeChild(vLibrasScript);
        };
    }, []);

    // Efeito para gerenciar o mapa
    useEffect(() => {
        if (!LRef.current || !mapContainerRef.current || loading) return;

        const L = LRef.current;
        const map = mapInstanceRef.current;
        
        if (!map) {
            const defaultCenter = [-30.0346, -51.2177];
            const initialCenter = userLocation || defaultCenter;
            mapInstanceRef.current = L.map(mapContainerRef.current).setView(initialCenter, 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(mapInstanceRef.current);
        } else if (userLocation) {
             map.setView(userLocation, 13);
        }

        if (userLocation) {
             if (userMarkerRef.current) {
                userMarkerRef.current.setLatLng(userLocation);
            } else {
                userMarkerRef.current = L.marker(userLocation).addTo(mapInstanceRef.current)
                    .bindPopup('<strong>Sua Posição Atual</strong>');
            }
        }
        
        shelterMarkersRef.current.forEach(marker => mapInstanceRef.current.removeLayer(marker));
        shelterMarkersRef.current = [];

        const shelterIcon = new L.Icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
        });

        abrigos.forEach((abrigo) => {
            if (abrigo.latitude && abrigo.longitude) {
                const popupContent = `
                    <div class="popup-content">
                        <h3>${abrigo.nome || 'Nome não informado'}</h3>
                        <p><strong>Tipo:</strong> ${abrigo.tipo || 'Não informado'}</p>
                        <p><strong>Capacidade:</strong> ${abrigo.capacidade || 'Não informada'}</p>
                        ${abrigo.recursos ? `<p><strong>Recursos:</strong> ${abrigo.recursos}</p>` : ''}
                        <button class="popup-button" onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${abrigo.latitude},${abrigo.longitude}', '_blank')">Ver Rotas</button>
                    </div>`;
                const marker = L.marker([abrigo.latitude, abrigo.longitude], { icon: shelterIcon })
                    .addTo(mapInstanceRef.current)
                    .bindPopup(popupContent);
                shelterMarkersRef.current.push(marker);
            }
        });

    }, [loading, abrigos, userLocation]);

    const handleLocateMe = () => {
        if (userLocation && mapInstanceRef.current) {
            mapInstanceRef.current.setView(userLocation, 14);
            mapInstanceRef.current.flyTo(userLocation, 15);
        } else {
            alert("Localização não disponível. Ative a permissão no seu navegador.");
        }
    };
    
    if (error) {
        return <div className="safezone-container"><p className="error-message">{error}</p></div>;
    }
    
    return (
        <div className={`safezone-wrapper ${highContrast ? 'high-contrast' : ''}`} style={{ fontSize: `${fontSize}px` }}>
            <AppStyles />
            <div vw="true" className="enabled">
                <div vw-access-button="true" className="active"></div>
                <div vw-plugin-wrapper="true"><div className="vw-plugin-top-wrapper"></div></div>
            </div>

            <header className="safezone-header">
                <h1 className="safezone-title">SafeZone</h1>
                <button className="settings-button" onClick={() => setIsSettingsOpen(!isSettingsOpen)} aria-label="Abrir configurações">
                    <svg viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>
                </button>
                {isSettingsOpen && (
                    <div className="settings-menu">
                        <h3>Acessibilidade</h3>
                        <div className="setting-item">
                            <span>Alto Contraste</span>
                            <label className="toggle-switch">
                                <input type="checkbox" checked={highContrast} onChange={() => setHighContrast(!highContrast)} />
                                <span className="slider"></span>
                            </label>
                        </div>
                        <div className="setting-item">
                            <span>Tamanho da Fonte</span>
                            <div className="font-controls">
                                <button onClick={() => setFontSize(f => Math.max(12, f - 2))} aria-label="Diminuir fonte">-</button>
                                <button onClick={() => setFontSize(f => f + 2)} aria-label="Aumentar fonte">+</button>
                            </div>
                        </div>
                    </div>
                )}
            </header>
            
            {loading && (
                <div className="safezone-container">
                    <p>Carregando mapa e abrigos...</p>
                    <div className="spinner"></div>
                </div>
            )}

            <div className="safezone-main-content" style={{ visibility: loading ? 'hidden' : 'visible' }}>
                <aside className="safezone-sidebar">
                    <div>
                        <h2 className="sidebar-title">Informações</h2>
                        <div className="sidebar-section">
                            <h3>O que é o SafeZone?</h3>
                            <p>Sua plataforma de apoio em emergências. Acesse alertas, visualize zonas de risco e encontre abrigos seguros.</p>
                        </div>
                        <div className="sidebar-section">
                            <h3>Como Ajudamos?</h3>
                            <ul>
                                <li>Localização de abrigos</li>
                                <li>Informações de vagas</li>
                                <li>Alertas meteorológicos</li>
                                <li>Orientações de segurança</li>
                            </ul>
                        </div>
                        <button className="locate-me-button" onClick={handleLocateMe}>
                            Localizar-me no Mapa
                        </button>
                    </div>
                    <div className="copyright">
                        © {new Date().getFullYear()} Richard Vinicius Ferreira da Silva. Todos os direitos reservados.
                    </div>
                </aside>
                <div className="safezone-map-area">
                    <div ref={mapContainerRef} className="safezone-map" />
                </div>
            </div>
        </div>
    );
}
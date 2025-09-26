
import React, { useEffect, useState, useRef } from 'https://esm.sh/react';
import ReactDOM from 'https://esm.sh/react-dom/client';
import { Search, Star, StarOff, RefreshCw, Video, Tv, Clapperboard, Menu, ChevronsLeft, ChevronDown, ChevronUp, Cog } from 'https://esm.sh/lucide-react';

// Fix: Declare Hls as a global variable to resolve TypeScript errors.
// This is necessary because hls.js is expected to be loaded via a script tag.
declare var Hls: any;

const DEFAULT_M3U_LISTS = [
  'https://raw.githubusercontent.com/ManoLimah/Manoteste/main/ManoTV.m3u'
];

const DEFAULT_XML_LISTS = [
  'https://raw.githubusercontent.com/matthuisman/i.mjh.nz/master/PlutoTV/all.xml'
];

const XMLTV_URL = 'https://raw.githubusercontent.com/matthuisman/i.mjh.nz/master/PlutoTV/br.xml';

const Player = ({url, title, onPlayerError, logDebug}) => {
  const videoRef = useRef(null);
  const hlsInstanceRef = useRef(null);
  const [isError, setIsError] = useState(false);

  const handleError = () => {
    setIsError(true);
    if (onPlayerError) {
        onPlayerError();
    }
  };

  useEffect(() => {
    setIsError(false);
    
    if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
    }

    const video = videoRef.current;
    if (!video || !url) return;
    
    logDebug(`Playing: ${url.substring(0, 100)}...`);

    if (url.includes('.m3u8')) {
      if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        logDebug("HLS stream detected. Using hls.js.");
        const hls = new Hls();
        hlsInstanceRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => console.warn("Autoplay prevented by browser."));
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            logDebug(`hls.js fatal error: ${data.type} - ${data.details}`);
            handleError();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        logDebug("Using native HLS support (e.g., Safari).");
        video.src = url;
        video.play().catch(() => console.warn("Autoplay prevented by browser."));
      } else {
        logDebug("HLS stream but hls.js is not supported and native playback is not available.");
        handleError();
      }
    } else {
      logDebug("Non-HLS stream. Using native player.");
      video.src = url;
      video.play().catch(() => console.warn("Autoplay prevented by browser."));
    }

    return () => {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
      }
    };
  }, [url]);

  return (
     <div className="w-full h-full flex flex-col bg-black">
      <div className="flex justify-between items-center mb-2 flex-shrink-0">
        <h2 className="text-white text-xl truncate" title={title}>{title}</h2>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm flex-shrink-0 ml-4">Abrir em nova aba</a>
      </div>
      {!isError ? (
        <video ref={videoRef} controls autoPlay onError={handleError} className="w-full h-full bg-black" referrerPolicy="no-referrer" />
      ) : (
        <div className="text-red-400 bg-gray-900 w-full h-full flex items-center justify-center flex-col text-center p-4">
          <p className="font-semibold">Erro ao carregar o vídeo.</p>
          <p className="text-sm text-gray-300 mt-1">A fonte pode estar offline ou o formato de vídeo pode não ser compatível com seu navegador.</p>
          <p className="text-sm text-gray-300">Tente abrir o link em uma nova aba.</p>
        </div>
      )}
    </div>
  );
};

const Sidebar = ({
    fetchLists, activeTab, setActiveTab, handleBackFromSeries, search, setSearch,
    favorites, toggleFavorite, filtered, setSelectedSeries, openPlayer, debugLog,
    isFloating, setIsFloating, opacity, setOpacity, customLists, setCustomLists,
    useDefaultLists, setUseDefaultLists
}) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isDebugVisible, setIsDebugVisible] = useState(false);
    const [listInput, setListInput] = useState(customLists);
    const settingsRef = useRef(null);

    useEffect(() => {
        setListInput(customLists);
    }, [customLists]);
    
    useEffect(() => {
        function handleClickOutside(event) {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setIsSettingsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [settingsRef]);
    
    const handleSaveLists = () => {
        setCustomLists(listInput);
        setIsSettingsOpen(false);
    };

    const handleRestoreDefaults = () => {
        setCustomLists('');
        setListInput('');
        setUseDefaultLists(true);
        setIsSettingsOpen(false);
    };

    return (
     <div className="w-80 bg-gray-900 text-white p-4 flex flex-col h-full overflow-hidden whitespace-nowrap">
        <div className="relative flex justify-between items-center mb-4 flex-shrink-0">
          <h1 className="text-xl font-bold">LiveHubTV</h1>
          <div className="flex items-center gap-2">
            <div ref={settingsRef}>
              <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} aria-label="Configurações" className="p-1 hover:bg-gray-700 rounded-full"><Cog size={20} /></button>
              {isSettingsOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 z-50 text-sm">
                  <h4 className="font-bold mb-3 text-base">Configurações</h4>

                  <h5 className="font-semibold mb-2 text-gray-300">Aparência</h5>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="floating-toggle" className="cursor-pointer">Modo Flutuante</label>
                    <input type="checkbox" id="floating-toggle" className="form-checkbox h-5 w-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" checked={isFloating} onChange={e => setIsFloating(e.target.checked)} />
                  </div>
                  {isFloating && (
                    <div className="mb-4">
                      <label htmlFor="opacity-slider" className="block mb-2">Opacidade ({Math.round(opacity * 100)}%)</label>
                      <input type="range" id="opacity-slider" min="0.2" max="1" step="0.05" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                    </div>
                  )}
                  <hr className="my-3 border-gray-700" />
                  
                  <h5 className="font-semibold mb-2 text-gray-300">Listas de Canais</h5>
                   <div className="flex items-center justify-between mb-2">
                    <label htmlFor="default-list-toggle" className="cursor-pointer text-sm">Carregar listas padrão</label>
                    <input 
                      type="checkbox" 
                      id="default-list-toggle" 
                      className="form-checkbox h-5 w-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" 
                      checked={useDefaultLists} 
                      onChange={e => setUseDefaultLists(e.target.checked)} 
                    />
                  </div>
                  <textarea 
                    className="w-full h-24 bg-gray-900 text-white border border-gray-600 rounded p-2 text-xs resize-y mb-2" 
                    placeholder="Adicione URLs (.m3u, .xml), uma por linha..."
                    value={listInput}
                    onChange={(e) => setListInput(e.target.value)}
                  ></textarea>
                  <div className="flex gap-2 mb-4">
                     <button onClick={handleSaveLists} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs">Salvar e Atualizar</button>
                     <button onClick={handleRestoreDefaults} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded text-xs">Restaurar Padrão</button>
                  </div>
                  <hr className="my-3 border-gray-700" />

                  <div>
                    <button onClick={() => setIsDebugVisible(!isDebugVisible)} className="flex justify-between items-center w-full p-1 rounded hover:bg-gray-900 text-xs text-gray-400">
                      <span>Painel de Debug</span>
                      {isDebugVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {isDebugVisible && (
                      <pre className="text-xs text-green-400 max-h-24 overflow-auto whitespace-pre-wrap bg-gray-950 p-2 rounded mt-1 border border-gray-700">
                        {debugLog.slice(0, 20).join('\n')}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => fetchLists()} aria-label="Refresh lists" className="p-1 hover:bg-gray-700 rounded-full"><RefreshCw className="cursor-pointer" size={20} /></button>
          </div>
        </div>
        <div className="mb-2 flex gap-2 flex-shrink-0">
          <button onClick={() => { setActiveTab('tv'); handleBackFromSeries(); }} className={`flex-1 p-2 rounded transition-colors ${activeTab === 'tv' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}><Tv size={16} className="inline mr-1" />TV</button>
          <button onClick={() => { setActiveTab('filmes'); handleBackFromSeries(); }} className={`flex-1 p-2 rounded transition-colors ${activeTab === 'filmes' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}><Clapperboard size={16} className="inline mr-1" />Filmes</button>
          <button onClick={() => { setActiveTab('séries'); handleBackFromSeries(); }} className={`flex-1 p-2 rounded transition-colors ${activeTab === 'séries' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}><Video size={16} className="inline mr-1" />Séries</button>
        </div>
        <div className="mb-4 relative flex-shrink-0">
          <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" className="w-full rounded p-1 pl-8 text-black" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="overflow-y-auto flex-grow">
          <h3 className="text-md font-semibold mb-1">Favoritos</h3>
          {favorites.length > 0 ? favorites.map((ch) => (
            <div key={`fav-${ch.url}-${ch.name}`} className="hover:bg-gray-700 p-2 rounded cursor-pointer flex justify-between items-center text-sm" title={ch.name}>
              <div onClick={() => { setSelectedSeries(null); openPlayer(ch.url, ch.name); }} className="truncate flex-1 pr-2">{ch.name}</div>
              <button onClick={() => toggleFavorite(ch)} aria-label="Remove from favorites"><Star size={16} className="text-yellow-400" /></button>
            </div>
          )) : <p className="text-xs text-gray-400">Nenhum favorito.</p>}
          <hr className="my-3 border-gray-700" />
          {/* Fix: Changed `active-tab` to `activeTab` to fix variable reference error. */}
          <h3 className="text-md font-semibold mb-1">{activeTab === 'tv' ? 'Canais de TV' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
          <div className="grid grid-cols-1 gap-1">
            {filtered.map((ch) => (
              <div key={`${ch.url}-${ch.name}`} className="bg-gray-800 p-2 rounded hover:bg-gray-700 text-sm">
                <div className="flex items-center justify-between">
                  <div onClick={() => ch.episodes ? setSelectedSeries(ch) : openPlayer(ch.url, ch.name)} className="cursor-pointer flex items-center flex-1 truncate" title={ch.name}>
                    {ch.logo && <img src={ch.logo} alt="" className="w-8 h-8 object-contain inline mr-2 flex-shrink-0" onError={(e) => e.target.style.display='none'} />} <span className="truncate">{ch.name}</span>
                  </div>
                  <button onClick={() => toggleFavorite(ch)} className="ml-2" aria-label={favorites.some(f => f.url === ch.url) ? 'Remove from favorites' : 'Add to favorites'}>
                    {favorites.some(f => f.url === ch.url) ? <Star size={16} className="text-yellow-400" /> : <StarOff size={16} className="text-white" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
}

const MainContent = ({ selectedSeries, handleBackFromSeries, currentUrl, currentTitle, openPlayer, handleVideoError, logDebug }) => (
     <div className="flex-1 bg-black flex flex-col items-center justify-center p-4 overflow-hidden h-full">
        {selectedSeries ? (
          <div className="text-white w-full h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-2xl font-bold truncate" title={selectedSeries.name}>{selectedSeries.name}</h2>
              <button onClick={handleBackFromSeries} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors">Voltar</button>
            </div>
            <div className="flex flex-1 overflow-hidden gap-4 flex-col md:flex-row">
              <div className="flex-1 md:flex-[2_2_0%] flex flex-col min-h-0">
                 {currentUrl ? <Player url={currentUrl} title={currentTitle} onPlayerError={handleVideoError} logDebug={logDebug} /> : <div className="w-full h-full bg-gray-900 flex items-center justify-center">Carregando episódio...</div>}
              </div>
              <div className="flex-1 md:flex-[1_1_0%] flex flex-col bg-gray-900 rounded-lg p-2">
                  <h3 className="text-lg font-semibold mb-2 px-2 flex-shrink-0">Episódios</h3>
                  <div className="overflow-y-auto pr-1">
                    {selectedSeries.episodes.sort((a,b) => a.name.localeCompare(b.name, undefined, {numeric: true})).map((ep) => (
                      <div key={`${ep.url}-${ep.name}`} className={`p-2 rounded cursor-pointer flex items-center mb-1 transition-colors ${ep.url === currentUrl ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`} onClick={() => openPlayer(ep.url, ep.name)} title={ep.name}>
                        {ep.logo && <img src={ep.logo} alt="" className="w-12 h-12 object-contain mr-3 flex-shrink-0" onError={(e) => e.target.style.display='none'} />}
                        <span className="truncate text-sm">{ep.name}</span>
                      </div>
                    ))}
                  </div>
              </div>
            </div>
          </div>
        ) : (
          currentUrl ? (
            <Player url={currentUrl} title={currentTitle} onPlayerError={handleVideoError} logDebug={logDebug} />
          ) : (
            <div className="text-gray-500 text-xl">Selecione uma mídia na lateral</div>
          )
        )}
      </div>
  );

function App() {
  const [channels, setChannels] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeTab, setActiveTab] = useState('tv');
  const [epgData, setEpgData] = useState({});
  const [debugLog, setDebugLog] = useState([]);
  const [currentUrl, setCurrentUrl] = useState(null);
  const [currentTitle, setCurrentTitle] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  
  // Settings State
  const [isFloating, setIsFloating] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [customLists, setCustomLists] = useState('');
  const [useDefaultLists, setUseDefaultLists] = useState(true);

  const logDebug = (msg) => {
    setDebugLog(logs => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...logs]);
  };
  
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSearch(searchInput);
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchInput]);

  useEffect(() => {
    if (selectedSeries && selectedSeries.episodes.length > 0) {
      const firstEpisode = selectedSeries.episodes.sort((a,b) => a.name.localeCompare(b.name, undefined, {numeric: true}))[0];
      openPlayer(firstEpisode.url, firstEpisode.name);
    }
  }, [selectedSeries]);

  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('favorites');
      const savedFloating = localStorage.getItem('isFloating');
      const savedOpacity = localStorage.getItem('opacity');
      const savedCustomLists = localStorage.getItem('customLists');
      const savedUseDefault = localStorage.getItem('useDefaultLists');
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      if (savedFloating) setIsFloating(JSON.parse(savedFloating));
      if (savedOpacity) setOpacity(JSON.parse(savedOpacity));
      if (savedCustomLists) setCustomLists(savedCustomLists);
      if (savedUseDefault) setUseDefaultLists(JSON.parse(savedUseDefault));
    } catch (e) {
      logDebug(`Error loading from localStorage: ${e.message}`);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('favorites', JSON.stringify(favorites));
      localStorage.setItem('isFloating', JSON.stringify(isFloating));
      localStorage.setItem('opacity', JSON.stringify(opacity));
      localStorage.setItem('customLists', customLists);
      localStorage.setItem('useDefaultLists', JSON.stringify(useDefaultLists));
    } catch (e) {
      logDebug(`Error saving to localStorage: ${e.message}`);
    }
  }, [favorites, isFloating, opacity, customLists, useDefaultLists]);

  const fetchLists = () => {
    setChannels([]);
    logDebug('Starting list fetch process...');

    const customUrls = customLists.split('\n').filter(url => url.trim().startsWith('http'));
    let urlsToFetch = [];

    if (useDefaultLists) {
        urlsToFetch.push(...DEFAULT_M3U_LISTS, ...DEFAULT_XML_LISTS);
        logDebug('Default lists will be included.');
    }
    
    if (customUrls.length > 0) {
        urlsToFetch.push(...customUrls);
        logDebug(`Found ${customUrls.length} custom URLs to include.`);
    }

    const uniqueUrls = [...new Set(urlsToFetch)];

    if (uniqueUrls.length === 0) {
        logDebug('No lists to load. Enable default lists or add custom URLs.');
        return;
    }

    logDebug(`Fetching a total of ${uniqueUrls.length} unique URLs.`);

    uniqueUrls.forEach(url => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                const content = data.trim();
                if (content.startsWith('#EXTM3U')) {
                    logDebug(`Parsing ${url.substring(0, 60)}... as M3U.`);
                    parseM3U(data);
                } else if (content.startsWith('<')) {
                    logDebug(`Parsing ${url.substring(0, 60)}... as XML.`);
                    parsePlutoXML(data);
                } else {
                    logDebug(`Unknown format for URL: ${url.substring(0, 60)}... Trying to detect content.`);
                    if (data.includes('#EXTM3U')) {
                        logDebug(`Detected M3U content in ${url.substring(0, 60)}...`);
                        parseM3U(data);
                    } else if (data.includes('<')) {
                         logDebug(`Detected XML content in ${url.substring(0, 60)}...`);
                         parsePlutoXML(data);
                    } else {
                        logDebug(`Could not determine format for URL: ${url.substring(0, 60)}...`);
                    }
                }
            })
            .catch(err => logDebug(`Error with URL ${url.substring(0, 60)}...: ${err.message}`));
    });

    fetch(XMLTV_URL)
      .then(res => res.text())
      .then(parseXMLTV)
      .catch(err => logDebug(`Erro XMLTV: ${err.message}`));
  };

  useEffect(() => {
    fetchLists();
  }, [customLists, useDefaultLists]);

  const detectGroup = (title) => {
    const lowerTitle = title.trim().toLowerCase();

    const seriesKeywords = ['série', 'serie', 'series', 'dorama', 'anime', 'animes', 'desenho'];
    if (seriesKeywords.some(kw => lowerTitle.includes(kw))) {
      return 'Séries';
    }

    const movieKeywords = ['filme', 'filmes', 'cinema', 'cine'];
    if (movieKeywords.some(kw => lowerTitle.includes(kw))) {
      return 'Filmes';
    }

    return 'TV';
  };

  const parseM3U = (data) => {
    const lines = data.split('\n');
    const chs = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('#EXTINF')) {
        const name = line.split(',').pop()?.trim() || 'Sem nome';
        const logoMatch = line.match(/tvg-logo="(.*?)"/);
        const groupMatch = line.match(/group-title="(.*?)"/);
        const groupFromAttr = groupMatch ? groupMatch[1].trim().toLowerCase() : '';
        const url = lines[i + 1]?.trim();
        const logo = logoMatch ? logoMatch[1] : '';
        const group = detectGroup(groupFromAttr || name);

        if (!url || !url.startsWith('http')) continue;

        let cleanedName = name;
        if (group !== 'Séries' && groupFromAttr.includes('|')) {
          const parts = groupFromAttr.split('|');
          if (parts.length > 1) {
            const suffix = parts[1].trim();
            cleanedName = `${suffix.charAt(0).toUpperCase() + suffix.slice(1)} - ${name}`;
          }
        }
        chs.push({ name: cleanedName, url, logo, group });
      }
    }
    const seriesGrouped = {};
    const groupedFinal = [];
    chs.forEach(ch => {
      if (ch.group === 'Séries') {
        const baseTitle = ch.name.replace(/( S\d+E\d+.*| T\d+ ?EP\d+.*)/i, '').trim();
        if (!seriesGrouped[baseTitle]) {
          seriesGrouped[baseTitle] = { ...ch, name: baseTitle, episodes: [] };
        }
        seriesGrouped[baseTitle].episodes.push(ch);
      } else {
        groupedFinal.push(ch);
      }
    });
    groupedFinal.push(...Object.values(seriesGrouped));
    setChannels(prev => [...prev, ...groupedFinal].sort((a,b) => a.name.localeCompare(b.name)));
    logDebug(`M3U parsed: ${chs.length} items found.`);
  };

  const parsePlutoXML = (xmlText) => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');
    const items = xml.querySelectorAll('channel');
    const chs = [];
    items.forEach(item => {
      const name = item.getAttribute('name') || item.querySelector('title')?.textContent || 'Sem nome';
      const url = item.querySelector('stream_url')?.textContent || '';
      const logo = item.querySelector('icon')?.getAttribute('src') || '';
      const group = detectGroup(name);
      if (url.startsWith('http')) {
        chs.push({ name, url, logo, group });
      }
    });
    setChannels(prev => [...prev, ...chs].sort((a,b) => a.name.localeCompare(b.name)));
    logDebug(`PlutoTV XML parsed: ${chs.length} items found.`);
  };

  const parseXMLTV = (text) => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    const progs = xml.querySelectorAll('programme');
    const epg = {};
    progs.forEach(p => {
      const channel = p.getAttribute('channel');
      const title = p.querySelector('title')?.textContent;
      const start = p.getAttribute('start');
      const stop = p.getAttribute('stop');
      if (!epg[channel]) epg[channel] = [];
      epg[channel].push({ title, start, stop });
    });
    setEpgData(epg);
    logDebug('XMLTV EPG data parsed.');
  };

  const toggleFavorite = (ch) => {
    setFavorites(prev => prev.some(c => c.url === ch.url) ? prev.filter(c => c.url !== ch.url) : [...prev, ch]);
  };

  const getFilteredChannels = () => {
    const currentTabGroupMapping = {
        'tv': 'tv',
        'filmes': 'filmes',
        'séries': 'séries'
    };
    const currentTabGroup = currentTabGroupMapping[activeTab] || 'tv';
    return channels.filter(ch => 
        ch.group.toLowerCase() === currentTabGroup && 
        ch.name.toLowerCase().includes(search.toLowerCase())
    );
  };

  const filtered = getFilteredChannels();

  const openPlayer = (url, name) => {
    setCurrentUrl(url);
    setCurrentTitle(name);
  };
  
  const handleBackFromSeries = () => {
    setSelectedSeries(null);
    setCurrentUrl(null);
    setCurrentTitle('');
  };

  const handleVideoError = () => {
    logDebug(`Error playing: ${currentUrl}`);
  };

  return (
    <div className={`h-screen overflow-hidden bg-black ${!isFloating ? 'flex' : 'relative'}`}>
      <button 
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          className={`absolute top-4 text-white bg-gray-800/50 hover:bg-gray-700/70 backdrop-blur-sm p-2 rounded-full z-30 transition-all duration-300 ease-in-out ${isSidebarVisible ? (isFloating ? 'left-80' : 'left-80 ml-4') : 'left-4'}`}
          aria-label={isSidebarVisible ? "Ocultar menu" : "Mostrar menu"}
      >
          {isSidebarVisible ? <ChevronsLeft size={20} /> : <Menu size={20} />}
      </button>

      <div 
        className={`transition-all duration-300 ease-in-out bg-gray-900 ${isFloating ? 'absolute top-0 left-0 h-full z-20 w-80' : 'flex-shrink-0'} ${(isSidebarVisible) ? (isFloating ? 'translate-x-0' : 'w-80') : (isFloating ? '-translate-x-full' : 'w-0')}`}
        style={isFloating ? { opacity } : {}}
      >
        <Sidebar 
            fetchLists={fetchLists}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleBackFromSeries={handleBackFromSeries}
            search={searchInput}
            setSearch={setSearchInput}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            filtered={filtered}
            setSelectedSeries={setSelectedSeries}
            openPlayer={openPlayer}
            debugLog={debugLog}
            isFloating={isFloating}
            setIsFloating={setIsFloating}
            opacity={opacity}
            setOpacity={setOpacity}
            customLists={customLists}
            setCustomLists={setCustomLists}
            useDefaultLists={useDefaultLists}
            setUseDefaultLists={setUseDefaultLists}
        />
      </div>

      <div className={`relative ${isFloating ? 'w-full h-full' : 'flex-1 flex flex-col'}`}>
        <MainContent 
            selectedSeries={selectedSeries}
            handleBackFromSeries={handleBackFromSeries}
            currentUrl={currentUrl}
            currentTitle={currentTitle}
            openPlayer={openPlayer}
            handleVideoError={handleVideoError}
            logDebug={logDebug}
        />
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
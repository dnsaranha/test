
export type MovieRepository = {
  name: string;
  url: string;
};

export const MOVIE_REPOSITORIES: MovieRepository[] = [
  {
    name: "Megabox Ondemand 1 Move",
    url: "https://gist.githubusercontent.com/rubensgabriel/0d9b42666c875ec3b1a2f042ee9ec1f6/raw/MegaboxFilmesLista"
  },
  {
    name: "Netcine Filmes 2017",
    url: "https://gist.githubusercontent.com/rubensgabriel/c31f91e32c25cd882c3c3a4b8aafbd0e/raw/filmesredccanaismega"
  },
  {
    name: "Top iTV Lançamentos",
    url: "https://gist.githubusercontent.com/rubensgabriel/a6dd08a52ac5b6bde0cb5b8c871eb2cd/raw/iTV"
  },
  {
    name: "Stan Filmes",
    url: "https://gist.githubusercontent.com/rubensgabriel/32a1f8a7a91ad5b64e0dcfc80b947d8e/raw/filmesstanbox"
  },
  {
    name: "Top Filmes Lançamentos 1",
    url: "https://gist.githubusercontent.com/rubensgabriel/1d4a8a5f9b609807d0e1ee96cf40c6fc/raw/filmesnetcinemegabox"
  },
  {
    name: "Top Filmes Lançamentos 2",
    url: "https://gist.githubusercontent.com/rubensgabriel/fcbd454efcbef3070b8725222a019b80/raw/filmesnetcinemegabox2"
  },
  {
    name: "Junior Filmes HD",
    url: "https://gist.githubusercontent.com/rubensgabriel/9bde984e88d3677fc20be6f6e3e91d9a/raw/LISTAJUNIORFILMES"
  },
  {
    name: "Filmes GDrive 1",
    url: "https://gist.githubusercontent.com/rubensgabriel/502b218de0a4e4eb88de09f7d33c82f6/raw/gdrivefilmes"
  },
  {
    name: "Filmes GDrive 2",
    url: "https://gist.githubusercontent.com/rubensgabriel/41219e8dc503b7c6d76e5c46f1d9d214/raw/gdrivefilmes2"
  }
];

export type ParsedMovie = {
  id: string;
  title: string;
  poster: string;
  year: number;
  genre: string[];
  rating?: number;
  streamUrl?: string;
  repository: string;
};

function parseKodiXML(xmlContent: string, repositoryName: string): ParsedMovie[] {
  const movies: ParsedMovie[] = [];
  
  try {
    // Parse basic XML structure for movie items
    const itemMatches = xmlContent.match(/<item>(.*?)<\/item>/gs) || [];
    
    itemMatches.forEach((item, index) => {
      const titleMatch = item.match(/<title>(.*?)<\/title>/s);
      const thumbnailMatch = item.match(/<thumbnail>(.*?)<\/thumbnail>/s);
      const linkMatch = item.match(/<link>(.*?)<\/link>/s);
      
      if (titleMatch) {
        let title = titleMatch[1].trim();
        
        // Clean up title from formatting tags
        title = title.replace(/\[COLOR[^\]]*\]/g, '');
        title = title.replace(/\[\/COLOR\]/g, '');
        title = title.replace(/\[B\]/g, '');
        title = title.replace(/\[\/B\]/g, '');
        title = title.replace(/\[I\]/g, '');
        title = title.replace(/\[\/I\]/g, '');
        
        // Extract year if present
        const yearMatch = title.match(/\((\d{4})\)/);
        const year = yearMatch ? parseInt(yearMatch[1]) : 2024;
        
        // Clean title from year
        title = title.replace(/\(\d{4}\)/, '').trim();
        
        const movie: ParsedMovie = {
          id: `${repositoryName}-${index}`,
          title: title,
          poster: thumbnailMatch ? thumbnailMatch[1].trim() : "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=cover&w=400&q=80",
          year: year,
          genre: ["Filme"],
          streamUrl: linkMatch ? linkMatch[1].trim() : undefined,
          repository: repositoryName
        };
        
        movies.push(movie);
      }
    });
  } catch (error) {
    console.error(`Erro ao fazer parse do repositório ${repositoryName}:`, error);
  }
  
  return movies;
}

export async function fetchMoviesFromRepository(repository: MovieRepository): Promise<ParsedMovie[]> {
  try {
    console.log(`Buscando filmes do repositório: ${repository.name}`);
    const response = await fetch(repository.url);
    
    if (!response.ok) {
      console.warn(`Repositório ${repository.name} retornou status ${response.status}`);
      return [];
    }
    
    const content = await response.text();
    const movies = parseKodiXML(content, repository.name);
    
    console.log(`${repository.name}: ${movies.length} filmes encontrados`);
    return movies;
  } catch (error) {
    console.error(`Erro ao buscar repositório ${repository.name}:`, error);
    return [];
  }
}

export async function fetchAllMovies(searchQuery?: string): Promise<ParsedMovie[]> {
  console.log('Buscando filmes de todos os repositórios...');
  
  const allMovies: ParsedMovie[] = [];
  
  // Busca paralela de todos os repositórios
  const promises = MOVIE_REPOSITORIES.map(repo => fetchMoviesFromRepository(repo));
  const results = await Promise.allSettled(promises);
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allMovies.push(...result.value);
    } else {
      console.error(`Falha no repositório ${MOVIE_REPOSITORIES[index].name}:`, result.reason);
    }
  });
  
  console.log(`Total de ${allMovies.length} filmes carregados`);
  
  // Filtrar por busca se fornecida
  if (searchQuery && searchQuery.trim()) {
    const filtered = allMovies.filter(movie => 
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    console.log(`${filtered.length} filmes encontrados para "${searchQuery}"`);
    return filtered;
  }
  
  return allMovies;
}

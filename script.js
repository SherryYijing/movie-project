let currentType = `popular`;
const currentUrl = `https://api.themoviedb.org/3/movie/`;
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1MjRhMTE0MWE0ZmY0Y2FmNDMzYWM2MTcwOWFiNmMwNCIsInN1YiI6IjY0NzY2OWJlMDA1MDhhMDBmOThhMmNmNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.g033pC4p5r6xK3C_wQy_-xZFqv1M3uB-U5oIke2UAkk',
  },
};

const state = {
  movies: [],
  movieDetail: [],
  likedMovies: [],
  currentNavPage: 'home',
};

function loadMovieDetail(movieId) {
  fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`, options)
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((err) => console.error(err));
}

function getMovieCategories(category) {
  if (category === 'Popular') {
    currentType = `popular`;
  } else if (category === 'Now Playing') {
    currentType = `now_playing`;
  } else if (category === 'Top Rated') {
    currentType = `top_rated`;
  } else if (category === 'Upcoming') {
    currentType = `upcoming`;
  }
  getMoviesData(currentUrl + `${currentType}?language=en-US&page=1`);
}

function getMoviesData(url) {
  fetch(url, options)
    .then((response) => response.json())
    .then((data) => {
      state.movies = data;
      renderView();
    })
    .catch((err) => console.error(err));
}

function createMovieNode(movie) {
  const div = document.createElement('div');
  div.className = 'movie';
  div.id = movie.id;

  fetch(
    `https://api.themoviedb.org/3/movie/${movie.id}?language=en-US`,
    options
  )
    .then((response) => response.json())
    .then((data) => {
      const rate = data.vote_average.toFixed(1);
      div.innerHTML = `
            <img class="movie_img" src="https://image.tmdb.org/t/p/w500${movie.poster_path}" />
            <div id=${div.id} class="movie_data">
              <h3 class="movie_name">${movie.original_title}</h3>
              <div id=${div.id}>
                <i class="ion-android-star">${rate}</i>
                <i class="ion-android-favorite-outline"></i>
              </div>
            </div>
      `;
    })
    .catch((err) => console.error(err));

  return div;
}

function loadPrepPage() {
  if (state.movies.page !== 1) {
    const prepPageNumber = state.movies.page - 1;
    getMoviesData(
      currentUrl + `${currentType}?language=en-US&page=${prepPageNumber}`
    );
  }
  renderView();
}

function loadNextPage() {
  if (state.movies.page !== state.movies.total_pages) {
    const nextPageNumber = state.movies.page + 1;
    getMoviesData(
      currentUrl + `${currentType}?language=en-US&page=${nextPageNumber}`
    );
  }
  renderView();
}

function clickSpecificMovie(movieId) {
  popOutWindowAfterClickMovie.style.display = '';
  popOutWindowAfterClickMovie.innerHTML = '';

  const popWindow = document.createElement('div');
  popWindow.className = 'pop-window';

  let targetMovie = '';
  state.movies.results.forEach((movie) => {
    if (movie.id === movieId) {
      targetMovie = movie;
    }
  });

  if (targetMovie) {
    const genreList = document.createElement('div');
    const companyList = document.createElement('div');
    companyList.className = 'company-list';

    fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`,
      options
    )
      .then((response) => response.json())
      .then((data) => {
        state.movieDetail = data;

        state.movieDetail.genres.forEach(function (genre) {
          genreList.innerHTML += genre.name + ' ';
        });

        state.movieDetail.production_companies.forEach(function (company) {
          companyList.innerHTML += `<img class="company_img" src="https://image.tmdb.org/t/p/w500${company.logo_path}" />`;
        });

        popWindow.innerHTML = `
        <div class="inner">
          <img class="inner_movie_img" src="https://image.tmdb.org/t/p/w500${targetMovie.poster_path}" />
        </div>
        <i class="ion-close"></i>
        <div class="inner">
          <h3 class="inner_movie_name">${targetMovie.original_title}</h3>
          <h4>Overview</h4>
          <p>${targetMovie.overview}</p>
          <h4>Genre</h4>
          <div class="genre">
            <span>${genreList.innerHTML}</span>
          </div>
          <h4>Rating</h4>
          <span>${state.movieDetail.vote_average}</span>
          <h4>Production companies</h4>
          ${companyList.innerHTML}
        </div>
      `;
      })
      .catch((err) => console.error(err));
  }

  const li = popWindow;
  popOutWindowAfterClickMovie.appendChild(li);

  renderView();
}

function addMovieIntoLikedList(movieId) {
  state.movies.results.forEach((movie) => {
    if (movie.id === movieId) {
      state.likedMovies.push(movie);
    }
  });
  renderView();
}

function removeMovieFromLikedList(movieId) {
  state.likedMovies = state.likedMovies.filter((movie) => {
    return movie.id !== movieId;
  });
  renderView();
}

function setActiveTab(navId) {
  state.currentNavPage = navId;
  renderView();
}

function renderView() {
  const moviesContainer = document.querySelector('.movie-container');
  const pageNumberText = document.querySelector('.page-number');

  const naviTabs = document.querySelectorAll('.nav-button');
  naviTabs.forEach(function (nav) {
    if (nav.id === state.currentNavPage) {
      nav.className = 'nav-button active';
    } else {
      nav.className = 'nav-button';
    }
  });

  moviesContainer.innerHTML = '';

  if (state.currentNavPage === 'home') {
    if (state.movies.results) {
      state.movies.results.forEach((movie) => {
        const li = createMovieNode(movie);
        moviesContainer.append(li);
        loadMovieDetail(movie.id);
      });
      prepButton.style.display = '';
      nextButton.style.display = '';
      pageNumberText.style.display = '';
      pageNumberText.innerHTML = `${state.movies.page} / ${state.movies.total_results}`;
    }
  } else {
    if (state.likedMovies) {
      state.likedMovies.forEach((movie) => {
        const li = createMovieNode(movie);
        moviesContainer.append(li);
        loadMovieDetail(movie.id);
      });

      prepButton.style.display = 'none';
      nextButton.style.display = 'none';
      pageNumberText.style.display = 'none';
    }
  }
}

const prepButton = document.querySelector('.prep-btn');
prepButton.addEventListener('click', function () {
  loadPrepPage();
});

const nextButton = document.querySelector('.next-btn');
nextButton.addEventListener('click', function () {
  loadNextPage();
});

const dropdownMenu = document.getElementById('dropdown-menu');
dropdownMenu.addEventListener('click', function (event) {
  const element = event.target.value;
  getMovieCategories(element);
});

const movieContainer = document.querySelector('.movie-container');
movieContainer.addEventListener('click', function (event) {
  const element = event.target;
  const movieId = Number(element.parentElement.id);
  if (element.className === 'movie_img') {
    if (movieId !== 0) {
      clickSpecificMovie(movieId);
    }
  } else if (element.className === 'ion-android-favorite-outline') {
    if (movieId !== 0) {
      if (state.currentNavPage === 'home') {
        let exist = false;
        state.likedMovies.forEach((movie) => {
          if (movie.id === movieId) {
            exist = true;
          }
        });
        if (exist) {
          removeMovieFromLikedList(movieId);
        } else {
          addMovieIntoLikedList(movieId);
        }
      } else if (state.currentNavPage === 'liked') {
        removeMovieFromLikedList(movieId);
      }
    }
  }
});

const popOutWindowAfterClickMovie = document.querySelector(
  '.popOut-window-container'
);
popOutWindowAfterClickMovie.addEventListener('click', function (event) {
  const element = event.target;
  if (element.className === 'ion-close') {
    popOutWindowAfterClickMovie.style.display = 'none';
  }
});

const navigationContainer = document.querySelector('.navigation');
navigationContainer.addEventListener('click', function (event) {
  if (event.target.className === 'nav-button') {
    const navId = event.target.id;
    setActiveTab(navId);
  }
});

getMovieCategories('Popular');

const movieForm = document.getElementById("movieSearchForm");
const movieInput = document.getElementById("userinput");
const movieOutput = document.getElementById("mkc");
const movieSubmitButton = document.getElementById("submitBtn");
const omdbApiKey = "a6606658";

function showMovieMessage(message, isError = false) {
    const paragraph = document.createElement("p");
    paragraph.className = isError ? "status-message status-error" : "status-message";
    paragraph.textContent = message;
    movieOutput.replaceChildren(paragraph);
}

function addMovieDetail(container, label, value) {
    const heading = document.createElement("h3");
    heading.textContent = label;
    const text = document.createElement("p");
    text.textContent = value && value !== "N/A" ? value : "No information available.";
    container.append(heading, text);
}

function renderMovie(movie) {
    const result = document.createElement("article");
    result.className = "movie-result";

    if (movie.Poster && movie.Poster !== "N/A") {
        const poster = document.createElement("img");
        poster.className = "movie-poster";
        poster.src = movie.Poster;
        poster.alt = `${movie.Title} poster`;
        poster.loading = "lazy";
        poster.addEventListener("error", () => {
            const placeholder = document.createElement("div");
            placeholder.className = "poster-placeholder";
            placeholder.textContent = "No poster available";
            poster.replaceWith(placeholder);
        }, { once: true });
        result.append(poster);
    } else {
        const placeholder = document.createElement("div");
        placeholder.className = "poster-placeholder";
        placeholder.textContent = "No poster available";
        result.append(placeholder);
    }

    const info = document.createElement("div");
    info.className = "movie-info";

    const title = document.createElement("h2");
    title.textContent = movie.Title;
    const year = document.createElement("p");
    year.className = "movie-year";
    year.textContent = movie.Year;
    info.append(title, year);
    addMovieDetail(info, "Plot", movie.Plot);
    addMovieDetail(info, "Cast", movie.Actors);
    result.append(info);
    movieOutput.replaceChildren(result);
}

movieForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = movieInput.value.trim();

    if (!title) {
        showMovieMessage("Enter a movie title to search.", true);
        movieInput.focus();
        return;
    }

    movieOutput.setAttribute("aria-busy", "true");
    movieSubmitButton.disabled = true;
    showMovieMessage("Searching…");

    try {
        const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${omdbApiKey}`);
        if (!response.ok) {
            throw new Error(`Movie request failed with status ${response.status}`);
        }

        const movie = await response.json();
        if (movie.Response !== "True") {
            showMovieMessage(movie.Error || "We couldn't find that movie. Check the title and try again.", true);
            return;
        }

        renderMovie(movie);
    } catch (error) {
        console.error("Unable to fetch movie details:", error);
        showMovieMessage("Something went wrong while loading the movie. Please try again.", true);
    } finally {
        movieOutput.setAttribute("aria-busy", "false");
        movieSubmitButton.disabled = false;
    }
});

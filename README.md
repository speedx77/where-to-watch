# Where To Watch
In the Age of Streaming, Where To Watch is a search engine that helps users find what streaming service their favorite shows and movies are on.


--- TO DO ----

----------- new ideas 1/14 ------------

    search using traktAPI, find tmdb id
    display results via
        tmdb show/movie image via id
        tmdb show detail via id
    click on /show/id or /movie/id content/id
        display tmdb show/movie image via id
        tmdb show detail via id
        tmdb where to watch
        tmdb vendor images

        -we're not linking out to external service


-----------------------------------------

1. homepage styling
    - purple/gray/black colors
    - icon/logo will be tv with eyes with the antennas as ears
    - background will be .mp4 of favorite shows/movies with static overlay and transitions
    - conclude in LARGE logo of WHERE TO WATCH

2. Video Preview on search results?

3. filter images by en "iso_639_1": "en", attribute
    - or api param to only search for en images

4. DB ideas
  - user table (user id / username / password)
  - recent search (user id / searchTerm) (max capacity of 10)
  - Likes/Dislikes (user id / content name / content id / content type / like / dislike) (default values = false)
  - Watchlist (user id / content name / content id / content type) 

  -> content id has to be unique related to show or movie content type

5. linear gradient on movie hero based on a color from the hero image

6. Remove Sign in and Login from nav bar when user.isAuthenticated

7. fix center div on most pages

8. add watchlist icon

9. watchlist likes and dislikes tables and flow

10. add recent searches

11. Welcome [USER] on homepage

12. Likes on showpage

----------

POST MVP

RECOMMENDATIONS VIA ML

RELATED CONTENT

REVIEWS AND STARS (OR OUT OF 10)

MOST SEARCHED?

---------------------
tmdb image sizes

"backdrop_sizes": [
  "w300",
  "w780",
  "w1280",
  "original"
],
"logo_sizes": [
  "w45",
  "w92",
  "w154",
  "w185",
  "w300",
  "w500",
  "original"
],
"poster_sizes": [
  "w92",
  "w154",
  "w185",
  "w342",
  "w500",
  "w780",
  "original"
],
"profile_sizes": [
  "w45",
  "w185",
  "h632",
  "original"
],
"still_sizes": [
  "w92",
  "w185",
  "w300",
  "original"
]
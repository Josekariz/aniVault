/** Shared Media fields for list cards, search, relations, recommendations. */
export const MEDIA_LIST_FIELDS = `
  id
  title {
    romaji
    english
    native
  }
  coverImage {
    large
  }
  bannerImage
  format
  status
  episodes
  averageScore
  genres
  seasonYear
`;

export const PAGE_ANIME_QUERY = `
  query PageAnime(
    $page: Int
    $perPage: Int
    $search: String
    $genre: String
    $sort: [MediaSort]
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
      }
      media(
        type: ANIME
        search: $search
        genre: $genre
        sort: $sort
        isAdult: false
      ) {
        ${MEDIA_LIST_FIELDS}
      }
    }
  }
`;

export const MEDIA_DETAIL_QUERY = `
  query MediaDetail($id: Int) {
    Media(id: $id, type: ANIME) {
      ${MEDIA_LIST_FIELDS}
      description(asHtml: false)
      duration
      source
      season
      studios {
        nodes {
          name
        }
      }
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      trailer {
        id
        site
        thumbnail
      }
      relations {
        edges {
          relationType
          node {
            id
            type
            title {
              romaji
              english
              native
            }
            coverImage {
              large
            }
            bannerImage
            format
            status
            episodes
            averageScore
            genres
            seasonYear
          }
        }
      }
      recommendations(sort: RATING_DESC, perPage: 8) {
        nodes {
          rating
          mediaRecommendation {
            id
            type
            title {
              romaji
              english
              native
            }
            coverImage {
              large
            }
            bannerImage
            format
            status
            episodes
            averageScore
            genres
            seasonYear
          }
        }
      }
    }
  }
`;

export const MEDIA_SEARCH_ONE_QUERY = `
  query SearchOne($search: String, $perPage: Int) {
    Page(page: 1, perPage: $perPage) {
      media(type: ANIME, search: $search, sort: POPULARITY_DESC, isAdult: false) {
        id
        title {
          romaji
          english
          native
        }
      }
    }
  }
`;

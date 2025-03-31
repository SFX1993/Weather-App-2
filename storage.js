class localStorageManager {
  saveRecentSearch(city) {
    let searches = this.getRecentSearches();
    if (!searches.includes(city)) {
      searches.unshift(city);
      searches = searches.slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(searches));
    }
  }
  getRecentSearches() {
    return JSON.parse(localStorage.getItem("recentSearches")) || [];
  }
}

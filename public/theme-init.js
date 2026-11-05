(function () {
  try {
    var raw = localStorage.getItem('facpass.preferences.v1');
    var theme = raw ? JSON.parse(raw).theme : 'system';
    var prefersDark =
      theme === 'dark' ||
      (theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', prefersDark);
  } catch {
    document.documentElement.classList.toggle(
      'dark',
      window.matchMedia('(prefers-color-scheme: dark)').matches,
    );
  }
})();

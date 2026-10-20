// Renders data/publications.json (made by scripts/update_publications.py from
// my NASA/ADS library) as a list grouped by year, with filters and search.
(function(){
  // Papers shown under "Selected publications", in this order (ADS bibcodes).
  const SELECTED = [
    "2025A&A...702A..63R",   // NEMESIS catalogue of YSOs in Orion
    "2026A&A...705A.172M",   // YSO variability with Gaia DR3
    "2021MNRAS.508.3710R",   // environment and spin evolution
    "2020MNRAS.499.3481A",   // metallicity and spin in the Kepler field
  ];
  // Short journal names for the coloured badges
  const JOURNALS = [
    [/^Astronomy and Astrophysics|^Astronomy & Astrophysics/i, "A&A", "aa"],
    [/^Monthly Notices/i, "MNRAS", "mnras"],
    [/^The Astrophysical Journal/i, "ApJ", "apj"],
    [/arXiv/i, "arXiv", "arxiv"],
  ];
  const MY_NAME = /^Roquette\b/i;
  const SHOW_AUTHORS = 3;   // authors shown before "et al."
  const list = document.getElementById("pub-list");
  const summary = document.getElementById("pub-summary");
  const search = document.getElementById("pub-search");
  let papers = [];
  let filter = "all";

  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
      ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
  }

  // ADS titles can contain a little HTML (e.g. <SUB>); keep the text only
  function plain(s){
    const div = document.createElement("div");
    div.innerHTML = s || "";
    return div.textContent;
  }

  // ADS/arXiv abstracts may contain bits of LaTeX; make them readable
  function tex(s){
    return plain(s)
      .replace(/\\mathrm\{([^}]*)\}/g, "$1")
      .replace(/\\sim/g, "~").replace(/\\%/g, "%").replace(/\\pm/g, "±")
      .replace(/\\odot/g, "⊙").replace(/\\alpha|α/g, "α")
      .replace(/\$/g, "");
  }

  function journalBadge(p){
    for (const [re, label, cls] of JOURNALS)
      if (re.test(p.journal)) return '<span class="journal-badge ' + cls + '">' + label + "</span>";
    return '<span class="journal-badge">' + esc(p.bibcode ? p.bibcode.slice(4, 9).replace(/\./g, "") : "") + "</span>";
  }

  function selectedEntry(p, i){
    const btn = (href, label) => '<a class="pub-btn" href="' + esc(href) + '">' + label + "</a>";
    const buttons = [];
    if (p.abstract) buttons.push('<button type="button" class="pub-btn abs-toggle" aria-expanded="false" aria-controls="abs-' + i + '">Abs</button>');
    if (p.arxiv) buttons.push(btn("https://arxiv.org/abs/" + p.arxiv, "arXiv"));
    if (p.bibcode) buttons.push(btn("https://ui.adsabs.harvard.edu/abs/" + encodeURIComponent(p.bibcode) + "/abstract", "ADS"));
    if (p.doi) buttons.push(btn("https://doi.org/" + p.doi, "Journal"));
    return '<li class="sel-pub">' +
      '<div class="sel-badge">' + journalBadge(p) + '<span class="sel-year">' + p.year + "</span></div>" +
      '<div class="sel-body">' +
        '<div class="pub-title">' + esc(plain(p.title)) + "</div>" +
        '<div class="pub-authors">' + authorList(p.authors) + "</div>" +
        '<div class="pub-ref">' + reference(p) + (p.citations ? ' <span class="cites">&middot; cited ' + p.citations + "&times;</span>" : "") + "</div>" +
        '<div class="pub-buttons">' + buttons.join("") + "</div>" +
        (p.abstract ? '<p class="pub-abstract" id="abs-' + i + '" hidden>' + esc(tex(p.abstract)) + "</p>" : "") +
      "</div></li>";
  }

  function renderSelected(){
    const box = document.getElementById("pub-selected");
    if (!box) return;
    const byCode = new Map(papers.map(p => [p.bibcode, p]));
    const chosen = SELECTED.map(c => byCode.get(c)).filter(Boolean);
    if (!chosen.length) { document.getElementById("selected").hidden = true; return; }
    box.innerHTML = '<ol class="sel-list">' + chosen.map(selectedEntry).join("") + "</ol>";
    box.querySelectorAll(".abs-toggle").forEach(b => b.addEventListener("click", () => {
      const abs = document.getElementById(b.getAttribute("aria-controls"));
      const open = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", String(open));
      abs.hidden = !open;
    }));
  }

  function isMe(author){ return MY_NAME.test(author); }
  function isFirstAuthor(p){ return p.authors.length && isMe(p.authors[0]); }

  // ADS mixes "Hernandez, David" and "Mas, C."; show everyone with initials
  function initials(a){
    const comma = a.indexOf(", ");
    if (comma < 0) return a;   // e.g. "SPIRou Consortium"
    const given = a.slice(comma + 2).split(/\s+/)
      .map(w => /\./.test(w) ? w : w.split("-").map(p => p.charAt(0) + ".").join("-"));
    return a.slice(0, comma) + ", " + given.join(" ");
  }

  function authorName(a){
    const name = esc(initials(a));
    return isMe(a) ? '<b class="me">' + name + "</b>" : name;
  }

  // "A, B, C, et al." keeping my name visible when I am further down the list
  function authorList(authors){
    if (authors.length <= SHOW_AUTHORS + 1) return authors.map(authorName).join("; ");
    const shown = authors.slice(0, SHOW_AUTHORS).map(authorName);
    const myIndex = authors.findIndex(isMe);
    if (myIndex >= SHOW_AUTHORS) shown.push("&hellip;", authorName(authors[myIndex]));
    return shown.join("; ") + ' <span class="etal">et al. (' + authors.length + " authors)</span>";
  }

  function reference(p){
    let ref = "<i>" + esc(p.journal) + "</i>";
    if (p.volume) ref += ", <b>" + esc(p.volume) + "</b>";
    if (p.page && p.page !== p.arxiv && !String(p.page).startsWith("arXiv")) ref += ", " + esc(p.page);
    return ref;
  }

  function mainLink(p){
    if (p.doi) return "https://doi.org/" + p.doi;
    if (p.arxiv) return "https://arxiv.org/abs/" + p.arxiv;
    if (p.bibcode) return "https://ui.adsabs.harvard.edu/abs/" + encodeURIComponent(p.bibcode) + "/abstract";
    return null;
  }

  function badges(p){
    const out = [];
    if (isFirstAuthor(p)) out.push('<span class="pub-badge first">first author</span>');
    if (p.doctype === "eprint") out.push('<span class="pub-badge">preprint</span>');
    else if (p.doctype === "inproceedings") out.push('<span class="pub-badge">proceedings</span>');
    else if (/thesis/.test(p.doctype)) out.push('<span class="pub-badge">thesis</span>');
    return out.join(" ");
  }

  function links(p){
    const out = [];
    if (p.bibcode) out.push('<a href="https://ui.adsabs.harvard.edu/abs/' + encodeURIComponent(p.bibcode) + '/abstract">ADS</a>');
    if (p.doi) out.push('<a href="https://doi.org/' + esc(p.doi) + '">DOI</a>');
    if (p.arxiv) out.push('<a href="https://arxiv.org/abs/' + esc(p.arxiv) + '">arXiv</a>');
    if (p.citations) out.push('<span class="cites">cited ' + p.citations + "&times;</span>");
    return out.join(" &middot; ");
  }

  function entry(p){
    const url = mainLink(p);
    const title = esc(plain(p.title));
    return '<li class="pub">' +
      '<div class="pub-title">' + (url ? '<a href="' + esc(url) + '">' + title + "</a>" : title) + " " + badges(p) + "</div>" +
      '<div class="pub-authors">' + authorList(p.authors) + "</div>" +
      '<div class="pub-ref">' + reference(p) + (links(p) ? ' <span class="pub-links">' + links(p) + "</span>" : "") + "</div>" +
      "</li>";
  }

  function matches(p, q){
    if (filter === "refereed" && !p.refereed) return false;
    if (filter === "first" && !isFirstAuthor(p)) return false;
    if (!q) return true;
    return (plain(p.title) + " " + p.authors.join(" ") + " " + p.journal + " " + p.year)
      .toLowerCase().includes(q);
  }

  function render(){
    const q = search.value.trim().toLowerCase();
    const shown = papers.filter(p => matches(p, q));
    if (!shown.length) {
      list.innerHTML = '<p class="text-center text-muted">No publications match.</p>';
      return;
    }
    let html = "", year = null;
    shown.forEach(p => {
      if (p.year !== year) {
        if (year !== null) html += "</ol>";
        year = p.year;
        html += '<h3 class="pub-year">' + year + '</h3><ol class="pub-group">';
      }
      html += entry(p);
    });
    list.innerHTML = html + "</ol>";
  }

  function showSummary(data){
    const refereed = papers.filter(p => p.refereed).length;
    const first = papers.filter(isFirstAuthor).length;
    summary.innerHTML =
      "<b>" + papers.length + "</b> publications, <b>" + refereed + "</b> refereed, <b>" +
      first + "</b> as first author.<br>Generated from my " +
      '<a href="' + esc(data.source) + '">NASA/ADS library</a>' +
      (data.updated ? ", last updated " + esc(data.updated) : "") + ".";
  }

  $(".pub-filter").on("click", function(){
    $(".pub-filter").removeClass("active");
    $(this).addClass("active");
    filter = this.dataset.filter;
    render();
  });
  search.addEventListener("input", render);

  function load(data){
    papers = data.papers.slice().sort((a, b) =>
      (b.pubdate || "").localeCompare(a.pubdate || "") || b.year - a.year);
    showSummary(data);
    renderSelected();
    render();
  }

  // data/publications.js (loaded before this file) sets window.PUBLICATIONS.
  // It works even when the page is opened straight from disk; the .json
  // fetch is only a fallback.
  const fromScript = window.PUBLICATIONS
    ? Promise.resolve(window.PUBLICATIONS)
    : fetch("data/publications.json", {cache: "no-cache"})
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
  fromScript
    .then(load)
    .catch(() => {
      list.innerHTML = '<p class="text-center">Could not load the publication list. ' +
        'Please see it on <a href="https://ui.adsabs.harvard.edu/public-libraries/8JBeznfWQmWUeiV-poEimw">NASA/ADS</a>.</p>';
    });
})();

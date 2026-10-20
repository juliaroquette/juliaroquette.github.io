// Research page: each research track (wine / astrophysics) is shown only after
// its box is clicked. Clicking the open box again hides it. Links such as
// research.html#astro or research.html#environment-spin open the right track.
(function(){
  const cards = Array.from(document.querySelectorAll(".track-card"));
  const tracks = Array.from(document.querySelectorAll(".research-track"));
  const hint = document.querySelector(".track-hint");

  function show(trackId, scrollTarget, keepHash){
    tracks.forEach(t => t.classList.toggle("open", t.id === trackId));
    cards.forEach(c => c.setAttribute("aria-expanded", String(c.getAttribute("aria-controls") === trackId)));
    if (hint) hint.hidden = Boolean(trackId);
    if (!keepHash) history.replaceState(null, "", trackId ? "#" + trackId : location.pathname);
    if (scrollTarget) {
      const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
      scrollTarget.scrollIntoView({behavior: smooth ? "smooth" : "auto", block: "start"});
    }
  }

  cards.forEach(card => card.addEventListener("click", function(){
    const id = card.getAttribute("aria-controls");
    if (card.getAttribute("aria-expanded") === "true") show(null);
    else show(id, document.getElementById(id));
  }));

  // Open the track that contains the element named in the URL, if any
  function openFromHash(){
    const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    const track = target && target.closest(".research-track");
    if (track) show(track.id, target, true);
  }
  window.addEventListener("hashchange", openFromHash);
  openFromHash();
})();

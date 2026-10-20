// Hide the loading animation once the page has loaded, or after 1.5 s at most
// so that pages with many images are not stuck behind it.
function hideLoader(){
  if (hideLoader.done) return;
  hideLoader.done = true;
  $(".loader").css("pointer-events", "none"); // don't block clicks while fading
  $(".loader .inner").fadeOut(500, function(){
    $(".loader").fadeOut(750);
  });
}
$(window).on("load", hideLoader);
setTimeout(hideLoader, 1500);

$(document).ready(function(){ //things starting with $ are jquery

  // Sticky navigation bar: once the page scrolls past the navbar, pin it to the top
  const nav = $("#navigation");
  if (nav.length) {
    let navTop = nav.offset().top;

    function stickyNavigation() {
      var body = $("body");
      if ($(window).scrollTop() >= navTop) {
        body.css("padding-top", nav.outerHeight() + "px");
        body.addClass("fixedNav");
      }
      else {
        body.css("padding-top", 0);
        body.removeClass("fixedNav");
      }
    }

    $(window).on("scroll", stickyNavigation);
    $(window).on("resize", function(){
      if (!$("body").hasClass("fixedNav")) navTop = nav.offset().top;
    });
    stickyNavigation();
  }

  // Comics lightbox: clicking a comic opens the large version in a <dialog>
  const box = document.getElementById("lightbox");
  if (box) {
    const img = box.querySelector("img");
    const title = box.querySelector(".lightbox-title");
    const full = box.querySelector(".lightbox-full");

    $(".comic-card").on("click", function(){
      img.src = this.dataset.large;
      img.alt = this.dataset.title;
      title.textContent = this.dataset.title;
      full.href = this.dataset.full;
      box.showModal();
    });
    // close with the button, or by clicking on the dark backdrop
    $(box).on("click", function(e){
      if (e.target === box || $(e.target).is(".lightbox-close")) box.close();
    });
  }
});

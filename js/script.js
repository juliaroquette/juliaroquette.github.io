$(window).on("load", function(){
    $(".loader .inner").fadeOut(500, function(){
      $(".loader").fadeOut(750);
    });
  });

$(document).ready(function() { //things starting with $ are jquery
  $('#slides').superslides({animation: 'fade',
                            play: 5000,
                            pagination: false      
                          });
  var typed= new Typed(".typed", {
      strings: ["astrophysicist.","PhD.","Physicist.","Data Analyst."],
      typeSpeed: 70,
      loop: true,
      start: 1000,
      showCursor: false
  });
  $('.owl-carousel').owlCarousel({
      loop:true,
    items: 4,
      //margin:10,
      //nav:true,
      responsive:{
          0:{
              items:1
          },
          480:{
              items:2
          },
          768:{
              items:3
          },
          938:{
              items: 4
          },
      }
  })
  
 
  var skillsTopOffset = $(".skillsSection").offset().top;
  var statsTopOffset = $(".statsSection").offset().top;
  var countUpFinished = false;
  //console.log(skillsTopOffset); 1480
  $(window).scroll(function(){ //when window is scrolled, do that:
    if(window.pageYOffset>skillsTopOffset-$(window).height()+200){
      $('.chart').easyPieChart({
        easing: 'easeInOut',
        barColor: '#fff',
        trackColor: false,
        scaleColor: false,
        lineWidth: 4,
        size: 152,
        onStep: function(from, to, percent){
              $(this.el).find('.percent').text(Math.round(percent));
        }
      });
    };
    if(!countUpFinished && window.pageYOffset>statsTopOffset-$(window).height()+200){
      $(".counter").each(function(){
        var element = $(this);
        var endVal = parseInt(element.text());

        element.countup(endVal);
      })
      countUpFinished=true;
    };
  });

  $("#navigation li a").click(function(e){
    e.preventDefault();
    var targetElement = $(this).attr("href");
    var targetPosition = $(targetElement).offset().top;
    $("html, body").animate({scrollTop:targetPosition - 50}, "slow");
  });

  const nav =$("#navigation");
  const navTop= nav.offset().top;

  $(window).on("scroll", sitckyNavigation);

  function sitckyNavigation(){
      var body = $("body");
      if($(window).scrollTop() >= navTop){
        body.css("padding-top",nav.outerHeight()+"px");
        body.addClass("fixedNav");
      }
    else {
      body.css("padding-top",0);
      body.removeClass("fixedNav");
    }
  }
});

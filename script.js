window.addEventListener("scroll", function () {
  var nav = document.querySelector("nav");
  var logoText = document.querySelector(".logo-text");
  var scrollToTopBtn = document.getElementById("scrollToTop");
  if (window.scrollY > 0) {
    nav.classList.add("shrink");
    logoText.classList.add("hidden");
    scrollToTopBtn.classList.add("visible");
  } else {
    nav.classList.remove("shrink");
    logoText.classList.remove("hidden");
    scrollToTopBtn.classList.remove("visible");
  }
});

// Scroll to top function
document
  .getElementById("scrollToTop")
  .addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
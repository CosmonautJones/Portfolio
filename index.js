var els = document.querySelectorAll('nav li a');
var links = document.getElementsByTagName('a');
for (var i = 0; i < links.length; i++) {
    var link = links[i];
    if (location.pathname.replace(/^\//, '') == link.pathname.replace(/^\//, '') &&
        location.hostname == link.hostname && link.hash.replace(/#/, '')) {
        link.addEventListener('click', function(e) {
            //remove all active elements
            for (var i = 0; i < els.length; i++) {
                els[i].classList.remove('active');
            }
            var targetId = this.hash,
                targetAnchor = '[name=' + this.hash.slice(1) + ']';
            var target = targetId.length ? targetId : targetAnchor.length ? targetAnchor : false;
            this.classList.add('active');
            //find top coordinate of the element
            window.scroll({
                top: document.querySelector(target).offsetTop, // could be negative value
                left: 0,
                behavior: 'smooth'
            });
            e.preventDefault();
        });
    }
}

// When the user scrolls the page, execute myFunction
window.onscroll = function() {
  myFunction();
};

// Get the header
let header = document.getElementById('navStick');

// Get the offset position of the navbar
let sticky = header.offsetTop;

// Add the sticky class to the header when you reach its scroll position. Remove "sticky" when you leave the scroll position
function myFunction() {
  if (window.pageYOffset > sticky) {
    header.classList.add('sticky');
  } else {
    header.classList.remove('sticky');
  }
}

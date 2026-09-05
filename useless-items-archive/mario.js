
// mario skills

const mario1 = document.getElementById("mario1");
const mario2 = document.getElementById("mario2");
const mario3 = document.getElementById("mario3");
const mario4 = document.getElementById("mario4");
const brick1 = document.getElementById("brick1");
const brick2 = document.getElementById("brick2");
const mysteryBlock = document.getElementById("mystery-block");
const itemDate = document.querySelector(".item-date");
const itemContent = document.querySelector(".item-content");

for (let i = 0; i < 16; i++) {
  const mario1Row = document.createElement("div");
  mario1Row.className = "row";
  mario1.appendChild(mario1Row);

  const mario2Row = document.createElement("div");
  mario2Row.className = "row";
  mario2.appendChild(mario2Row);

  const mario3Row = document.createElement("div");
  mario3Row.className = "row";
  mario3.appendChild(mario3Row);

  const mario4Row = document.createElement("div");
  mario4Row.className = "row";
  mario4.appendChild(mario4Row);

  const brick1Row = document.createElement("div");
  brick1Row.className = "row";
  brick1.appendChild(brick1Row);

  const brick2Row = document.createElement("div");
  brick2Row.className = "row";
  brick2.appendChild(brick2Row);

  const mysteryRow = document.createElement("div");
  mysteryRow.className = "row";
  mysteryBlock.appendChild(mysteryRow);

  for (let i = 0; i < 16; i++) {
    const mario1Pixel = document.createElement("div");
    mario1Pixel.className = "pixel";
    mario1Row.appendChild(mario1Pixel);

    const mario2Pixel = document.createElement("div");
    mario2Pixel.className = "pixel";
    mario2Row.appendChild(mario2Pixel);

    const mario3Pixel = document.createElement("div");
    mario3Pixel.className = "pixel";
    mario3Row.appendChild(mario3Pixel);

    const mario4Pixel = document.createElement("div");
    mario4Pixel.className = "pixel";
    mario4Row.appendChild(mario4Pixel);

    const brick1Pixel = document.createElement("div");
    brick1Pixel.className = "pixel";
    brick1Row.appendChild(brick1Pixel);

    const brick2Pixel = document.createElement("div");
    brick2Pixel.className = "pixel";
    brick2Row.appendChild(brick2Pixel);

    const mysteryPixel = document.createElement("div");
    mysteryPixel.className = "pixel";
    mysteryRow.appendChild(mysteryPixel);
  }
}

let timelineItems = [
  { date: "June 1986", content: "Super Mario Bros: The Lost Levels" },
  { date: "October 1988", content: "Super Mario Bros. 2" },
  { date: "October 1988", content: "Super Mario Bros. 3" },
  { date: "April 1989", content: "Super Mario Land" },
  { date: "November 1990", content: "Super Mario World" },
  { date: "October 1992", content: "Super Mario Land: 6 Golden Coins" },
  { date: "August 1995", content: "Super Mario World 2: Yoshi's Island" },
  { date: "June 1996", content: "Super Mario 64" },
  { date: "July 2002", content: "Super Mario Sunshine" },
  { date: "May 2006", content: "New Super Mario Bros." },
  { date: "November 2007", content: "Super Mario Galaxy" },
  { date: "November 2009", content: "New Super Mario Bros. Wii" },
  { date: "May 2010", content: "Super Mario Galaxy 2" },
  { date: "November 2011", content: "Super Mario 3D Land" },
  { date: "July 2012", content: "New Super Mario Bros 2" },
  { date: "November 2012", content: "New Super Mario Bros. U" },
  { date: "November 2013", content: "Super Mario 3D World" },
  { date: "September 2015", content: "Super Mario Maker" },
  { date: "December 2016", content: "Super Mario Run" },
  { date: "October 2017", content: "Super Mario Odyssey" },
  { date: "June 2019", content: "Super Mario Maker 2" },
  {
    date: "February 2021",
    content: "Super Mario 3D World + Bowser's Fury",
  },
  { date: "?", content: "???" },
];

for (var i = 0; i < timelineItems.length; i++) {
  let k = i;
  setTimeout(function () {
    itemDate.innerText = timelineItems[k]["date"];
    itemContent.innerText = timelineItems[k]["content"];
  }, 3000 * (k + 1));
}

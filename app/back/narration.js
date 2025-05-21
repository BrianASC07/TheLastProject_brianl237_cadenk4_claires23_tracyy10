const background = [
  " was taking a stroll around the neighborhood",
  " was taking their dog for a walk",
  " was running through a big sunny field",
  " was doing cartwheels on the grass"
];

const action = [
  " fell onto someone's upturned rake",
  " tripped over someone's pet rock",
  " fell into a 6-foot pit that someone dug in the grass", 
  " slipped on someone's banana peel",
  " got attacked by someone's lawn mower",
  " got run over by a motorcycle"
]

const result = [
  " and was left to marinate in their big pool of blood",
  " and slowly faded into nothingness",
  " and never got up again"
]

const saved = [
  ", but then someone pushed them out of the way at the last second, saving their life.", 
  ', but then someone screamed "WATCH OUT!!!" just in time to save their life.', 
  ", but then someone called their name, causing them to turn in the opposite direction and saving their life."
]

function randomInt(max) {
  return Math.floor(Math.random()*max);
}

function script(user, death) {
  var res = user;
  res+=background[randomInt(4)];
  if (death) {
    res+=" when they" + action[randomInt(6)];
    res+=result[randomInt(3)];
  } else {
    res+=" when they almost" + action[randomInt(6)];
    res+=saved[randomInt(3)];
  }
  return res;
}

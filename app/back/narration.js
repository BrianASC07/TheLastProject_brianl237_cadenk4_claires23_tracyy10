const background = [
  "was taking a stroll around the neighborhood",
  "was taking their dog for a walk",
  "was running through a big sunny field",
  "was doing cartwheels on the grass"
];

const action = [
  "fell onto an upturned rake",
  "tripped over someone's sharp pet rock"
]

const result = [
  "and was left to marinate in their big pool of blood",
  "and hit their head a little too hard"
]

const saved = [
  "but then someone pushed them out of the way"
]

function randomInt(max) {
  return Math.floor(Math.random()*max);
}

function script(user, death) {
  var result = user;
  result+=background[randomInt(4)]
}

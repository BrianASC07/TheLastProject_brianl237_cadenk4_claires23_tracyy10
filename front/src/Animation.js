export function Canvas(narration) {
  return (
    <body>
        <canvas id="draw_here" width="500" height="500" style="border:1px solid #000000;"></canvas>
        <div>
            <p id="narration">{{narration}}</p>
        </div>
        <script>
            var narration = document.getElementById("narration");
            narration = narration.textContent;

            var drawing = document.getElementById("draw_here");
            var context = drawing.getContext('2d');

            var image = new Image();
            var img = [];

            if (narration.includes("stroll around the neighborhood") || narration.includes("running through a big sunny field") || narration.includes("scouting out possible picnic spots") || narration.includes("cheerfully frolicking") || narration.includes("grandmother's huge garden") || narration.includes("half marathon") || narration.includes("walking in the meadow")) {
                img.push("./animations/background.png");
            } else if (narration.includes("taking their dog for a walk")) {
                img.push("./animations/dog.png");
            } else if (narration.includes("build up their bug collection")) {
                img.push("./animations/bug.png");
            } else if (narration.includes("chase a pretty butterfly")) {
                img.push("./animations/butterfly.png");
            }

            if (narration.includes("upturned rake")) {
                img.push("./animations/rake.png");
            } else if (narration.includes("pet rock")) {
                img.push("./animations/rock.png");
            } else if (narration.includes("puddle of oil")) {
                img.push("./animations/oil.png");
            } else if (narration.includes("banana peel")) {
                img.push("./animations/banana.png");
            } else if (narration.includes("skateboard")) {
                img.push("./animations/skateboard.png");
            } else if (narration.includes("pet duck")) {
                img.push("./animations/duck.png");
            } else if (narration.includes("thorny pet plant")) {
                img.push("./animations/cactus.png");
            } else if (narration.includes("empty soda can")) {
                img.push("./animations/soda.png");
            } else if (narration.includes("jack-o-lantern")) {
                img.push("./animations/pumpkin.png");
            } else if (narration.includes("piece of string")) {
                img.push("./animations/string.png");
            }

            var dead = true;
            if (narration.includes("pool of blood")) {
                img.push("./animations/blood.png");
            } else if (narration.includes("slowly decompose")) {
                img.push("./animations/rot.png");
            } else if (narration.includes("never got up")) {
                img.push("./animations/dead.png");
            } else if (narration.includes("freshly baked cookies")) {
                dead = false;
                img.push("./animations/cookie.png");
            } else {
                dead = false;
                img.push("./animations/exclaim.png");
            }

            image.src = img[0];
            image.crossOrigin = true;
            var intervalID = null;
            var row = 0;
            var col = 0;
            var tracker = "background";

            if (narration.includes("running") || narration.includes("chase") || narration.includes("marathon")) {
              var speed = 75;
            } else {
              var speed = 300;
            }
            image.onload = function () {
                intervalID = setInterval(animate, speed, 4, 3, 3);
                //context.drawImage(image, 1, 1, 400, 400, 0, 0, 500, 500);
            }

            function animate(rows, cols, endCol) {
                if (col === cols) {
                    col = 0;
                    row += 1;
                }
                console.log(row, col);
                context.clearRect(0, 0, 500, 500);
                context.drawImage(image, 0+480*col, 0+480*row, 480, 480, 0, 0, 500, 500);
                if (row === (rows-1) && col === (endCol-1)) {
                    clearInterval(intervalID);
                    if (tracker === "background") {
                        tracker = "action";
                        image.src=img[1];
                        image.onload = function() {
                            row = 0;
                            col = 0;
                            if (dead) {
                                intervalID = setInterval(animate, speed, 4, 4, 2);
                            } else {
                                intervalID = setInterval(animate, speed, 3, 4, 2);
                            }
                        }
                    } else if (tracker === "action") {
                        tracker = "result";
                        speed = 300;
                        image.src=img[2];
                        image.onload = function() {
                            row = 0;
                            col = 0;
                            if (dead) {
                                intervalID = setInterval(animate, speed, 3, 2, 1);
                            } else {
                                intervalID = setInterval(animate, speed, 4, 3, 2);
                            }
                        }
                    }
                }
                col += 1;
            }
        </script>
    </body>
  )
}

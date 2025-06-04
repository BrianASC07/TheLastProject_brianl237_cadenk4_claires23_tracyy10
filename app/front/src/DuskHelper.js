export function DuskHelper() {
  return (
    <html>
    <canvas id="draw_here" width="500" height="500" style="border:1px solid #000000;"></canvas>

    <script>
        var drawing = document.getElementById("draw_here");
        var context = drawing.getContext('2d');

        var image = new Image();

        image.src = "./condemn.png";
        image.crossOrigin = true;
        var intervalID = null;
        var row = 0;
        var col = 0;
        var speed = 300;

        image.onload = function () {
            intervalID = setInterval(animate, speed, 5, 5, 2)
            //context.drawImage(image, 1, 1, 400, 400, 0, 0, 500, 500);
        }

        function animate(rows, cols, endCol) {
            if (col === cols) {
                col = 0
                row += 1
            }
            console.log(row, col)
            context.clearRect(0, 0, 500, 500)
            context.drawImage(image, 0+480*col, 0+480*row, 480, 480, 0, 0, 500, 500)
            if (row === (rows-1) && col === (endCol-1)) {
                clearInterval(intervalID)
            }

            col += 1
        }
        /*
        row = 0;
        col = 0;
        image.src="./rake.png";
        image.onload = function () {
            intervalID = setInterval(animate, speed, 4, 4, 2);
            //context.drawImage(image, 1, 1, 400, 400, 0, 0, 500, 500);
        }
        */

    </script>
  </html>
  )
}
 export default DuskHelper

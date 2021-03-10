const { createCanvas } = require('canvas');
module.exports = {
  draw_piechart(values, names) {

    const canvas = createCanvas(600, 600);
    const ctx = canvas.getContext('2d');

    const w = canvas.width;
    const h = canvas.height;
    ctx.font = 'small-caps bold 50px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const colors = [
      '#eeff00', '#ff0000', '#ffaa00', '#40ff40', '#ff8c40', '#ffe680', '#ff9180', '#8091ff',
      '#a200f2', '#f20000', '#00e2f2', '#b6e6f2', '#e5397e', '#e673de', '#e6acbb', '#2db362',
      '#2d74b3', '#9e86b3', '#2929a6', '#99754d', '#668000', '#730000', '#6d7356', '#735656',
      '#1a5766', '#59163a', '#165943', '#220033', '#143300', '#331b00'
    ];

    let total = 0;
    let i;
    for(i = 0; i < values.length; i++) {
      total += values[i];
    }

    let start_angle = 0;
    let end_angle = 0;
    let bearing = 0;
    let adj = 0;
    let opp = 0;
    let hyp = w/3;
    let pos_x = 0;
    let pos_y = 0;
    for(i = 0; i < values.length; i++) {

      end_angle = start_angle + (values[i]/total) * (2*Math.PI);
      ctx.beginPath();
      ctx.fillStyle = colors[i];
      ctx.moveTo(w/2, h/2);
      if (i !== values.length - 1) {
        // if this arc isn't thhe last one being drawn
        // then draw it slightly further to fix ugly lines between segments
        ctx.arc(w/2, h/2, w/2 - 10, start_angle, end_angle * 1.1);
      } else {
        // else this is the last arc being drawn
        // so don't draw it bigger as it will overlap the first arc
        ctx.arc(w/2, h/2, w/2 - 10, start_angle, end_angle);
      }
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'black';
      if (values[i]/total > 0.05 && values[i]/total < 1) {
        ctx.font = 'small-caps bold 50px sans-serif';
        bearing = start_angle + ((end_angle - start_angle) / 2);
        adj = hyp*Math.cos(bearing);
        opp = hyp*Math.sin(bearing);
        pos_x = w/2 + adj*1.25;
        pos_y = w/2 + opp*1.25;
        ctx.fillText(values[i], pos_x, pos_y);
        if (names) {
          ctx.font = 'small-caps bold 30px sans-serif';
          pos_x = w/2 + adj;
          pos_y = w/2 + opp; 
          ctx.fillText(names[i], pos_x, pos_y);
        }
      } else if (values[i]/total === 1) {
        ctx.fillText(values[i], w/2, h/2);
        ctx.font = 'small-caps bold 30px sans-serif';
        ctx.fillText(names[i], w/2, h/2 + h/10);
      }

      start_angle += (values[i]/total) * (2*Math.PI);

    }

    return canvas.toBuffer();

  },
  draw_chessboard(coords) {

    const canvas = createCanvas(450, 450);
    const ctx = canvas.getContext('2d');

    const w = canvas.width;
    const h = canvas.height;
    ctx.font = 'small-caps bold 50px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    let pieces = {
      br:'♜',
      bk:'♞',
      bb:'♝',
      bq:'♛',
      be:'♚', // emperor instead of king
      bp:'♟︎',
      wr:'♖',
      wk:'♘',
      wb:'♗',
      wq:'♕',
      we:'♔',
      wp:'♙',
      em:' '
    };
    let bottomSide = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    let rightSide = ['1', '2', '3', '4', '5', '6', '7', '8'];

    let x, y, i = 2;
    for (y = 0; y < coords.length; y++) {
      for (x = 0; x < coords.length; x++) {

        if (i % 2 == 1) {
          ctx.fillStyle = 'skyblue'; // dark
        } else {
          ctx.fillStyle = 'paleturquoise'; // light
        }

        ctx.fillRect(x*50, y*50, x*50+50, y*50+50);
        i++;

        ctx.fillStyle = 'black';
        ctx.fillText(pieces[coords[y][x]], x*50+2, y*50-2); // +2 and -2 is because it wasn't centered otherwise
      }
      i++;
    }

    ctx.fillStyle = 'white';
    ctx.fillRect(400, 0, w, h);
    ctx.fillRect(0, 400, w, h);
    ctx.fillStyle = 'black';
    for (y = 0; y < rightSide.length; y++) {
      ctx.fillText(rightSide[y], x*50+8, y*50-2);
    }
    for (x = 0; x < bottomSide.length; x++) {
      ctx.fillText(bottomSide[x], x*50+4, y*50-2);
    }

    return canvas.toBuffer();

  }

};

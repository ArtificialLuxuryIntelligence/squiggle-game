function drawFromPoints(ctx, collection, strokecolour) {
  ctx.strokeStyle = strokecolour;
  for (let i = 0; i < collection.length; i++) {
    // ctx.moveTo(collection[i][0].x, collection[i][0].y);
    ctx.beginPath();
    for (let j = 0; j < collection[i].length - 1; j++) {
      // linear;
      // ctx.lineTo(collection[i][j].x, collection[i][j].y);

      //quadratic:
      const midPoint = midPointOf(collection[i][j], collection[i][j + 1]);
      ctx.quadraticCurveTo(
        collection[i][j].x,
        collection[i][j].y,
        midPoint.x,
        midPoint.y
      );
    }
    //straight line to last pt.
    ctx.lineTo(
      collection[i][collection[i].length],
      collection[i][collection[i].length]
    );

    ctx.stroke();
    ctx.closePath();
  }
}

function midPointOf(p1, p2) {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2,
  };
}

export { drawFromPoints };

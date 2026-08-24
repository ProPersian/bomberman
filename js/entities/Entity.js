/* ---------- Entity (Base) ---------- */
class Entity{
  constructor(x,y){this.x=x;this.y=y;this.alive=true;}
  update(dt,game){}
  draw(ctx,game){}
}

export { Entity };
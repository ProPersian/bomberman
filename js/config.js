export const TILES = { FLOOR:0, WALL:1, BRICK:2, EXIT:3, HIDDEN_EXIT:4 };
export const DIRS  = [[1,0],[-1,0],[0,1],[0,-1]];

export const CONFIG = {
  COLS:15, ROWS:11, TILE:48,
  PLAYER_SPEED:2.4,
  ENEMY_BASE_SPEED:1.2,
  BOMB_FUSE:2.2,
  EXPLOSION_LIFE:0.45,
  LEVEL_TIME:180, ENDLESS_START_LEVEL:20,
  BASE_BOMBS:1, BASE_FIRE:1, BASE_SPEED:1,
  SHOP:{
    bomb :{name:'ظرفیت بمب',  emoji:'💣', cost:30, max:6},
    fire :{name:'شعاع انفجار',emoji:'🔥', cost:40, max:8},
    speed:{name:'سرعت حرکت',  emoji:'👟', cost:35, max:5},
    life :{name:'جانِ اضافه',  emoji:'❤️', cost:80, max:9},
    detonator:{name:'انفجار انتخابی',emoji:'🧨',cost:200,max:1},
    ghost :{name:'حالت روح', emoji:'👻', cost:200,max:1},
    stamina:{name:'نفسِ تند', emoji:'💨', cost:150, max:1},
  },
  ENEMIES:{
    normal:{emoji:'🎈', hp:1, speed:1.0, score:50,  coins:1, ai:'normal'},
    wanderer:{emoji:'🟢', hp:1, speed:1.0, score:90,  coins:2, ai:'wanderer'},
    warrior:{emoji:'🛡️', hp:2, speed:.9, score:120, coins:3, ai:'warrior'},
    hunter:{emoji:'😠', hp:2, speed:1.4, score:150, coins:3, ai:'chase'},
    ghost :{emoji:'👻', hp:1, speed:1.2, score:120, coins:2, ai:'ghost'},
  },
  PICKUPS:{
    coin   :{emoji:'🪙', weight:70},
    bomb   :{emoji:'💣', weight: 5},
    fire   :{emoji:'🔥', weight: 5},
    speed  :{emoji:'👟', weight: 5},
    life   :{emoji:'❤️', weight: 3},
    shield :{emoji:'🛡️', weight: 3},
    star   :{emoji:'⭐', weight:.4},
    stamina:{emoji:'💨', weight: 1},
  }
};
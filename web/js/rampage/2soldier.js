Rampage.Soldier = function () {

};
Rampage.Soldier.prototype = {
  sprite: null,
  firingDelay: 0,

  //strike: function (game, buildings) {
  //  this.isStriking = true;
  //  var hitBuilding = false;
  //  for (var i = 0; i < buildings.length; i++) {
  //    game.physics.arcade.overlap(this.strikePoint, buildings[i].buildingGroup, function (strikePoint, building) {
  //      hitBuilding = true;
  //      buildings[i].onStrike();
  //    }, null, this);
  //    if (hitBuilding) {
  //      break;
  //    }
  //  }
  //},
  //},
  fire: function(game, target) {
    this.isFiring = true;
    this.firingDelay = 100;
    var bullet = game.add.sprite(this.sprite.x, this.sprite.y, 'bullet');
    game.physics.arcade.enable(bullet);
    bullet.body.velocity.x =  (target.x - this.sprite.x);
    bullet.body.velocity.y =  (target.y - this.sprite.y);
  },
  move: function (direction, scale) {
    this.sprite.body.velocity.x = direction;
    this.sprite.animations.play('move');
    this.sprite.scale.x = scale;
  },
  create: function (game, x, y) {
    this.sprite = game.add.sprite(x, y, 'soldier');
    this.sprite.anchor.x = 0.5;
    this.sprite.animations.add('move', Rampage.Player.spritesheetMap.WALK, 10, true);
    this.sprite.animations.add('fire', Rampage.Player.spritesheetMap.FIRE, 10, true);
    game.physics.arcade.enable(this.sprite);
    this.sprite.body.gravity.y = 100;
    this.sprite.body.collideWorldBounds = true;
  },
  update: function (game, platforms, players) {
    game.physics.arcade.collide(this.sprite, platforms);
    game.debug.body(this.sprite);

    this.sprite.body.velocity.x = 0;
    if (this.firingDelay> 0) {
      this.firingDelay--;
    }

    var distanceX = players[0].sprite.x - this.sprite.x;
    var distanceXAbs = Math.abs(distanceX);
    if (distanceXAbs > 100) {
      distanceX = distanceX / Math.abs(distanceX);
      this.move(30 * distanceX, distanceX);
    }
    else if (distanceXAbs <= 100 && distanceXAbs != 0) {
      if(this.firingDelay == 0) {
        this.fire(game, players[0].sprite);
      }
    }


    var action = 'STAND';

    var frame = action;
    //if (this.isStriking) {
    //  frame += '_STRIKE';
    //}
    if (frame == 'STAND' && this.sprite.body.velocity.x != 0) {
      frame = 'MOVE';
    }
    this.frame(Rampage.Soldier.spritesheetMap[frame]);
  },
  frame: function (frame) {
    if (frame == Rampage.Soldier.spritesheetMap.MOVE) {
      this.sprite.animations.play('move');
    }
    else if (frame == Rampage.Soldier.FIRE) {
      this.sprite.animations.play('fire');
    }
    else {
      this.sprite.animations.stop();
      this.sprite.frame = frame;
    }
  }
};


Rampage.Soldier.preload = function (game) {
  game.load.spritesheet('soldier', 'assets/soldier.png', 32, 32);
  game.load.image('bullet', 'assets/bullet.png', 2, 2);
};

Rampage.Soldier.spritesheetMap = {
  STAND: 0,
  MOVE: [1, 2],
  FIRE: [3, 4]
};
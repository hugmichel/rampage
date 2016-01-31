Rampage.Soldier = function (rampageGame, hitPoints) {
  this.rampageGame = rampageGame;
  this.hitPoints = hitPoints;
};
Rampage.Soldier.prototype = {
  sprite: null,
  firingDelay: 0,
  MOVE_SPEED: 100,


  onStrike: function (strikePoint) {
    console.log('onStrike');

    var pixels = [];
    for (var y = 0; y < 50; y++) {
      for (var x = 0; x < 50; x++) {
        pixels.push([x, y]);
      }
    }

    var temp = pixels.slice(0);

    Phaser.ArrayUtils.shuffle(temp);

    var bmd = this.rampageGame.game.make.bitmapData(50, 50);
    for (var i = 0; i < 1024; i++) {
      var xy = temp.pop();
      bmd.rect(
        0 + xy[0],
        0 + xy[1],
        1,
        1,
        'rgb(0,0,0)'
      );
    }

    //var hitareaSprite = this.rampageGame.game.add.sprite(strikePoint.x - this.sprite.x, strikePoint.y - this.sprite.y, bmd);
    //this.sprite.addChild(hitareaSprite);
    console.log(strikePoint.x, strikePoint.y, this.sprite.x, this.sprite.y);
    
    this.sprite.body.velocity.y = -1000;
    this.sprite.body.velocity.x = ((this.sprite.x - strikePoint.x) / Math.abs(this.sprite.x - strikePoint.x)) * 800;
    this.hitPoints--;//(Math.max(this.hitPoints - 1, 0));

  },

  fire: function(rampageGame, game, target) {
    this.firingDelay = 100;
    rampageGame.addBullet(this.sprite, target);
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
    this.sprite.body.gravity.y = 8000;
    this.sprite.body.collideWorldBounds = true;
  },
  update: function (rampageGame, game, platforms, players) {
    game.physics.arcade.collide(this.sprite, platforms);
    game.debug.body(this.sprite);

    //this.sprite.body.velocity.x = 0;
    if (this.firingDelay> 0) {
      this.firingDelay--;
    }

    var distanceX = players[0].sprite.x - this.sprite.x;
    var distanceXAbs = Math.abs(distanceX);
    if (distanceXAbs > 100) {
      distanceX = distanceX / Math.abs(distanceX);
      this.move(this.MOVE_SPEED * distanceX, distanceX);
    }
    else if (distanceXAbs <= 100 && distanceXAbs != 0) {
      if(this.firingDelay == 0) {
        this.fire(rampageGame, game, players[0].sprite);
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
};

Rampage.Soldier.spritesheetMap = {
  STAND: 0,
  MOVE: [1, 2],
  FIRE: [3, 4]
};
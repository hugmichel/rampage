Rampage.Player = function () {
  this.isJumping = false;
  this.isStriking = false;
  this.isBuildingSnapped = false;
  this.hitPoints = 10;
};
Rampage.Player.prototype = {
  sprite: null,
  playerGroup: null,
  strikePoint: null,

  isJumping: false,
  isStriking: false,
  isBuildingSnapped: false,

  onBulletHit: function(){
    this.hitPoints--;
  },
  jump: function () {
    this.sprite.body.velocity.y = -350;
  },
  strike: function (game, buildings) {
    this.isStriking = true;
    var hitBuilding = false;
    for (var i = 0; i < buildings.length; i++) {
      game.physics.arcade.overlap(this.strikePoint, buildings[i].buildingGroup, function (strikePoint, building) {
        hitBuilding = true;
        buildings[i].onStrike();
      }, null, this);
      if (hitBuilding) {
        break;
      }
    }
  },
  move: function (direction, scale) {
    this.sprite.body.velocity.x = direction;
    this.sprite.animations.play('move');
    this.sprite.scale.x = scale;
  },
  create: function (game, x, y) {
    this.sprite = game.add.sprite(x, y, 'george');
    this.sprite.anchor.x = 0.5;
    this.sprite.animations.add('move', Rampage.Player.spritesheetMap.WALK, 10, true);
    this.sprite.animations.add('climb_up', Rampage.Player.spritesheetMap.CLIMB_UP, 10, true);
    this.sprite.animations.add('climb_down', Rampage.Player.spritesheetMap.CLIMB_DOWN, 10, true);

    game.physics.arcade.enable(this.sprite);
    this.sprite.body.gravity.y = 1000;
    this.sprite.body.collideWorldBounds = true;

    this.playerGroup = game.add.group();
    this.playerGroup.enableBody = true;
    this.strikePoint = this.playerGroup.create(x + 80, y - 80, 'star');
  },
  update: function (game, cursors, buildings, platforms) {
    game.physics.arcade.collide(this.sprite, platforms);
    game.debug.body(this.sprite);
    this.strikePoint.x = this.sprite.x + 35;
    this.strikePoint.y = this.sprite.y + 55;

    this.isBuildingSnapped = false;
    this.isStriking = false;
    this.isJumping = false;
    this.buildingSnappeds = [];
    for (var i = 0; i < buildings.length; i++) {
      game.physics.arcade.overlap(this.sprite, buildings[i].buildingGroup, this.playerSnapBuilding, null, this);
    }

    this.sprite.body.velocity.x = 0;
    this.sprite.body.allowGravity = true;

    if (cursors.left.isDown) {
      this.move(-300, -1);
    }
    else if (cursors.right.isDown) {
      this.move(300, 1);
    }

    if (cursors.spacebar.isDown) {
      this.strike(game, buildings);
    }

    var action = 'STAND';
    var lookDirection = 'SIDE';

    var controlMode = 'ground';
    var isOnRoof = false;

    if (this.buildingSnappeds.length == 2) {
      var notOnRoof = true;
      for (var i = 0; i < this.buildingSnappeds.length; i++) {
        var SpriteAboveBuildingOffset = (this.sprite.y + this.sprite.height) - this.buildingSnappeds[i].y;
        if (SpriteAboveBuildingOffset < 5) {
          notOnRoof = false;
        }
      }
      if (!notOnRoof) {
        isOnRoof = true;
      }
    }

    if (this.isBuildingSnapped) {
      controlMode = 'buildingSnapped';
    }
    if (controlMode == 'buildingSnapped' || isOnRoof) {
      this.sprite.body.allowGravity = false;
      this.sprite.body.velocity.y = 0;
      if (cursors.up.isDown && !isOnRoof) {
        this.sprite.body.velocity.y = -300;
      }
      else if (cursors.down.isDown) {
        this.sprite.body.velocity.y = 300;
      }
      action = 'CLIMB';
      if (isOnRoof) {
        action = 'STAND';
        controlMode = 'ground';
      }
    }

    if (controlMode == 'ground') {
      // Allow the this.sprite to jump if they are touching the ground
      // or when they are on building roof.
      if (cursors.jump.isDown && (this.sprite.body.touching.down || isOnRoof)) {
        this.jump();
      }
      if (!this.sprite.body.touching.down && !isOnRoof) {
        action = 'JUMP';
      }
    }

    if (cursors.down.isDown) {
      lookDirection = 'DOWN';
    }
    else if (cursors.up.isDown) {
      lookDirection = 'UP';
    }

    var frame = action + '_' + lookDirection;
    if (this.isStriking) {
      frame += '_STRIKE';
    }
    if (frame == 'STAND_SIDE' && this.sprite.body.velocity.x != 0) {
      frame = 'MOVE';
    }
    this.frame(Rampage.Player.spritesheetMap[frame]);
  },
  frame: function (frame) {
    if (frame == Rampage.Player.spritesheetMap.MOVE) {
      this.sprite.animations.play('move');
    }
    else if (frame == Rampage.Player.spritesheetMap.CLIMB_DOWN) {
      this.sprite.animations.play('climb_down');
    }
    else if (frame == Rampage.Player.spritesheetMap.CLIMB_UP) {
      this.sprite.animations.play('climb_up');
    }
    else {
      this.sprite.animations.stop();
      this.sprite.frame = frame;
    }
  },
  playerSnapBuilding: function (player, building) {
    this.isBuildingSnapped = true;
    this.buildingSnappeds.push(building);
  }
};

Rampage.Player.spritesheetMap = {
  STAND: 0,
  WALK: [1, 2],
  STAND_SIDE: 3,
  STAND_UP: 4,
  STAND_DOWN: 3,
  STAND_SIDE_STRIKE: 8,
  STAND_UP_STRIKE: 7,
  STAND_DOWN_STRIKE: 9,
  EAT: 10,
  JUMP_SIDE: 17,
  JUMP_UP: 19,
  JUMP_DOWN: 21,
  JUMP_OTHER_SIDE: 23,
  JUMP_SIDE_STRIKE: 18,
  JUMP_UP_STRIKE: 20,
  JUMP_DOWN_STRIKE: 22,
  JUMP_OTHER_SIDE_STRIKE: 24,
  CLIMB_SIDE: 42,
  CLIMB_UP: [39, 40],
  CLIMB_DOWN: [36, 37],
  CLIMB_SIDE_STRIKE: 34,
  CLIMB_UP_STRIKE: 38,
  CLIMB_DOWN_STRIKE: 35,
  CLIMB_REVERSE_STRIKE: 33,
  FALL_FEAR: 25,
  FALL_LONG: 26,
  MOVE: 123
};

Rampage.Player.preload = function (game) {
  game.load.spritesheet('george', 'assets/george.png', 114, 135);
  game.load.image('star', 'assets/star.png');
};
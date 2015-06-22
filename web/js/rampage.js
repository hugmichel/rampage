var Rampage = {};
Rampage.Building = function (totalHitPoints) {
  this.totalHitPoints = totalHitPoints | 0;
  this.hitPoints = this.totalHitPoints;
};
Rampage.Building.prototype = {
  buildingGroup: null,
  PART_HEIGHT: 64,
  PART_WIDTH: 64,

  hitPoints: 0,
  totalHitPoints: 0,

  create: function (game, xRoot, yRoot, width, height) {

    // -- buildings
    this.buildingGroup = game.add.group();
    this.buildingGroup.enableBody = true;

    for (var x = 0; x < width; x++) {
      for (var y = 0; y < height; y++) {
        var buildingPart = this.buildingGroup.create(xRoot + (this.PART_WIDTH * x),
                                                     yRoot - (this.PART_HEIGHT * (y + 1)),
                                                     'building',
                                                     y == 0 ? 2 : 1);
        buildingPart.width = this.PART_WIDTH;
        buildingPart.height = this.PART_HEIGHT;
        buildingPart.body.gravity.y = 200;
      }
    }
    game.physics.arcade.enable(this.buildingGroup);
  },
  update: function (game, platforms) {
    if (this.hitPoints > 0) {
      game.physics.arcade.collide(this.buildingGroup, platforms);
    }
    game.physics.arcade.collide(this.buildingGroup, this.buildingGroup);
  },
  onStrike: function () {
    this.hitPoints = Math.max(this.hitPoints - 1, 0);
    this.buildingGroup.tint = 0xFFFFFF * (this.hitPoints / this.totalHitPoints);
  }
};

Rampage.Building.preload = function (game) {
  game.load.spritesheet('building', 'assets/building.png', 64, 64, 2);
};
Rampage.Player = function () {
  this.isJumping = false;
  this.isStriking = false;
  this.isBuildingSnapped = false;
};
Rampage.Player.prototype = {
  sprite: null,
  playerGroup: null,
  strikePoint: null,

  isJumping: false,
  isStriking: false,
  isBuildingSnapped: false,

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
Rampage.Game = function (width, height) {
  this.players = [];
  this.soldiers = [];
  this.buildings = [];

  this.game = new Phaser.Game(width, height, Phaser.AUTO, '',
                             {
                               preload: this.preload.bind(this),
                               create: this.create.bind(this),
                               update: this.update.bind(this),
                               enableDebug: true
                             });
};
Rampage.Game.prototype = {
  game: null,

  platforms: null,
  buildings: null,
  soldiers: null,
  players: null,
  cursors: null,

  score: 0,
  scoreText: null,

  preload: function () {
    this.game.load.image('sky', 'assets/sky.png');
    this.game.load.image('ground', 'assets/platform.png');

    Rampage.Player.preload(this.game);
    Rampage.Building.preload(this.game);
    Rampage.Soldier.preload(this.game);
  },

  create: function () {
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.cursors.spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.cursors.jump = this.game.input.keyboard.addKey(Phaser.Keyboard.X);

    this.game.physics.startSystem(Phaser.Physics.ARCADE);



    // -- ground
    var skySprite = this.game.add.sprite(0, 0, 'sky');
    skySprite.width = this.game.width;
    this.platforms = this.game.add.group();
    this.platforms.enableBody = true;
    var ground = this.platforms.create(0, this.game.world.height - 64, 'ground');
    ground.width = this.game.width;
    ground.height = 64;
    ground.body.immovable = true;


    for(var i =0; i<3;  i++) {
      this.addBuilding(100 + i*200, 2 + i);
    }
    for (var i = 0; i < 1; i++) {
      this.addSoldier(400 + i * 100);
    }
    this.addPlayer(200);
  },
  update: function () {
    for (var i = 0; i < this.buildings.length; i++) {
      this.buildings[i].update(this.game, this.platforms);
    }
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].update(this.game, this.cursors, this.buildings, this.platforms);
    }
    for (var i = 0; i < this.soldiers.length; i++) {
      this.soldiers[i].update(this.game, this.platforms, this.players);
    }
  },
  addPlayer: function(x){
    var player = new Rampage.Player();
    player.create(this.game, x, this.game.world.height - 200);
    this.players.push(player);
  },
  addBuilding: function(x, height){
    var building = new Rampage.Building(1);
    building.create(this.game, x, this.game.world.height - 64, 2, height);
    this.buildings.push(building);
  },
  addSoldier: function(x){
    var soldier = new Rampage.Soldier();
    soldier.create(this.game, x, this.game.world.height - 110);
    this.soldiers.push(soldier);
  }
};
